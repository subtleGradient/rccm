import Base

# Sharp, monochrome 5x7 labels. These glyph rows are authored here; no font
# data or source was copied from the Bend ray-tracer demo (Apache-2.0).
# Coordinates are image coordinates: x right, y down. Pixel cells and boxes
# are half-open. Integer origins and integer scales (2 or 3) give crisp text.
#
# Prepare on the CPU ONCE, outside the per-pixel shader:
#   +title = Ink.prepare("FOAM LAB")
#   Ink.text_hit(title, x, y, 24.0, 20.0, 3.0)
# Text is Data. A miss rejects the whole label before reading any glyphs.
# A hit visits only the prefix up to its character, not every glyph's bits.
# Store short HUD labels separately rather than preparing an entire paragraph.
# Parallelize the containing Image traversal, not these tiny pixel helpers.

type Glyph is Data:
  Glyph{upper: U32, lower: U32}

type Text is Data:
  Text{count: U32, glyphs: List<&2, Glyph>}

# Rows are five-bit words, most significant bit at the left. Two U32s
# avoid a 35-bit bitmap overflowing; rows 0..3 and 4..6 are packed separately.
def rows(a: U32, b: U32, c: U32, d: U32, e: U32, f: U32, g: U32) -> Glyph:
  Glyph{
    (a .|. b << 5n .|. c << 10n .|. d << 15n : U32),
    (e .|. f << 5n .|. g << 10n : U32)
  }

# CPU-only ASCII lookup. Unsupported characters (including lowercase and
# newlines) deliberately occupy one blank cell, just like space.
def glyph(code: Nat) -> Glyph:
  match code:
    case 65n:
      rows(14, 17, 17, 31, 17, 17, 17) # A
    case 66n:
      rows(30, 17, 17, 30, 17, 17, 30) # B
    case 67n:
      rows(14, 17, 16, 16, 16, 17, 14) # C
    case 68n:
      rows(30, 17, 17, 17, 17, 17, 30) # D
    case 69n:
      rows(31, 16, 16, 30, 16, 16, 31) # E
    case 70n:
      rows(31, 16, 16, 30, 16, 16, 16) # F
    case 71n:
      rows(14, 17, 16, 23, 17, 17, 15) # G
    case 72n:
      rows(17, 17, 17, 31, 17, 17, 17) # H
    case 73n:
      rows(14, 4, 4, 4, 4, 4, 14) # I
    case 74n:
      rows(7, 2, 2, 2, 18, 18, 12) # J
    case 75n:
      rows(17, 18, 20, 24, 20, 18, 17) # K
    case 76n:
      rows(16, 16, 16, 16, 16, 16, 31) # L
    case 77n:
      rows(17, 27, 21, 21, 17, 17, 17) # M
    case 78n:
      rows(17, 25, 21, 19, 17, 17, 17) # N
    case 79n:
      rows(14, 17, 17, 17, 17, 17, 14) # O
    case 80n:
      rows(30, 17, 17, 30, 16, 16, 16) # P
    case 81n:
      rows(14, 17, 17, 17, 21, 18, 13) # Q
    case 82n:
      rows(30, 17, 17, 30, 20, 18, 17) # R
    case 83n:
      rows(15, 16, 16, 14, 1, 1, 30) # S
    case 84n:
      rows(31, 4, 4, 4, 4, 4, 4) # T
    case 85n:
      rows(17, 17, 17, 17, 17, 17, 14) # U
    case 86n:
      rows(17, 17, 17, 17, 17, 10, 4) # V
    case 87n:
      rows(17, 17, 17, 21, 21, 21, 10) # W
    case 88n:
      rows(17, 17, 10, 4, 10, 17, 17) # X
    case 89n:
      rows(17, 17, 10, 4, 4, 4, 4) # Y
    case 90n:
      rows(31, 1, 2, 4, 8, 16, 31) # Z
    case 48n:
      rows(14, 17, 19, 21, 25, 17, 14) # 0 (slashed)
    case 49n:
      rows(4, 12, 4, 4, 4, 4, 14) # 1
    case 50n:
      rows(14, 17, 1, 2, 4, 8, 31) # 2
    case 51n:
      rows(30, 1, 1, 14, 1, 1, 30) # 3
    case 52n:
      rows(2, 6, 10, 18, 31, 2, 2) # 4
    case 53n:
      rows(31, 16, 16, 30, 1, 1, 30) # 5
    case 54n:
      rows(14, 16, 16, 30, 17, 17, 14) # 6
    case 55n:
      rows(31, 1, 2, 4, 8, 8, 8) # 7
    case 56n:
      rows(14, 17, 17, 14, 17, 17, 14) # 8
    case 57n:
      rows(14, 17, 17, 15, 1, 1, 14) # 9
    case 37n:
      rows(24, 25, 2, 4, 8, 19, 3) # %
    case 43n:
      rows(0, 4, 4, 31, 4, 4, 0) # +
    case 45n:
      rows(0, 0, 0, 31, 0, 0, 0) # -
    case 46n:
      rows(0, 0, 0, 0, 0, 6, 6) # .
    case 58n:
      rows(0, 6, 6, 0, 6, 6, 0) # :
    case 47n:
      rows(1, 1, 2, 4, 8, 16, 16) # /
    case 61n:
      rows(0, 0, 31, 0, 31, 0, 0) # =
    case 91n:
      rows(14, 8, 8, 8, 8, 8, 14) # [
    case 93n:
      rows(14, 2, 2, 2, 2, 2, 14) # ]
    case _:
      Glyph{0, 0}

