#!/usr/bin/env node

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const inputPath = resolve(process.argv[2] ?? join(scriptDirectory, "RCCM-Condensed.tex"));
const inputBasename = basename(inputPath);
const documentBasename = basename(inputPath, ".tex");
const outputPath = resolve(
  process.argv[3] ?? join(dirname(inputPath), `${documentBasename}.html`),
);

const original = readFileSync(inputPath, "utf8");

function orderedLabels(prefix) {
  const labels = new Map();
  const pattern = new RegExp(`\\\\label\\{(${prefix}:[^}]+)\\}`, "g");
  for (const match of original.matchAll(pattern)) {
    if (!labels.has(match[1])) labels.set(match[1], labels.size + 1);
  }
  return labels;
}

const equationNumbers = orderedLabels("eq");
const boxNumbers = orderedLabels("box");

function readBalanced(text, start, opening, closing) {
  if (text[start] !== opening) throw new Error(`Expected ${opening} at offset ${start}`);
  let depth = 0;
  for (let index = start; index < text.length; index += 1) {
    const character = text[index];
    const escaped = index > 0 && text[index - 1] === "\\";
    if (!escaped && character === opening) depth += 1;
    if (!escaped && character === closing) {
      depth -= 1;
      if (depth === 0) {
        return { value: text.slice(start + 1, index), end: index + 1 };
      }
    }
  }
  throw new Error(`Unclosed ${opening}${closing} group at offset ${start}`);
}

function optionTitle(options) {
  const marker = options.match(/(?:^|,)\s*title\s*=\s*/);
  if (!marker) return "";
  const start = marker.index + marker[0].length;
  if (options[start] === "{") return readBalanced(options, start, "{", "}").value;
  const end = options.indexOf(",", start);
  return options.slice(start, end === -1 ? undefined : end).trim();
}

function htmlId(value) {
  return value
    .replace(/^box:/, "box-")
    .replace(/^eq:/, "eq-")
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function transformBoxes(source) {
  const opening = "\\begin{tcolorbox}";
  const closing = "\\end{tcolorbox}";
  let cursor = 0;
  let serial = 0;
  let output = "";

  while (true) {
    const start = source.indexOf(opening, cursor);
    if (start === -1) {
      output += source.slice(cursor);
      break;
    }

    output += source.slice(cursor, start);
    let bodyStart = start + opening.length;
    let options = "";
    if (source[bodyStart] === "[") {
      const parsed = readBalanced(source, bodyStart, "[", "]");
      options = parsed.value;
      bodyStart = parsed.end;
    }

    const end = source.indexOf(closing, bodyStart);
    if (end === -1) throw new Error(`Unclosed tcolorbox at offset ${start}`);

    serial += 1;
    let body = source.slice(bodyStart, end).trim();
    let title = optionTitle(options);
    const label = title.match(/\\label\{(box:[^}]+)\}/)?.[1];
    const referencedBox = title.match(/\\ref\{(box:[^}]+)\}/)?.[1];

    let type;
    if (options.includes("recallbox")) type = "recall";
    else if (label) type = "cheat";
    else if (serial === 1) type = "abstract";
    else if (title.includes("TABLE 1:")) type = "nomenclature";
    else type = "preface";

    if (type === "abstract") {
      title = "Abstract & How to Use This Manual";
      body = body.replace(
        /\\begin\{center\}\s*\\textbf\{ABSTRACT \\& HOW TO USE THIS MANUAL\}\s*\\end\{center\}/,
        "",
      );
    }

    const boxNumber = label ? boxNumbers.get(label) : undefined;
    title = title
      .replace(/\\refstepcounter\{cheatnum\}/g, "")
      .replace(/\\label\{box:[^}]+\}/g, "")
      .replace(/\\thecheatnum/g, boxNumber ? String(boxNumber) : "")
      .replace(/\\scriptsize/g, "")
      .replace(/\\hfill/g, " ")
      .trim();

    const typeSerial = referencedBox
      ? `recall-${htmlId(referencedBox)}`
      : label
        ? htmlId(label)
        : `${type}-${serial}`;
    const level =
      type === "recall" ? 4 : type === "cheat" ? 3 : 2;

    output += [
      "\\begin{quote}",
      "",
      `RCCMBOXSTART ${type} ${typeSerial} ${level}`,
      "",
      `\\textbf{RCCMBOXTITLE{} ${title}}`,
      "",
      body,
      "",
      "\\end{quote}",
    ].join("\n");
    cursor = end + closing.length;
  }

  return output;
}

