import Base
import ./control.bend as C

# AI-drafted specifications, pending human review.
# Exact finite control semantics only: no numerical or physical claims.
# Constructor-level content rules exclude trivial no-op implementations.
law flip_medium:
  {C.flip(C.Medium{}) == C.Voids{} : C.View}
law flip_voids:
  {C.flip(C.Voids{}) == C.Medium{} : C.View}
law flip_twice:
  for view: C.View
  {C.flip(C.flip(view)) == view : C.View}
law select_medium:
  {C.is_voids(C.Medium{}) == False{} : Bool}
law select_voids:
  {C.is_voids(C.Voids{}) == True{} : Bool}

law toggle_playing:
  {C.toggle(C.Playing{}) == C.Paused{} : C.Playback}
law toggle_paused:
  {C.toggle(C.Paused{}) == C.Playing{} : C.Playback}
law toggle_boundary:
  {C.toggle(C.AtBoundary{}) == C.AtBoundary{} : C.Playback}
law toggle_twice:
  for playback: C.Playback
  {C.toggle(C.toggle(playback)) == playback : C.Playback}
law playing_advances:
  {C.should_advance(C.Playing{}) == True{} : Bool}
law paused_frozen:
  {C.should_advance(C.Paused{}) == False{} : Bool}
law boundary_frozen:
  {C.should_advance(C.AtBoundary{}) == False{} : Bool}
law toggled_boundary_frozen:
  {C.should_advance(C.toggle(C.AtBoundary{})) == False{} : Bool}

# The diagnostic void mask is supplied independently of the selected view.
law medium_inside_hidden:
  {C.visibility(C.Medium{}, True{}) == False{} : Bool}
law medium_outside_visible:
  {C.visibility(C.Medium{}, False{}) == True{} : Bool}
law voids_inside_visible:
  {C.visibility(C.Voids{}, True{}) == True{} : Bool}
law voids_outside_hidden:
  {C.visibility(C.Voids{}, False{}) == False{} : Bool}
law visibility_complement:
  for view: C.View
  for inside: Bool
  {C.visibility(C.flip(view), inside) == Bool.not(C.visibility(view, inside)) : Bool}
law visibility_roundtrip:
  for view: C.View
  for inside: Bool
  {C.visibility(C.flip(C.flip(view)), inside) == C.visibility(view, inside) : Bool}
