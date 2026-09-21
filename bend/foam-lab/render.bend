import Base
import ./field.bend as F
import ./control.bend as C
import ./ink.bend as Ink

# Presentation only. Every contour is a level set of an actual supplied frame.
# Internal swatches are RGBA; pixel exports native Window RGB24 (0x00RRGGBB).
type Ghosts is Data:
  NoGhosts{}
  Ghost{frame: F.Frame, older: Ghosts}

type Labels is Data:
  Labels{title: Ink.Text, subtitle: Ink.Text, mode: Ink.Text,
    capacity: Ink.Text, status: Ink.Text, hints: Ink.Text, warning: Ink.Text,
    threshold: Ink.Text, inspector: Ink.Text, boundary: Ink.Text, time: Ink.Text}

type Scene is Data:
  Scene{frame: F.Frame, ghosts: Ghosts, view: C.View, playback: C.Playback,
    onion: Bool, inspect: Bool, cutoff: F32, cursor_x: F32, cursor_y: F32,
    minimum: F32, history_length: U32, selected: U32, labels: Labels}

def pick(c: Bool, a: F32, b: F32) -> F32:
  match c:
    case True{}: a
    case False{}: b

def word(c: Bool, a: U32, b: U32) -> U32:
  match c:
    case True{}: a
    case False{}: b

def mode_name(v: C.View) -> String:
  match v:
    case C.Medium{}: "MEDIUM  /  TAB"
    case C.Voids{}: "VOIDS   /  TAB"

def status_name(p: C.Playback) -> String:
  match p:
    case C.Playing{}: "LIVE"
    case C.Paused{}: "HELD"
    case C.AtBoundary{}: "SAMPLE LIMIT"

def boundary_name(p: C.Playback) -> String:
  match p:
    case C.Playing{}: ""
    case C.Paused{}: ""
    case C.AtBoundary{}: "NONPOSITIVE CAPACITY SAMPLE / NO POST-YIELD MODEL / U WITHDRAW OR SCRUB BACK"

def percent_sign(negative: Bool, +n: U32) -> String:
  match negative:
    case True{}: "-" ++ U32.show((n / 10 : U32)) ++ "." ++ U32.show((n % 10 : U32)) ++ "%"
    case False{}: U32.show((n / 10 : U32)) ++ "." ++ U32.show((n % 10 : U32)) ++ "%"

def percent(+q: F32) -> String:
  percent_sign((q < 0.0 : F32), F32.to_u32(F32.abs((1000.0 * q : F32))))

def world_x(x: F32) -> F32:
  ((x - 64.0) / 560.0 : F32)

def world_y(y: F32) -> F32:
  ((y - 96.0) / 560.0 : F32)

def sample_text(sample: F.Sample) -> String:
  match sample:
    case F.Sample{q, gx, gy}: "LOCAL Q " ++ percent(q)

def time_text(frame: F.Frame) -> String:
  match frame:
    case F.Frame{time, _, _, _, _}:
      +ticks = F32.to_u32((time * 100.0 : F32))
      "T " ++ U32.show((ticks / 100 : U32)) ++ "." ++
      U32.show((ticks / 10 % 10 : U32)) ++ U32.show((ticks % 10 : U32))

def inspect_inside(enabled: Bool, +frame: F.Frame, x: F32, y: F32) -> String:
  match enabled:
    case False{}: ""
    case True{}:
      sample_text(F.sample(frame, world_x(x), world_y(y)))

def inspect_text(enabled: Bool, frame: F.Frame, +x: F32, +y: F32) -> String:
  inspect_inside(enabled && Ink.inside_rect(x, y, 64.0, 96.0, 896.0, 560.0), frame, x, y)

