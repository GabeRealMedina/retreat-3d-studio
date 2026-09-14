# Character Performance

## Shared timing and rigs

- Establish each action's anticipation, travel, contact or arrival, reaction, hold, and settling from the request or motion reference. Make the primary action readable at normal playback speed; use secondary movement to support it.
- Place shared movement on a character or object controller. Parent facial details to the head, held objects to the appropriate contact rig, and articulated details to their attachment points. Keep local deformation independently editable.
- Use transforms for coherent travel and orientation; use Path deformation where the silhouette must bend. Maintain vertex correspondence between morph poses. Assign one owner to each deformation so a blink or squash is not applied twice through both Path and Scale.
- Use intentional keys and curves for actions, with controlled phase offsets for repeated secondary movement. Retain already fitted curves and user adjustments during local revisions. Do not add unrelated motion merely because a layer can move.
- Implement the chosen stepped cadence consistently across linked parts, including masks and reflections. Check fast wing movement at that cadence so sampling does not make the wings appear frozen.

## Braided hair and a flying visitor

- When an insect must enter, place its full silhouette beyond the chosen frame edge. Animate a curved approach, direction-dependent banking, deceleration, and a readable arrival above the target flower. Transition into hovering with restrained position and orientation changes.
- Give each visible wing its own attachment-point control. Offset wing phases and vary rotation and foreshortening while retaining attachment to the body. Use the body controller for the common flight path.
- Propagate a wind wave from the braid root toward its end. Increase displacement toward the tip and delay successive sections while preserving a connected silhouette. Give the fringe, side lock, and earrings smaller delayed responses.
- Coordinate head and torso reaction with the visitor's arrival. Animate gaze within the eye boundary and natural blinks through the eyelid contour or a single equivalent rig.
- Move the gripping hand and flower together. Let the stem bend and petals respond after the main motion; preserve finger contact and the flower's attachment.
- Verify the off-screen start, arrival, all wing attachments, braid continuity, blink closure, and reflection containment.

## Seated group interaction

- When a character handles a flower or loose petal, coordinate the forearm, wrist, fingers, and held object before release. Give a released petal independent motion only after its contact ends.
- Stagger companion responses around the main gesture. For a reading bird, coordinate gaze, head, neck, and held book. For a companion lifting a cup, maintain both hand grips through the lift, pause, and lowering.
- Preserve tabletop layout and occlusion while characters react. Check prop contact and the timing relationship between the participants.

## Reclining character on a flexible support

- Drive the support's springing movement and the supported body's response through a coherent rig. Maintain the original hand, torso, and leg contact points rather than sliding the character over the surface.
- Apply continuous deformation through each thigh, knee, calf, and ankle; make footwear follow the feet. Preserve limb overlap and the approved pose at every extreme.
- Let the ponytail and ribbons follow with delayed waves and settling. When a bird hops on a petal, align landing time with the local petal response and the character's reaction.
- Inspect intermediate leg poses, supporting contacts, hair attachments, and the landing frame.

## Character with a mirror

- Coordinate head tilt, hand gesture, and mirror angle while maintaining the grip on its stem or handle.
- Drive the reflected performance from the same timing source as the character. Apply the reflection's orientation and surface clipping; synchronize blinking and expression rather than creating an independent second performance.
- Add delayed hair and earring motion, and independent petal travel when requested. Check face-to-reflection correspondence and containment through the mirror's full movement.

## Animal tracking a flying visitor

- Coordinate pupil tracking, head turn, blink, and paw reach around the visitor's actual path. Give the reach anticipation, extension, a readable hold, and a controlled return.
- Keep the paw connected to the foreleg. Preserve the head's proportions and folded-ear construction while adding local ear and tail responses.
- Animate the visitor's wings independently and keep its trajectory visible enough to explain the animal's attention. Time nearby flower and grass deflection to the paw's passage and stagger their recovery.
- Check gaze direction, wing and paw attachments, foreground occlusion, and the end of the reach.
