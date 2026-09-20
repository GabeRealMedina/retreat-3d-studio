# Validation record

Validated on 2026-09-20 with Node 24.19.0 and Blender 5.2.1 LTS on macOS arm64.

| Check | Result |
|---|---|
| TypeScript build and type checking | Passed |
| Upstream Node tests | 7 passed |
| Upstream Python tests | 4 passed |
| Isolated npm package installation | Passed; original 19-tool entry point preserved |
| Live Blender core tools | Passed: geometry, materials, camera, lights, keyframes, save/open guards, Cycles preview |
| Retreat installed runtime | Passed; 22 discoverable tools |
| Model revision preservation | Passed; first revision bytes unchanged after saving second revision |
| Resume after disconnect | Passed; new process opened second revision and recovered edited bench position |
| Restore earlier revision | Passed; original bench position recovered |
| GLB export | Passed; glTF binary header verified |
| Export overwrite refusal and explicit overwrite | Passed |
| Invalid path / revision label validation | Passed |
| Render | Passed; 960×720 Cycles preview visually inspected |
| Plugin manifest and new workflow skill validators | Passed |

Blender crashed at startup under the restricted tool sandbox. Live tests passed when run as the normal local application outside that sandbox. Rendering is conservatively tracked as a mutation, so the test saves a revision before reopening earlier work.

The demonstration model uses invented dimensions and was generated separately from the user's existing designs. No existing backyard model was changed. No cloud generation or paid API call was used.

ChatGPT web/tunnel access is not validated by these local tests. A local plugin installation and a remote ChatGPT connection are separate steps.
