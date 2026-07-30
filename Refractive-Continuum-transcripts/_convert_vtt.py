#!/usr/bin/env python3
"""Convert downloaded YouTube WebVTT captions into deduplicated text."""

from __future__ import annotations

import csv
import html
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent
TIMING_LINE = re.compile(r"^\d{2}:\d{2}:\d{2}\.\d{3}\s+-->")
TAG = re.compile(r"<[^>]+>")
VIDEO_ID = re.compile(r"\[([A-Za-z0-9_-]{11})\]")
SENTENCE_END = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9“\"'])")


def preferred_sources() -> list[Path]:
    """Choose one English caption source per video, favoring original-language captions."""
    by_id: dict[str, Path] = {}
    rank = {".en-orig.vtt": 0, ".en.vtt": 1}

    for path in sorted(ROOT.glob("*.vtt")):
        match = VIDEO_ID.search(path.name)
        if not match:
            continue
        video_id = match.group(1)
        current = by_id.get(video_id)
        if current is None:
            by_id[video_id] = path
            continue
        current_rank = min(
            (value for suffix, value in rank.items() if current.name.endswith(suffix)),
            default=99,
        )
        new_rank = min(
            (value for suffix, value in rank.items() if path.name.endswith(suffix)),
            default=99,
        )
        if new_rank < current_rank:
            by_id[video_id] = path

    return sorted(by_id.values(), reverse=True)


def cue_texts(path: Path) -> list[str]:
    """Extract normalized payload text from each VTT cue."""
    cues: list[str] = []
    payload: list[str] = []

    def flush() -> None:
        text = " ".join(payload)
        text = html.unescape(TAG.sub("", text))
        text = re.sub(r"\s+", " ", text).strip()
        if text:
            cues.append(text)
        payload.clear()

    for raw_line in path.read_text(encoding="utf-8-sig").splitlines():
        line = raw_line.strip()
        if TIMING_LINE.match(line):
            flush()
        elif not line:
            flush()
        elif line == "WEBVTT" or line.startswith(("Kind:", "Language:", "NOTE")):
            continue
        else:
            payload.append(line)
    flush()
    return cues


def deduplicate_rolling_cues(cues: list[str]) -> str:
    """Merge rolling YouTube captions by finding token overlap between cues."""
    transcript: list[str] = []
    for cue in cues:
        words = cue.split()
        overlap_limit = min(len(transcript), len(words))
        overlap = 0
        for size in range(overlap_limit, 0, -1):
            if transcript[-size:] == words[:size]:
                overlap = size
                break
        transcript.extend(words[overlap:])
    return " ".join(transcript)


def readable_paragraphs(text: str, target_words: int = 110) -> str:
    """Group sentences into moderately sized paragraphs without altering wording."""
    sentences = SENTENCE_END.split(text)
    paragraphs: list[str] = []
    current: list[str] = []
    count = 0
    for sentence in sentences:
        words = sentence.split()
        if current and count + len(words) > target_words:
            paragraphs.append(" ".join(current))
            current = []
            count = 0
        current.append(sentence.strip())
        count += len(words)
    if current:
        paragraphs.append(" ".join(current))
    return "\n\n".join(paragraphs)


def metadata_for(video_id: str) -> dict:
    matches = [
        path
        for path in ROOT.glob("*.info.json")
        if not path.name.startswith("NA - ")
        and VIDEO_ID.search(path.name)
        and VIDEO_ID.search(path.name).group(1) == video_id
    ]
    if not matches:
        return {}
    return json.loads(matches[0].read_text(encoding="utf-8"))


def format_date(raw: str | None) -> str:
    if not raw or len(raw) != 8:
        return raw or ""
    return f"{raw[:4]}-{raw[4:6]}-{raw[6:]}"


def format_duration(seconds: int | float | None) -> str:
    if seconds is None:
        return ""
    total = round(seconds)
    hours, remainder = divmod(total, 3600)
    minutes, secs = divmod(remainder, 60)
    return f"{hours}:{minutes:02d}:{secs:02d}" if hours else f"{minutes}:{secs:02d}"


def audit(rows: list[dict[str, str]]) -> None:
    playlist_files = list(ROOT.glob("NA - *.info.json"))
    if len(playlist_files) != 1:
        raise RuntimeError(
            f"Expected one playlist metadata file, found {len(playlist_files)}"
        )
    playlist = json.loads(playlist_files[0].read_text(encoding="utf-8"))
    expected_ids = {
        metadata["id"]
        for path in ROOT.glob("*.info.json")
        if not path.name.startswith("NA - ")
        for metadata in [json.loads(path.read_text(encoding="utf-8"))]
        if metadata.get("id")
    }
    declared_count = playlist.get("playlist_count")
    if declared_count != len(expected_ids):
        raise RuntimeError(
            f"Playlist declares {declared_count} videos, but found metadata for "
            f"{len(expected_ids)} unique IDs"
        )
    actual_ids = {row["video_id"] for row in rows}
    missing = sorted(expected_ids - actual_ids)
    unexpected = sorted(actual_ids - expected_ids)
    if missing or unexpected:
        raise RuntimeError(
            f"Transcript coverage mismatch: missing={missing}, unexpected={unexpected}"
        )
    if len(rows) != len(actual_ids):
        raise RuntimeError("Duplicate video IDs found in manifest rows")

    for row in rows:
        transcript_path = ROOT / row["transcript_file"]
        contents = transcript_path.read_text(encoding="utf-8")
        if int(row["word_count"]) == 0:
            raise RuntimeError(f"Empty transcript: {transcript_path.name}")
        if any(marker in contents for marker in ("WEBVTT", "-->", "<c>", "</c>")):
            raise RuntimeError(f"Unstripped VTT markup: {transcript_path.name}")

    print(
        f"Audit passed: {len(rows)}/{len(expected_ids)} public videos have "
        "nonempty text transcripts"
    )


def main() -> None:
    rows: list[dict[str, str]] = []
    for source in preferred_sources():
        match = VIDEO_ID.search(source.name)
        if not match:
            continue
        video_id = match.group(1)
        metadata = metadata_for(video_id)
        transcript = readable_paragraphs(deduplicate_rolling_cues(cue_texts(source)))
        output = source.with_name(
            re.sub(r"\.(?:en-orig|en)\.vtt$", ".txt", source.name)
        )
        title = metadata.get("title") or output.stem
        url = metadata.get("webpage_url") or f"https://www.youtube.com/watch?v={video_id}"
        upload_date = format_date(metadata.get("upload_date"))
        duration = format_duration(metadata.get("duration"))
        header = (
            f"{title}\n"
            f"{'=' * len(title)}\n\n"
            f"Video: {url}\n"
            f"Video ID: {video_id}\n"
            f"Upload date: {upload_date}\n"
            f"Duration: {duration}\n"
            f"Caption source: {source.name}\n\n"
            "Transcript\n"
            "----------\n\n"
        )
        output.write_text(header + transcript + "\n", encoding="utf-8")
        rows.append(
            {
                "upload_date": upload_date,
                "video_id": video_id,
                "title": title,
                "duration": duration,
                "url": url,
                "transcript_file": output.name,
                "caption_source": source.name,
                "word_count": str(len(transcript.split())),
            }
        )

    with (ROOT / "manifest.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "upload_date",
                "video_id",
                "title",
                "duration",
                "url",
                "transcript_file",
                "caption_source",
                "word_count",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} transcripts and manifest.csv")
    audit(rows)


if __name__ == "__main__":
    main()