# Labels are prepared once per view, never inside the shader.
def make_scene(+frame: F.Frame, ghosts: Ghosts, +view: C.View,
    +playback: C.Playback, onion: Bool, +inspect: Bool, +cutoff: F32,
    +cursor_x: F32, +cursor_y: F32, +minimum: F32,
    history_length: U32, selected: U32) -> Scene:
  labels = {Labels{
    Ink.prepare("FOAM"),
    Ink.prepare("THE OTHER SIDE OF EMPTY"),
    Ink.prepare(mode_name(view)),
    Ink.prepare("SAMPLED MIN Q " ++ percent(minimum)),
    Ink.prepare(status_name(playback)),
    Ink.prepare("SPACE PAUSE   DRAG LOAD   TAB INVERT   O TRAILS   I PROBE   +/- CUT   U WITHDRAW   R REMIX"),
    Ink.prepare("DRIVEN CAPACITY - NOT A BUBBLE SOLVER"),
    Ink.prepare("CUT " ++ percent(cutoff)),
    Ink.prepare(inspect_text(inspect, frame, cursor_x, cursor_y)),
    Ink.prepare(boundary_name(playback)),
    Ink.prepare(time_text(frame))} : Labels}
  Scene{frame, ghosts, view, playback, onion, inspect, cutoff, cursor_x,
    cursor_y, minimum, history_length, selected, labels}

def clamp(x: F32) -> F32:
  F32.clamp(x, 0.0, 1.0)

def rgb(r: F32, g: F32, b: F32) -> U32:
  (F32.to_u32(F32.clamp(r, 0.0, 255.0)) * 16777216 +
   F32.to_u32(F32.clamp(g, 0.0, 255.0)) * 65536 +
   F32.to_u32(F32.clamp(b, 0.0, 255.0)) * 256 + 255 : U32)

# Invariant: display modes are complementary selections of ONE q < cutoff mask.
def visible(view: C.View, q: F32, cutoff: F32) -> Bool:
  C.visibility(view, (q < cutoff : F32))

# First-order level-set distance in screen pixels. This affects shading only.
def distance(+q: F32, gx: F32, gy: F32, cutoff: F32) -> F32:
  (F32.abs((q - cutoff : F32)) * 560.0 /
    F32.max(F32.hypot(gx, gy), 0.08) : F32)

def sample_distance(sample: F.Sample, cutoff: F32) -> F32:
  match sample:
    case F.Sample{q, gx, gy}: distance(q, gx, gy, cutoff)

# Tail recursion, bounded to three genuine recorded frames even if a caller
# supplies a longer list. No time subtraction and no invented propagating rings.
def ghost_line(fuel: Nat, ghosts: Ghosts, +x: F32, +y: F32,
    +cutoff: F32, +strength: F32, +acc: F32) -> F32:
  match fuel:
    case 0n: acc
    case 1n+n:
      match ghosts:
        case NoGhosts{}: acc
        case Ghost{frame, older}:
          d = sample_distance(F.sample(frame, x, y), cutoff)
          line = (clamp((1.0 - d / 1.2 : F32)) * strength : F32)
          ghost_line(n, older, x, y, cutoff, (strength * 0.65 : F32),
            F32.max(acc, line))

def onion_line(onion: Bool, ghosts: Ghosts, x: F32, y: F32, cutoff: F32) -> F32:
  match onion:
    case False{}: 0.0
    case True{}: ghost_line(3n, ghosts, x, y, cutoff, 0.65, 0.0)

def shade(+q: F32, +gx: F32, +gy: F32, ghosts: Ghosts, view: C.View,
    onion: Bool, +cutoff: F32, +x: F32, +y: F32) -> U32:
  +d = distance(q, gx, gy, cutoff)
  +edge = (1.0 / (1.0 + d * d * 0.18) : F32)
  +halo = (1.0 / (1.0 + d * d * 0.008) : F32)
  +lit = clamp((0.5 + (0.6 * gx - 0.8 * gy) /
    (2.0 * F32.max(F32.hypot(gx, gy), 0.08)) : F32))
  +material = pick(visible(view, q, cutoff), 1.0, 0.0)
  +depth = clamp((F32.abs((q - cutoff : F32)) * 3.0 : F32))
  +veil = (material * (0.38 + 0.62 * depth) : F32)
  +gold = clamp((lit * 1.6 - 0.6 : F32))
  +vignette = clamp((1.0 - 0.30 * (x - 0.8) * (x - 0.8) -
    0.35 * (y - 0.5) * (y - 0.5) : F32))
  +trail = onion_line(onion, ghosts, x, y, cutoff)
  +hot = pick((q <= 0.0 : F32), 1.0, 0.0)
  rgb(
    ((8.0 + 18.0 * veil + 28.0 * halo + edge * (65.0 + 155.0 * gold) +
      64.0 * trail + 90.0 * hot) * vignette : F32),
    ((15.0 + 63.0 * veil + 44.0 * halo + edge * (132.0 + 48.0 * gold) +
      93.0 * trail + 20.0 * hot) * vignette : F32),
    ((24.0 + 72.0 * veil + 57.0 * halo + edge * (140.0 - 32.0 * gold) +
      96.0 * trail) * vignette : F32))