def prepend(g: Glyph, text: Text) -> Text:
  match text:
    case Text{count, glyphs}:
      Text{(count + 1 : U32), Con{g, glyphs}}

def prepare(label: String) -> Text:
  match label:
    case SNil{}:
      Text{0, Nil{}}
    case SCon{h, t}:
      prepend(glyph(U32.to_nat(Char.to_u32(h))), prepare(t))

# Width includes the one-column tracking after the final glyph.
def text_width(text: Text, scale: F32) -> F32:
  match text:
    case Text{count, glyphs}:
      (U32.to_f32(count) * 6.0 * F32.max(0.0, scale) : F32)

def inside_rect(
  +x: F32, +y: F32, +left: F32, +top: F32, width: F32, height: F32
) -> Bool:
  (x >= left : F32) && (y >= top : F32) &&
  (x < (left + width : F32) : F32) &&
  (y < (top + height : F32) : F32)

def glyph_at(gs: List<&2, Glyph>, index: Nat) -> Glyph:
  match gs index:
    case Nil{} _:
      Glyph{0, 0}
    case Con{h, t} 0n:
      h
    case Con{h, t} 1n+p:
      glyph_at(t, p)

def bitmap_word(lower_row: Bool, g: Glyph) -> U32:
  match lower_row g:
    case False{} Glyph{upper, lower}:
      upper
    case True{} Glyph{upper, lower}:
      lower

def glyph_pixel(g: Glyph, +column: U32, +row: U32) -> Bool:
  bit = (bitmap_word((row >= 4 : U32), g) >>
    U32.to_nat((row % 4 * 5 + 4 - column : U32)) .&. 1 : U32)
  (column < 5 : U32) && (row < 7 : U32) &&
  U32.is_eq(bit, 1)

def hit_cell(gs: List<&2, Glyph>, +x: U32, y: U32) -> Bool:
  glyph_pixel(glyph_at(gs, U32.to_nat((x / 6 : U32))), (x % 6 : U32), y)

def hit_bounds(hit: Bool, gs: List<&2, Glyph>, x: F32, y: F32, +scale: F32) -> Bool:
  match hit:
    case False{}:
      False{}
    case True{}:
      hit_cell(gs, F32.to_u32((x / scale : F32)), F32.to_u32((y / scale : F32)))

# Coordinates must be finite; invalid/nonpositive scale never reaches F32
# division or conversion. Empty text and negative-size rectangles never hit.
def text_hit(text: Text, +x: F32, +y: F32, +left: F32, +top: F32, +scale: F32) -> Bool:
  match text:
    case Text{count, glyphs}:
      hit_bounds(
        (scale > 0.0 : F32) && (scale < (1.0 / 0.0 : F32) : F32) &&
        inside_rect(x, y, left, top, (U32.to_f32(count) * 6.0 * scale : F32), (7.0 * scale : F32)),
        glyphs, (x - left : F32), (y - top : F32), scale)
