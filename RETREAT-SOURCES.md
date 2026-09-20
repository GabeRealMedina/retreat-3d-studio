# Source selection — 2026-09-20

| Repository | Finding | Decision |
|---|---|---|
| [wide-trace/open-higgsfield](https://github.com/wide-trace/open-higgsfield) | Next.js image/video studio with a model catalog and gallery. Its root file listing did not show a LICENSE at review time. | Not needed for editable Blender models; no code copied. |
| [higgsfield-ai/fnf-local-pluging-bridge-mcp](https://github.com/higgsfield-ai/fnf-local-pluging-bridge-mcp) | MIT repository containing a separate background Blender MCP package with model editing, saving and rendering. | Forked; primary implementation foundation. |
| [higgsfield-ai/skills](https://github.com/higgsfield-ai/skills) | MIT agent workflows including cloud generation and website production. | Reviewed; not required for local geometry editing. Blender craft skills already ship with the selected bridge. |
| [higgsfield-ai/cli](https://github.com/higgsfield-ai/cli) | Higgsfield service CLI. | Optional future cloud integration; not required for the local plugin. |
| [higgsfield-ai/higgsfield-client](https://github.com/higgsfield-ai/higgsfield-client) and [higgsfield-js](https://github.com/higgsfield-ai/higgsfield-js) | Official Python and JavaScript service SDKs, as described by the organization's repository listings. | No fork needed for the current local Blender implementation. |
| [higgsfield-ai/higgsfield](https://github.com/higgsfield-ai/higgsfield) | GPU orchestration / model-training framework, per the organization listing. | Outside the modeling-plugin scope. |

Selected upstream revision: `dbd1ddbf2d71ba4e879eb385f79efa1b6ab4f562`.

The full upstream Git history is retained for updates and attribution. The local fork adds a separate Retreat entry point to keep upstream's 19-tool interface stable. Only the Blender runtime is included in the installed plugin; the sibling After Effects runtime is not a dependency.

OpenAI architecture reference: [Plugins, skills and MCP servers](https://developers.openai.com/plugins/concepts/plugins). ChatGPT private-host connection reference: [Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels). Availability of developer mode and tunnels must be checked for the actual account; a GitHub fork alone does not connect a plugin to ChatGPT.

For upstream updates, fetch and merge upstream changes in a development branch, rerun offline and live tests, then rebuild the local plugin. Never place personal models, generated absolute connection paths, credentials or runtime dependencies in the public Git repository.
