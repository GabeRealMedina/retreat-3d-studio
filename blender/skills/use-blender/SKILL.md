---
name: use-blender
title: Higgsfield use Blender
description: Set up the local Higgsfield use Blender MCP to create, edit and render .blend projects in a background Blender process without an add-on.
---

# Higgsfield use Blender

Connect a desktop MCP client to a dedicated background Blender process on the same computer:

Desktop client → stdio → fnf-blender-mcp → process pipes → Blender Python / bpy.

Use **Higgsfield use Blender** as the display name and `higgsfield-use-blender` as the server identifier. No add-on, HTTP listener, WebSocket or cloud account is required for local scene operations.

Each MCP session owns its own scene. Commands preserve that scene in memory until the connection closes; save needed work with `bl_save_project`. This integration cannot read unsaved work in an already-open Blender window. To edit that work, first save it in the desktop application, then load the file with `bl_open_project`. To inspect results in the UI, open the saved output file separately.

Use `fnf-blender-mcp@latest`; version 0.1.0 requires an add-on and cannot provide this workflow. This is a setup command, not a media preset. A remote cloud sandbox cannot install software on the user's desktop. First discover available local `bl_*` tools and verify an existing session before reinstalling.

For setup, read [installation](references/installation.md). For diagnosis and edits, read [verification](references/verification.md). When served by get_preset_instructions, load `/use-blender/references/installation` and `/use-blender/references/verification` respectively.