function transformBibliography(source) {
  const bibliography = source.match(
    /\\begin\{thebibliography\}\{[^}]*\}([\s\S]*?)\\end\{thebibliography\}/,
  );
  if (!bibliography) return source;

  const entries = [
    ...bibliography[1].matchAll(
      /\\bibitem\{([^}]+)\}\s*([\s\S]*?)(?=\\bibitem\{|$)/g,
    ),
  ].map((match, index) => ({
    key: match[1],
    body: match[2].trim(),
    number: index + 1,
  }));
  const entryByKey = new Map(entries.map((entry) => [entry.key, entry]));

  let transformed = source.replace(/\\cite\{([^}]+)\}/g, (_, keys) =>
    keys
      .split(",")
      .map((key) => key.trim())
      .map((key) => {
        const entry = entryByKey.get(key);
        return entry
          ? `\\hyperref[ref:${key}]{[${entry.number}]}`
          : `[${key}]`;
      })
      .join(", "),
  );

  const replacement = [
    "\\section*{References}",
    "\\begin{enumerate}",
    ...entries.map(
      ({ key, body }) => `\\item \\hypertarget{ref:${key}}{} ${body}`,
    ),
    "\\end{enumerate}",
  ].join("\n\n");

  return transformed.replace(bibliography[0], replacement);
}

let source = transformBibliography(transformBoxes(original));

source = source
  .replace(
    /\\begin\{center\}\s*\\LARGE\\textbf\{PART I: THE CHEAT SHEET\}\s*\\end\{center\}/,
    "\\section*{PART I: THE CHEAT SHEET}",
  )
  .replace(
    /\\begin\{center\}\s*\\LARGE\\textbf\{PART II: FORMAL DERIVATIONS\}\s*\\label\{sec:part2\}\s*\\end\{center\}/,
    "\\section*{PART II: FORMAL DERIVATIONS}\\label{sec:part2}",
  )
  .replace(
    /\\begin\{center\}\s*\\LARGE\\textbf\{Condensed Version\}\\\\\s*\\vspace\{[^}]+\}\s*\\small\\textit\{([\s\S]*?)\}\s*\\end\{center\}/,
    "\\subsection*{Condensed Version}\n\\textit{$1}",
  )
  .replace(/\\part\*\{/g, "\\subsection*{")
  .replace(/\\section\{/g, "\\subsubsection{")
  .replace(
    /\\noindent\\textbf\{\\large\s*\\color\{academiabrown\}\s*([^}]+)\}/g,
    "\\subsection*{$1}",
  )
  .replace(/\\begin\{multicols\}\{2\}|\\end\{multicols\}/g, "")
  .replace(/\\(?:vspace|hspace)\*?\{[^}]*\}/g, "")
  .replace(/\\(?:newpage|clearpage)\b/g, "")
  .replace(
    /\\hyperlink\{(https?:\/\/[^}]+)\}\{([^}]*)\}/g,
    "\\href{$1}{$2}",
  )
  .replace(/\\space\b/g, "\\,");

// Pandoc's MathML reader does not support the visual \cancel macro. Preserve
// the equation itself in the HTML reading copy; the TeX remains canonical.
source = source.replace(/\\cancel\{([^{}]*)\}/g, "$1");

for (const [label, number] of boxNumbers) {
  source = source.replaceAll(`\\ref{${label}}`, String(number));
}

for (const [label, number] of equationNumbers) {
  source = source
    .replaceAll(`\\ref{${label}}`, String(number))
    .replaceAll(`\\label{${label}}`, `\\tag{${number}}`);
}

const temporaryDirectory = mkdtempSync(join(tmpdir(), "rccm-html-"));
const preparedPath = join(temporaryDirectory, `${documentBasename}.prepared.tex`);
const filterPath = join(temporaryDirectory, "semantic-boxes.lua");
const templatePath = join(temporaryDirectory, "semantic.html");
const draftPath = join(temporaryDirectory, `${documentBasename}.draft.html`);

