#!/usr/bin/env python3
"""Interactive credential entry; never pass a key through chat or command args."""
import getpass
import os
from pathlib import Path

directory = Path.home() / '.local/share/retreat-3d-tunnel'
directory.mkdir(mode=0o700, parents=True, exist_ok=True)
os.chmod(directory, 0o700)
destination = directory / 'runtime-key'
if destination.exists():
    raise SystemExit('A runtime key is already stored. Existing credentials were left unchanged.')
print('Paste the OpenAI runtime API key for your private Retreat 3D tunnel.')
print('Input is hidden and is saved only on this Mac, outside the source repository.')
key = getpass.getpass('Runtime API key: ').strip()
if not key.startswith('sk-') or len(key) < 20 or any(c.isspace() for c in key):
    raise SystemExit('That does not look like an OpenAI API key. Nothing was saved.')
fd = os.open(destination, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
with os.fdopen(fd, 'w') as output:
    output.write(key)
print('Runtime key saved privately. You can close this window and return to Codex.')