def shade_sample(sample: F.Sample, ghosts: Ghosts, view: C.View, onion: Bool,
    cutoff: F32, x: F32, y: F32) -> U32:
  match sample:
    case F.Sample{q, gx, gy}: shade(q, gx, gy, ghosts, view, onion, cutoff, x, y)

def surface(+frame: F.Frame, ghosts: Ghosts, +view: C.View, onion: Bool,
    +cutoff: F32, +x: F32, +y: F32) -> U32:
  shade_sample(F.sample(frame, x, y), ghosts, view, onion, cutoff, x, y)

def ring(+x: F32, +y: F32, cx: F32, cy: F32, radius: F32) -> Bool:
  (F32.abs((F32.hypot((x - cx : F32), (y - cy : F32)) - radius : F32)) < 0.8 : F32)

def field_pixel(+frame: F.Frame, ghosts: Ghosts, view: C.View, onion: Bool,
    inspect: Bool, cutoff: F32, cx: F32, cy: F32, +x: F32, +y: F32) -> U32:
  pointer = Bool.and(inspect, ring(x, y, cx, cy, 12.0))
  word(pointer, 4075011583, surface(frame, ghosts, view, onion, cutoff,
    world_x(x), world_y(y)))

def label_pixel(labels: Labels, +x: F32, +y: F32) -> U32:
  match labels:
    case Labels{title, subtitle, mode, capacity, status, hints, warning, threshold, inspector, boundary, time}:
      title_hit = Ink.text_hit(title, x, y, 64.0, 24.0, 5.0)
      sub_hit = Ink.text_hit(subtitle, x, y, 198.0, 38.0, 2.0)
      mode_hit = Ink.text_hit(mode, x, y, 790.0, 47.0, 2.0)
      cap_hit = Ink.text_hit(capacity, x, y, 64.0, 664.0, 1.0)
      status_hit = Ink.text_hit(status, x, y, 896.0, 665.0, 1.0)
      hints_hit = Ink.text_hit(hints, x, y, 64.0, 743.0, 1.0)
      warning_hit = Ink.text_hit(warning, x, y, 64.0, 722.0, 1.0)
      cut_hit = Ink.text_hit(threshold, x, y, 480.0, 664.0, 1.0)
      probe_hit = Ink.text_hit(inspector, x, y, 640.0, 664.0, 1.0)
      boundary_hit = Ink.text_hit(boundary, x, y, 76.0, 79.0, 1.0)
      time_hit = Ink.text_hit(time, x, y, 800.0, 664.0, 1.0)
      word(boundary_hit, 4291864063,
        word(Bool.or(title_hit, mode_hit), 3874810111,
        word(Bool.or(cap_hit, probe_hit), 2833173247,
        word(Bool.or(time_hit, Bool.or(sub_hit, status_hit)), 2562177535,
        word(Bool.or(warning_hit, Bool.or(hints_hit, cut_hit)), 1955632639, 0)))))

