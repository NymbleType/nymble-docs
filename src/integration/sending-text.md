# Sending Text to the Relay

The relay doesn't care where text comes from. It accepts JSON over WebSocket or Unix socket. Anything that can open a socket can type keystrokes.

## From a shell script (Unix socket)

The simplest integration — pipe text to the Unix socket:

```bash
#!/bin/bash
TOKEN="your-auth-token-here"
SOCKET="$HOME/.nymble/relay.sock"

send_text() {
  (echo "$TOKEN"; echo "{\"type\":\"transcript\",\"text\":\"$1\"}") | nc -U "$SOCKET"
}

send_text "Hello from a shell script"
```

## From Python

```python
import json
import socket

TOKEN = "your-auth-token-here"
SOCKET_PATH = os.path.expanduser("~/.nymble/relay.sock")

def send_to_relay(text: str):
    sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    sock.connect(SOCKET_PATH)
    sock.sendall(f"{TOKEN}\n".encode())
    # Read auth response
    sock.recv(1024)
    # Send text
    msg = json.dumps({"type": "transcript", "text": text})
    sock.sendall(f"{msg}\n".encode())
    sock.close()

send_to_relay("Hello from Python")
```

## From any WebSocket client

```python
import asyncio
import websockets

TOKEN = "your-auth-token-here"

async def send_text(text: str):
    uri = f"ws://127.0.0.1:9200?auth={TOKEN}"
    async with websockets.connect(uri) as ws:
        # Wait for authenticated message
        await ws.recv()
        # Send text
        await ws.send(json.dumps({"type": "transcript", "text": text}))

asyncio.run(send_text("Hello via WebSocket"))
```

## With speech-to-text tools

The relay is STT-agnostic. Here are common patterns:

### OpenAI Whisper (local or API)

Record audio, transcribe with Whisper, send the result to the relay:

```bash
# Record 5 seconds, transcribe, send
ffmpeg -f alsa -i default -t 5 -y /tmp/audio.wav 2>/dev/null
TEXT=$(whisper /tmp/audio.wav --model base --output_format txt 2>/dev/null | cat /tmp/audio.txt)
(echo "$TOKEN"; echo "{\"type\":\"transcript\",\"text\":\"$TEXT\"}") | nc -U ~/.nymble/relay.sock
```

### Pipe from any STT tool

If your STT tool outputs text to stdout, pipe it:

```bash
my-stt-tool --listen | while read -r line; do
  (echo "$TOKEN"; echo "{\"type\":\"transcript\",\"text\":\"$line\"}") | nc -U ~/.nymble/relay.sock
done
```

### HandySpeech, Whisper.cpp, Vosk, etc.

The pattern is always the same:
1. Your STT tool produces text
2. You send that text to the relay via Unix socket or WebSocket
3. The relay types it via HID

There's no plugin system or special adapter needed. If you can get text out of your tool, you can get it into Nymble.

## Sending special keys

```bash
# Send Enter
(echo "$TOKEN"; echo '{"type":"key","key":"ENTER"}') | nc -U ~/.nymble/relay.sock

# Send Tab
(echo "$TOKEN"; echo '{"type":"key","key":"TAB"}') | nc -U ~/.nymble/relay.sock
```

## Runtime config changes

```bash
# Slow down typing to 30ms per character
(echo "$TOKEN"; echo '{"type":"config","typing_speed":{"delay_ms":30}}') | nc -U ~/.nymble/relay.sock

# Switch to clipboard output
(echo "$TOKEN"; echo '{"type":"config","output":"clipboard"}') | nc -U ~/.nymble/relay.sock
```

## Tips

- **Use the Unix socket for local integrations.** It's simpler and doesn't need network configuration.
- **Use WebSocket for remote sources** (mobile apps, Raspberry Pi, other machines on LAN).
- **The relay queues nothing.** If the relay isn't running, messages are lost. Start the relay first.
- **Focus matters.** The HID device types into whatever window has focus. Make sure the right app is focused before sending text.