const filter = String.raw`
function BlockQuote(block)
  if #block.content < 2 then return nil end
  local marker = pandoc.utils.stringify(block.content[1])
  local box_type, box_id, heading_level =
    marker:match("^RCCMBOXSTART%s+(%S+)%s+(%S+)%s+(%d+)$")
  if not box_type then return nil end

  table.remove(block.content, 1)
  local title_block = table.remove(block.content, 1)
  if not title_block or not title_block.content then
    error("RCCM box is missing its title block: " .. box_id)
  end

  local title = title_block.content
  if #title == 1 and title[1].tag == "Strong" then
    title = title[1].content
  end
  if #title > 0 and title[1].tag == "Str" then
    title[1].text = title[1].text:gsub("^RCCMBOXTITLE", "")
    if title[1].text == "" then table.remove(title, 1) end
  end
  if #title > 0 and title[1].tag == "Space" then table.remove(title, 1) end

  local tag = box_type == "recall" and "aside" or "section"
  local title_id = box_id .. "-title"
  local opening = string.format(
    '<%s id="%s" class="rccm-box rccm-%s" aria-labelledby="%s">',
    tag,
    box_id,
    box_type,
    title_id
  )

  local heading = {
    pandoc.RawInline("html", string.format('<h%s id="%s">', heading_level, title_id))
  }
  for _, inline in ipairs(title) do table.insert(heading, inline) end
  table.insert(heading, pandoc.RawInline("html", "</h" .. heading_level .. ">"))

  local result = {
    pandoc.RawBlock("html", opening),
    pandoc.Plain(heading)
  }
  for _, child in ipairs(block.content) do table.insert(result, child) end
  table.insert(result, pandoc.RawBlock("html", "</" .. tag .. ">"))
  return result
end
`;

const template = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="Pandoc">
$for(author-meta)$<meta name="author" content="$author-meta$">
$endfor$<title>$pagetitle$</title>
</head>
<body>
<header id="title-block-header">
$if(title)$<h1>$title$</h1>
$endif$$for(author)$<p class="author">$author$</p>
$endfor$$if(date)$<p class="date">$date$</p>
$endif$$if(canonicalsource)$<p class="source-note">HTML reading copy. Canonical source: <a href="$canonicalsource$"><code>$canonicalsource$</code></a>.</p>
$endif$</header>
$if(toc)$<nav id="contents" aria-labelledby="contents-heading">
<h2 id="contents-heading">Contents</h2>
$toc$
</nav>
$endif$<main>
$body$
</main>
</body>
</html>
`;

writeFileSync(preparedPath, source);
writeFileSync(filterPath, filter);
writeFileSync(templatePath, template);

const pandoc = spawnSync(
  "pandoc",
  [
    preparedPath,
    "--from=latex+raw_tex",
    "--to=html5",
    "--standalone",
    "--mathml",
    "--toc",
    "--toc-depth=3",
    "--section-divs",
    "--strip-comments",
    `--metadata=canonicalsource:${inputBasename}`,
    `--lua-filter=${filterPath}`,
    `--template=${templatePath}`,
    `--output=${draftPath}`,
  ],
  { encoding: "utf8" },
);

if (pandoc.stderr) process.stderr.write(pandoc.stderr);
if (pandoc.status !== 0) {
  rmSync(temporaryDirectory, { recursive: true, force: true });
  process.exit(pandoc.status ?? 1);
}

let html = readFileSync(draftPath, "utf8");
const anchoredEquationNumbers = new Set();
const equationByNumber = new Map(
  [...equationNumbers].map(([label, number]) => [String(number), htmlId(label)]),
);

html = html.replace(
  /<math display="block"[\s\S]*?<\/math>/g,
  (math) => {
    const anchors = [];
    const labels = [];
    const labelsInThisDisplay = new Set();
    for (const match of math.matchAll(/\\tag\{(\d+)\}/g)) {
      const number = match[1];
      const id = equationByNumber.get(number);
      if (id && !anchoredEquationNumbers.has(number)) {
        anchoredEquationNumbers.add(number);
        anchors.push(`<span id="${id}" class="equation-anchor"></span>`);
      }
      if (id && !labelsInThisDisplay.has(number)) {
        labelsInThisDisplay.add(number);
        labels.push(
          `<a href="#${id}" aria-label="Equation ${number}">(${number})</a>`,
        );
      }
    }
    const visibleLabels =
      labels.length === 0
        ? ""
        : `<span class="equation-labels">${labels.length === 1 ? "Equation" : "Equations"} ${labels.join(" ")}</span>`;
    return `${anchors.join("")}${math}${visibleLabels}`;
  },
);

html = html
  .replace(/\s+style="[^"]*"/g, "")
  .replace(/<div class="center">([\s\S]*?)<\/div>/g, "$1")
  .replace(/[ \t]+$/gm, "")
  .replace(/\n{3,}/g, "\n\n");

writeFileSync(outputPath, html);
rmSync(temporaryDirectory, { recursive: true, force: true });

process.stdout.write(
  [
    `Wrote ${outputPath}`,
    `Boxes mapped: ${boxNumbers.size}`,
    `Equation labels mapped: ${equationNumbers.size}`,
    `Equation anchors emitted: ${anchoredEquationNumbers.size}`,
  ].join("\n") + "\n",
);