def timeline(+length: U32, selected: U32, +x: F32, +y: F32) -> U32:
  cursor = (952.0 - 880.0 * U32.to_f32(selected) /
    F32.max(1.0, (U32.to_f32(length) - 1.0 : F32)) : F32)
  word((F32.abs((x - cursor : F32)) < 3.0 : F32), 3923950847,
    word((x > 948.0 : F32), 1438297599,
    word((F32.abs((y - 695.0 : F32)) < 1.5 : F32), 928341247, 270741247)))

def chrome(+minimum: F32, length: U32, selected: U32,
    +x: F32, +y: F32) -> U32:
  track = Ink.inside_rect(x, y, 64.0, 686.0, 896.0, 18.0)
  pill = Ink.inside_rect(x, y, 768.0, 30.0, 192.0, 42.0)
  gauge = Ink.inside_rect(x, y, 195.0, 664.0, 200.0, 7.0)
  gauge_fill = (x < (195.0 + 200.0 * clamp(minimum)) : F32)
  gauge_color = word((minimum <= 0.0 : F32), 4087510527, 1892267263)
  boundary = Bool.and((minimum <= 0.0 : F32),
    Ink.inside_rect(x, y, 64.0, 74.0, 896.0, 18.0))
  word(boundary, 1496920063,
    word(track, timeline(length, selected, x, y),
    word(pill, 557663999,
    word(gauge, word(gauge_fill, gauge_color, 506740479), 152182015))))

def hud(+labels: Labels, minimum: F32, length: U32, selected: U32,
    +x: F32, +y: F32) -> U32:
  +text = label_pixel(labels, x, y)
  word(U32.is_ne(text, 0), text, chrome(minimum, length, selected, x, y))

def route(in_field: Bool, +scene: Scene, +x: F32, +y: F32) -> U32:
  match in_field:
    case True{}:
      Scene{frame, ghosts, view, playback, onion, inspect, cutoff, cx, cy,
        minimum, length, selected, labels} = scene
      field_pixel(frame, ghosts, view, onion, inspect, cutoff, cx, cy, x, y)
    case False{}:
      Scene{frame, ghosts, view, playback, onion, inspect, cutoff, cx, cy,
        minimum, length, selected, labels} = scene
      hud(labels, minimum, length, selected, x, y)

def pixel(scene: Scene, +x: F32, +y: F32) -> U32:
  (route(Ink.inside_rect(x, y, 64.0, 96.0, 896.0, 560.0), scene, x, y) >> 8n : U32)

# 4^7 balanced forks, then an unrolled 8x8 block. Never fork per pixel.
def block2(+scene: Scene, +x: F32, +y: F32) -> Image:
  Qua{Pix{pixel(scene, x, y)}, Pix{pixel(scene, (x + 1.0 : F32), y)},
    Pix{pixel(scene, x, (y + 1.0 : F32))},
    Pix{pixel(scene, (x + 1.0 : F32), (y + 1.0 : F32))}}

def block4(+scene: Scene, +x: F32, +y: F32) -> Image:
  Qua{block2(scene, x, y), block2(scene, (x + 2.0 : F32), y),
    block2(scene, x, (y + 2.0 : F32)),
    block2(scene, (x + 2.0 : F32), (y + 2.0 : F32))}

def block8(+scene: Scene, +x: F32, +y: F32) -> Image:
  Qua{block4(scene, x, y), block4(scene, (x + 4.0 : F32), y),
    block4(scene, x, (y + 4.0 : F32)),
    block4(scene, (x + 4.0 : F32), (y + 4.0 : F32))}

def tiles(+depth: Nat, +scene: Scene, +x: F32, +y: F32, +size: F32) -> Image:
  match depth:
    case 0n: block8(scene, x, y)
    case 1n+n:
      +half = (size / 2.0 : F32)
      a b c d = tiles(n, scene, x, y, half)
        tiles(n, scene, (x + half : F32), y, half)
        tiles(n, scene, x, (y + half : F32), half)
        tiles(n, scene, (x + half : F32), (y + half : F32), half)
      Qua{a, b, c, d}

def draw(scene: Scene) -> Image:
  # Window pixels and deterministic captures both sample at pixel centers.
  tiles(7n, scene, 0.5, 0.5, 1024.0)
