import Base
import ./ink.bend as Ink

def same(a: Bool, b: Bool) -> Bool:
  match a:
    case True{}:
      b
    case False{}:
      Bool.not(b)

# Numeric-runtime regressions, NOT an F32 proof. Independent visual fixtures
# check all 35 cells, so mirrored, shifted and accidentally filled glyphs fail.
def fixture_cells(pixels: String, +text: Ink.Text, +index: U32) -> Bool:
  match pixels:
    case SNil{}:
      True{}
    case SCon{h, t}:
      same(Ink.text_hit(text, U32.to_f32((index % 5 : U32)),
        U32.to_f32((index / 5 : U32)), 0.0, 0.0, 1.0),
        U32.is_eq(Char.to_u32(h), 35)) &&
      fixture_cells(t, text, (index + 1 : U32))

def bitmap(label: String, a: String, b: String, c: String, d: String, e: String, f: String, g: String) -> Bool:
  fixture_cells(String.concat([a, b, c, d, e, f, g]), Ink.prepare(label), 0)

def fixtures() -> Bool:
  bitmap("A", ".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#") &&
  bitmap("R", "####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#") &&
  bitmap("0", ".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###.") &&
  bitmap("2", ".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####") &&
  bitmap("+", ".....", "..#..", "..#..", "#####", "..#..", "..#..", ".....") &&
  bitmap("-", ".....", ".....", ".....", "#####", ".....", ".....", ".....") &&
  bitmap(".", ".....", ".....", ".....", ".....", ".....", "..##.", "..##.") &&
  bitmap(":", ".....", "..##.", "..##.", ".....", "..##.", "..##.", ".....") &&
  bitmap("/", "....#", "....#", "...#.", "..#..", ".#...", "#....", "#....") &&
  bitmap("=", ".....", ".....", "#####", ".....", "#####", ".....", ".....") &&
  bitmap("[", ".###.", ".#...", ".#...", ".#...", ".#...", ".#...", ".###.") &&
  bitmap("]", ".###.", "...#.", "...#.", "...#.", "...#.", "...#.", ".###.") &&
  bitmap(" ", ".....", ".....", ".....", ".....", ".....", ".....", ".....") &&
  bitmap("a", ".....", ".....", ".....", ".....", ".....", ".....", ".....")

def placement() -> Bool:
  +a = Ink.prepare("A")
  +pair = Ink.prepare("A A")
  Ink.text_hit(a, 12.0, 20.0, 10.0, 20.0, 2.0) &&
  Ink.text_hit(a, 13.99, 21.99, 10.0, 20.0, 2.0) &&
  Bool.not(Ink.text_hit(a, 11.99, 20.0, 10.0, 20.0, 2.0)) &&
  Ink.text_hit(a, 10.0, 22.0, 10.0, 20.0, 2.0) &&
  Bool.not(Ink.text_hit(a, 9.99, 22.0, 10.0, 20.0, 2.0)) &&
  Bool.not(Ink.text_hit(a, 12.0, 19.99, 10.0, 20.0, 2.0)) &&
  Bool.not(Ink.text_hit(a, 20.0, 22.0, 10.0, 20.0, 2.0)) &&
  Bool.not(Ink.text_hit(a, 22.0, 22.0, 10.0, 20.0, 2.0)) &&
  Ink.text_hit(a, 10.0, 33.99, 10.0, 20.0, 2.0) &&
  Bool.not(Ink.text_hit(a, 10.0, 34.0, 10.0, 20.0, 2.0)) &&
  Bool.not(Ink.text_hit(pair, 7.0, 0.0, 0.0, 0.0, 1.0)) &&
  Ink.text_hit(pair, 13.0, 0.0, 0.0, 0.0, 1.0) &&
  Bool.not(Ink.text_hit(pair, 18.0, 0.0, 0.0, 0.0, 1.0)) &&
  F32.is_eq(Ink.text_width(pair, 2.0), 36.0) &&
  F32.is_eq(Ink.text_width(Ink.prepare(""), 2.0), 0.0) &&
  Bool.not(Ink.text_hit(Ink.prepare(""), 0.0, 0.0, 0.0, 0.0, 1.0)) &&
  Bool.not(Ink.text_hit(a, 0.0, 0.0, 0.0, 0.0, 0.0)) &&
  Bool.not(Ink.text_hit(a, 0.0, 0.0, 0.0, 0.0, F32.neg(1.0))) &&
  Bool.not(Ink.text_hit(a, 0.0, 0.0, 0.0, 0.0, (0.0 / 0.0 : F32))) &&
  Bool.not(Ink.text_hit(a, 0.0, 0.0, 0.0, 0.0, (1.0 / 0.0 : F32))) &&
  Ink.text_hit(a, 0.5, 0.0, 0.0, 0.0, 0.5)

def rectangles() -> Bool:
  Ink.inside_rect(10.0, 20.0, 10.0, 20.0, 5.0, 7.0) &&
  Ink.inside_rect(14.99, 26.99, 10.0, 20.0, 5.0, 7.0) &&
  Bool.not(Ink.inside_rect(15.0, 20.0, 10.0, 20.0, 5.0, 7.0)) &&
  Bool.not(Ink.inside_rect(10.0, 27.0, 10.0, 20.0, 5.0, 7.0)) &&
  Bool.not(Ink.inside_rect(9.99, 20.0, 10.0, 20.0, 5.0, 7.0)) &&
  Bool.not(Ink.inside_rect(10.0, 19.99, 10.0, 20.0, 5.0, 7.0)) &&
  Bool.not(Ink.inside_rect(10.0, 20.0, 10.0, 20.0, 0.0, 7.0)) &&
  Bool.not(Ink.inside_rect(10.0, 20.0, 10.0, 20.0, 5.0, 0.0)) &&
  Bool.not(Ink.inside_rect(10.0, 20.0, 10.0, 20.0, F32.neg(1.0), 7.0)) &&
  Bool.not(Ink.inside_rect(10.0, 20.0, 10.0, 20.0, 5.0, F32.neg(1.0))) &&
  Ink.inside_rect(F32.neg(2.0), F32.neg(3.0), F32.neg(2.0), F32.neg(3.0), 1.0, 1.0)

def verdict(ok: Bool, name: String) -> IO(Unit):
  match ok:
    case False{}:
      IO.die(Unit, 1, String.append("FAIL: ink ", name))
    case True{}:
      IO.print(String.append("PASS: ink ", name))

def main() -> IO(Unit):
  do IO<Unit>:
    verdict(fixtures(), "bitmap fixtures")
    verdict(placement(), "text placement and invalid scale")
    verdict(rectangles(), "half-open rectangles")
