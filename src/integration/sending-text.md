# Sending Text to the Relay

The relay doesn't care where text comes from. It accepts JSON over WebSocket or Unix socket. Anything that can open a socket can type keystrokes.

## Simplest possible usage

Just send plain text after authenticating. No JSON required:

```bash
TOKEN="your-auth-token-here"
(echo "$TOKEN"; echo "Hello from Nymble!") | nc -N -U ~/.nymble/relay.sock
```

That's it. The text gets typed.

## From a shell script

```bash
#!/bin/bash
TOKEN="your-auth-token-here"
SOCKET="$HOME/.nymble/relay.sock"

nymble_send() {
  (echo "$TOKEN"; echo "$1") | nc -N -U "$SOCKET"
}

# Simple text
nymble_send 'Hello world'

# JSON for more control
nymble_send '{"type":"key","key":"ENTER"}'
nymble_send '{"type":"combo","keys":"CTRL+A"}'
nymble_send '{"type":"delay","ms":500}'
```

## From Python

```python
import json
import os
import socket

TOKEN = "your-auth-token-here"
SOCKET_PATH = os.path.expanduser("~/.nymble/relay.sock")

def send_to_relay(message):
    """Send a message to the relay. Accepts a string or dict."""
    sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    sock.connect(SOCKET_PATH)
    sock.sendall(f"{TOKEN}\n".encode())
    sock.recv(1024)  # auth response

    if isinstance(message, dict):
        message = json.dumps(message)
    sock.sendall(f"{message}\n".encode())
    sock.close()

# Simple text
send_to_relay("Hello from Python")

# Key press
send_to_relay({"type": "key", "key": "ENTER"})

# Combo
send_to_relay({"type": "combo", "keys": ["CTRL", "A"]})

# Sequence
send_to_relay({
    "type": "sequence",
    "steps": [
        {"text": "ls -la"},
        {"key": "ENTER"},
        {"delay": 1000},
        {"text": "echo done"},
        {"key": "ENTER"},
    ]
})
```

## WebSocket with websocat

[websocat](https://github.com/vi/websocat) is a lightweight WebSocket CLI (`cargo install websocat` or grab a binary from its releases):

```bash
TOKEN="your-auth-token-here"

# One-shot: type text and disconnect
echo '{"type": "transcript", "text": "Hello from websocat"}' \
  | websocat "ws://127.0.0.1:9200?auth=$TOKEN"

# Interactive session (type JSON lines, Ctrl+C to quit)
websocat "ws://127.0.0.1:9200?auth=$TOKEN"

# Plain text — no JSON needed
echo "Just type this" | websocat "ws://127.0.0.1:9200?auth=$TOKEN"
```

## WebSocket from Python

```python
import asyncio
import json
import websockets

TOKEN = "your-auth-token-here"

async def send(message):
    uri = f"ws://127.0.0.1:9200?auth={TOKEN}"
    async with websockets.connect(uri) as ws:
        await ws.recv()  # authenticated
        if isinstance(message, dict):
            message = json.dumps(message)
        await ws.send(message)

asyncio.run(send("Hello via WebSocket"))
```

## Bash helper function

Drop this in your `.bashrc` for a quick `ntype` command:

```bash
ntype() {
  local token="your-auth-token-here"
  printf '%s\n{"type": "transcript", "text": "%s"}\n' "$token" "$*" \
    | nc -N -U ~/.nymble/relay.sock
}

# Usage:
# ntype Hello world
# ntype "This is a sentence."
```

## Key combos

```bash
# Select all
(echo "$TOKEN"; echo '{"type":"combo","keys":"CTRL+A"}') | nc -N -U ~/.nymble/relay.sock

# Copy
(echo "$TOKEN"; echo '{"type":"combo","keys":["CTRL","C"]}') | nc -N -U ~/.nymble/relay.sock

# Paste
(echo "$TOKEN"; echo '{"type":"combo","keys":["CTRL","V"]}') | nc -N -U ~/.nymble/relay.sock

# Alt+Tab (switch window)
(echo "$TOKEN"; echo '{"type":"combo","keys":["ALT","TAB"]}') | nc -N -U ~/.nymble/relay.sock
```

## Scripted automation

Sequences let you script multi-step interactions:

```bash
# Type a command, wait for it to finish, type another
(echo "$TOKEN"; echo '{
  "type": "sequence",
  "steps": [
    {"text": "git status"},
    {"key": "ENTER"},
    {"delay": 2000},
    {"text": "git add ."},
    {"key": "ENTER"},
    {"delay": 1000},
    {"text": "git commit -m \"automated commit\""},
    {"key": "ENTER"}
  ]
}') | nc -N -U ~/.nymble/relay.sock
```

### Typing speed control within a sequence

```bash
(echo "$TOKEN"; echo '{
  "type": "sequence",
  "steps": [
    {"text": "this types at full speed"},
    {"key": "ENTER"},
    {"speed": 80},
    {"text": "this types like a human at 80ms per key"},
    {"key": "ENTER"}
  ]
}') | nc -N -U ~/.nymble/relay.sock
```

Speed auto-resets to fastest after the sequence completes.

## With speech-to-text tools

The relay is STT-agnostic. The pattern is always:

1. Your STT tool produces text
2. You send that text to the relay
3. The relay types it via HID

### Pipe from any STT tool

```bash
my-stt-tool --listen | while read -r line; do
  (echo "$TOKEN"; echo "$line") | nc -N -U ~/.nymble/relay.sock
done
```

### OpenAI Whisper

```bash
ffmpeg -f alsa -i default -t 5 -y /tmp/audio.wav 2>/dev/null
TEXT=$(whisper /tmp/audio.wav --model base --output_format txt 2>/dev/null)
(echo "$TOKEN"; echo "$TEXT") | nc -N -U ~/.nymble/relay.sock
```

### HandySpeech, Whisper.cpp, Vosk, etc.

Same pattern. Get text out, send it in. No adapters needed.

## Runtime configuration

```bash
# Change typing speed on the HID device
(echo "$TOKEN"; echo '{"type":"speed","ms":30}') | nc -N -U ~/.nymble/relay.sock

# Reset to fastest
(echo "$TOKEN"; echo '{"type":"speed","ms":0}') | nc -N -U ~/.nymble/relay.sock

# Pause the device
(echo "$TOKEN"; echo '{"type":"delay","ms":2000}') | nc -N -U ~/.nymble/relay.sock

# Switch relay output to clipboard
(echo "$TOKEN"; echo '{"type":"config","output":"clipboard"}') | nc -N -U ~/.nymble/relay.sock
```

## Tips

- **Use the Unix socket for local integrations.** It's simpler and doesn't need network configuration.
- **Use WebSocket for remote sources** (mobile apps, Raspberry Pi, other machines on LAN).
- **Plain text works.** You don't need JSON for simple typing — just send the string.
- **The relay queues nothing.** If the relay isn't running, messages are lost. Start the relay first.
- **Focus matters.** The HID device types into whatever window has focus. Make sure the right app is focused before sending text.
- **Sequences auto-reset speed.** You don't need to manually reset after a sequence — it's done for you.
