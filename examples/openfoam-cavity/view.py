"""Run with ParaView's pvpython: view.py /absolute/path/to/generated/run.

Creates a reproducible ParaView state and PNG from the computed fields.
"""
from pathlib import Path
import sys
from paraview.simple import *

case = Path(sys.argv[1]).resolve()
reader = OpenFOAMReader(registrationName="Cavity | computed OpenFOAM fields", FileName=str(case / "cavity.foam"))
reader.MeshRegions = ["internalMesh"]
reader.CellArrays = ["U", "p", "grad(U)", "vorticity"]
reader.SkipZeroTime = 0
reader.ListtimestepsaccordingtocontrolDict = 0
reader.InvokeCommand("Refresh")
reader.UpdatePipelineInformation()
reader.UpdatePipeline()
scene = GetAnimationScene()
scene.UpdateAnimationUsingDataTimeSteps()
scene.AnimationTime = 2.0
reader.UpdatePipeline(2.0)
assert reader.GetDataInformation().GetNumberOfCells() == 1600
assert len(reader.TimestepValues) == 81

view = GetActiveViewOrCreate("RenderView")
view.ViewSize = [1100, 850]
view.UseColorPaletteForBackground = 0
view.Background = [0.055, 0.075, 0.11]
view.CameraParallelProjection = 1
view.InteractionMode = "2D"
view.OrientationAxesVisibility = 1

sheet = Slice(registrationName="Fluid midplane | colour by U, p or vorticity", Input=reader)
sheet.SliceType.Origin = [0.05, 0.05, 0.005]
sheet.SliceType.Normal = [0, 0, 1]
sheet.UpdatePipeline(2.0)
surface = Show(sheet, view)
ColorBy(surface, ("POINTS", "U", "Magnitude"))
lut = GetColorTransferFunction("U")
lut.ApplyPreset("Viridis (matplotlib)", True)
lut.RescaleTransferFunction(0, 1)
lut.AutomaticRescaleRangeMode = "Never"
surface.SetScalarBarVisibility(view, True)
legend = GetScalarBar(lut, view)
legend.Title = "Speed (m/s)"
legend.ComponentTitle = ""
legend.TitleColor = [0.9, 0.93, 0.98]
legend.LabelColor = [0.9, 0.93, 0.98]
legend.TitleFontSize = 16
legend.LabelFontSize = 13
legend.WindowLocation = "Lower Right Corner"

arrows = Glyph(registrationName="Velocity arrows | direction + speed", Input=sheet, GlyphType="Arrow")
arrows.OrientationArray = ["POINTS", "U"]
arrows.ScaleArray = ["POINTS", "U"]
arrows.ScaleFactor = 0.009
arrows.GlyphMode = "Every Nth Point"
arrows.Stride = 5
arrow_display = Show(arrows, view)
ColorBy(arrow_display, None)
arrow_display.DiffuseColor = [0.95, 0.97, 1.0]
arrow_display.AmbientColor = [0.95, 0.97, 1.0]
arrow_display.Translation = [0, 0, 0.0001]

stream = StreamTracer(registrationName="Instantaneous streamlines | not particle trails", Input=reader, SeedType="Line")
stream.Vectors = ["POINTS", "U"]
stream.SeedType.Point1 = [0.05, 0.005, 0.005]
stream.SeedType.Point2 = [0.05, 0.095, 0.005]
stream.SeedType.Resolution = 12
stream.MaximumStreamlineLength = 0.35
stream.IntegrationDirection = "FORWARD"
stream_display = Show(stream, view)
ColorBy(stream_display, None)
stream_display.DiffuseColor = [0.9, 0.94, 1]
stream_display.Opacity = 0.45
stream_display.LineWidth = 1.2
stream_display.Translation = [0, 0, 0.0002]

title = Text(registrationName="Scene legend")
title.Text = "OPENFOAM / HELLO WORLD\nSliding lid -> 1 m/s     |     10 cm square     |     Re = 10"
title_display = Show(title, view)
title_display.WindowLocation = "Upper Left Corner"
title_display.FontSize = 17
title_display.Color = [0.92, 0.95, 1]
time = AnnotateTimeFilter(registrationName="Simulation time", Input=reader)
time.Format = "Time: {time:.3f} s"
time_display = Show(time, view)
time_display.WindowLocation = "Lower Left Corner"
time_display.FontSize = 16
time_display.Color = [0.92, 0.95, 1]

view.CameraPosition = [0.057, 0.05, 0.5]
view.CameraFocalPoint = [0.057, 0.05, 0.005]
view.CameraViewUp = [0, 1, 0]
view.CameraParallelScale = 0.066
SetActiveSource(sheet)
Render()
assert arrows.GetDataInformation().GetNumberOfPoints() > 0
assert stream.GetDataInformation().GetNumberOfPoints() > 0
SaveState(str(case / "hello-cavity.pvsm"))
SaveScreenshot(str(case / "hello-cavity.png"), view, ImageResolution=[1100, 850])
print(f"View: {case / 'hello-cavity.pvsm'}")
print(f"Preview: {case / 'hello-cavity.png'}")
