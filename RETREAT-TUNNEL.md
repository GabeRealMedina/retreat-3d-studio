# Private ChatGPT connection

Retreat 3D Studio can run behind OpenAI's [Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels). The client connects outward from your Mac; the Blender server remains a local stdio process. No public Blender endpoint is needed.

## Installed layout

The personal installation uses `~/plugins/retreat-3d-studio/.mcp.json`. `scripts/tunnel/launch-mcp.mjs` reads this installed configuration, requires the sandbox launcher and passes only the needed workspace/Blender environment. Rebuilding the installed plugin therefore updates the server used by future connections. The modeling process has no direct network access; the separate tunnel client carries its stdio messages. See [isolation details](RETREAT-ISOLATION.md).

The tunnel client, launcher and private profile are under `~/.local/share/retreat-3d-tunnel/`. The runtime key is stored separately there with owner-only permissions. Never commit that directory, copy the key into chat, or put the key in command arguments. The source repository contains no credentials or account-specific tunnel profile.

The official macOS arm64 tunnel client used for setup was v0.0.14; its download was checked against the release SHA256SUMS file.

## Day-to-day use

Keep the Mac awake and online while using the ChatGPT plugin. The managed runtime continues after the setup terminal closes, but it is not configured to launch automatically after a restart.

Check its state:

```sh
~/.local/share/retreat-3d-tunnel/tunnel-client runtimes status retreat-3d-studio --json
```

The expected fields are `process_running: true`, `healthy: true`, `ready: true` and `runtime_state: "ready"`.

Stop remote access:

```sh
~/.local/share/retreat-3d-tunnel/tunnel-client runtimes stop retreat-3d-studio
```

On the configured Mac, run `~/.local/share/retreat-3d-tunnel/Start Tunnel.command` to resume the managed connection. On another installation, attach using your own tunnel ID and absolute Node path:

```sh
~/.local/share/retreat-3d-tunnel/tunnel-client runtimes connect \
  --alias retreat-3d-studio \
  --profile retreat-3d-studio \
  --profile-dir "$HOME/.local/share/retreat-3d-tunnel/profiles" \
  --tunnel-id YOUR_TUNNEL_ID \
  --runtime-api-key "file:$HOME/.local/share/retreat-3d-tunnel/runtime-key" \
  --mcp-command "/absolute/path/to/node $HOME/.local/share/retreat-3d-tunnel/launch-mcp.mjs"
```

Save a revision before stopping or restarting: unsaved Blender session state is not durable. Start a new ChatGPT conversation with the saved `.blend` path to resume a model.

## Credential renewal

The initial runtime key was configured with only Tunnels Read/Use permissions and a 30-day expiration. Before it expires, create a replacement with those same restricted permissions in OpenAI Platform. Stop the runtime, replace the private `runtime-key` file using a hidden local prompt, then reconnect and check status. Do not use an organization admin key as the runtime credential.

The included `store-runtime-key.py` is an initial-entry helper: it hides input, creates an owner-only file and refuses to overwrite an existing credential. It intentionally does not renew an existing key automatically.

## ChatGPT setup

The tunnel must be associated with your intended ChatGPT workspace. Enable Developer mode, then create a personal app/plugin with connection type Tunnel and select the existing Retreat 3D Studio tunnel. Use the current official guide if the UI labels change.

This plugin has 22 tools, including Blender Python execution confined by the installed macOS sandbox. It can still modify the permitted model workspace. Restrict it to your trusted personal ChatGPT workspace. Keep the normal tool approval prompts enabled and review proposed changes before allowing them.

Suggested first request: “Use Retreat 3D Studio. Read retreat_workflow and check Blender health. Then help me open my saved model and save each change as a new revision.”
