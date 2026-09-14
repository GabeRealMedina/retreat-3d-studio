# Editable Prompt Interface

## Editable Prompt Interface

Use this section only when a prompt-driven demonstration or chat-style interface is requested. Rebuild the supplied interface with native shape and text layers. The visible composer is animated artwork unless a real input connection is separately implemented. An access label, model name, or microphone icon does not establish live functionality or permissions.

Create a stable layout with a main input surface, optional header, prompt text, caret, relevant controls, and a restrained shadow. Match the supplied reference's spacing and hierarchy, while keeping wording and labels runtime inputs. Use a separate transparent precomposition when it simplifies placement and protects the interface from collage distortion.

Size typography in final-master pixels. Account for precomposition scale before choosing font size, line height, and control spacing. Keep the input text well clear of the control row, and allow a longer command without running into an icon. When replacing an existing interface source, update its anchor and scale for the new source dimensions while preserving approved parent placement and timing.

Create surfaces before foreground text and icons so the stacking order is unambiguous. Use native rectangle, ellipse, and path groups for editable controls. ADBE Root Vectors Group contains shape contents; ADBE Vector Shape - Rect and ADBE Vector Shape - Ellipse create the corresponding paths; ADBE Vector Shape - Group holds a Bezier path. Native fills and strokes use ADBE Vector Graphic - Fill and ADBE Vector Graphic - Stroke.

Keep full command text beneath the reveal logic. Distinguish the typing interval from the visible lifetime: completed text must remain readable until its next state. Position the caret using the active text's measured bounds and transform, and remove it when the bar is hidden. Preserve a sensible blink during idle states without letting the caret appear before its text layer.

Coordinate the interface and scene causally. The command becomes legible, an explicit submit or response state occurs when requested, and then the corresponding background change, object swap, or added animation happens. A decorative voice button is not a verified submit animation. Do not claim a prompt action was implemented unless its visual result is present and correctly timed.

