# Protocol Reference

All communication uses JSON over WebSocket or Unix socket. Messages are newline-delimited on Unix sockets.

**Simple mode:** Plain text (non-JSON) is treated as text to type. Just send a string and it gets typed.

## Client → Relay

### `transcript` — Type text

```json
{"type": "transcript", "text": "Hello world"}
```

The relay delivers the text via the active output method (HID, xdotool, or clipboard).

**Shorthand:** plain text (non-JSON) is treated as a transcript:

```
Hello world
```

### `key` — Special keystroke

```json
{"type": "key", "key": "ENTER"}
```

Supported keys: `ENTER`, `TAB`, `BACKSPACE`, `DELETE`, `ESCAPE`, `SPACE`, `UP`, `DOWN`, `LEFT`, `RIGHT`, `HOME`, `END`, `PAGEUP`, `PAGEDOWN`, `INSERT`, `CAPSLOCK`, `PRINTSCREEN`, `F1`–`F12`

### `combo` — Key combination

```json
{"type": "combo", "keys": ["CTRL", "A"]}
```

Or as a string:

```json
{"type": "combo", "keys": "CTRL+SHIFT+V"}
```

Supported modifiers: `CTRL`, `SHIFT`, `ALT`, `GUI` (Windows/Cmd key). Can be combined with any key.

Common combos:

| Combo | Action |
|-------|--------|
| `["CTRL", "A"]` | Select all |
| `["CTRL", "C"]` | Copy |
| `["CTRL", "V"]` | Paste |
| `["CTRL", "Z"]` | Undo |
| `["ALT", "TAB"]` | Switch window |
| `["CTRL", "SHIFT", "V"]` | Paste as plain text |
| `["GUI", "L"]` | Lock screen |

### `speed` — Set typing speed

```json
{"type": "speed", "ms": 50}
```

Sets the inter-key delay on the HID device in milliseconds. `0` = fastest (no delay). Persists until changed.

### `delay` — Pause

```json
{"type": "delay", "ms": 2000}
```

Pauses the HID device for the specified milliseconds (max 30 seconds). Useful between commands when waiting for an app to respond.

### `hold` — Hold a key

```json
{"type": "hold", "key": "SHIFT"}
```

Presses and holds a key. Stays held until a `release` message.

### `release` — Release held keys

```json
{"type": "release"}
```

Releases all keys currently held.

### `sequence` — Scripted sequence

```json
{
  "type": "sequence",
  "steps": [
    {"text": "ls -la"},
    {"key": "ENTER"},
    {"delay": 1000},
    {"text": "cd /tmp"},
    {"key": "ENTER"},
    {"delay": 500},
    {"combo": ["CTRL", "C"]},
    {"speed": 50},
    {"text": "this types slowly"},
    {"speed": 0},
    {"text": "fast again"}
  ]
}
```

Executes steps in order. Speed automatically resets to 0 (fastest) when the sequence completes. Each step is one of:

| Step | Description |
|------|-------------|
| `{"text": "..."}` | Type text |
| `{"key": "ENTER"}` | Press a special key |
| `{"combo": ["CTRL", "A"]}` | Key combination |
| `{"delay": 1000}` | Pause (milliseconds) |
| `{"speed": 50}` | Set typing speed (milliseconds per key) |
| `{"hold": "SHIFT"}` | Hold a key |
| `{"release": true}` | Release all held keys |

### `stream_chunk` — Streaming text

```json
{"type": "stream_chunk", "text": "Hello wor", "is_final": false}
{"type": "stream_chunk", "text": "Hello world", "is_final": true}
```

For real-time STT. Only the final chunk (`is_final: true`) is typed.

### `ping` — Keepalive

```json
{"type": "ping"}
```

Response: `{"type": "pong"}`

### `config` — Runtime configuration

```json
{
  "type": "config",
  "typing_speed": {"delay_ms": 30, "burst_size": 5, "pre_delay_ms": 100},
  "output": "hid"
}
```

Update relay-side typing speed or output method without restarting.

> **Note:** `config` changes the relay's behavior. `speed` changes the HID firmware's inter-key delay. They're independent — `config.typing_speed` controls how the relay sends to the device, while `speed` controls how the device types keystrokes.

## Relay → Client

### `paired` — Pairing successful

```json
{"type": "paired", "auth_token": "abc123..."}
```

Store this token for future connections.

### `authenticated` — Auth confirmed

```json
{"type": "authenticated"}
```

### `status` — Current state

```json
{"type": "status", "output": "hid", "connected": true}
```

Sent on connect and after config changes.

### `error` — Error

```json
{"type": "error", "message": "Invalid auth token"}
```

### `pong` — Ping response

```json
{"type": "pong"}
```

## Transport details

### WebSocket

- Default port: `9200`
- Auth via URL parameter: `?auth=TOKEN` (returning) or `?token=PAIRING_TOKEN` (first time)
- Messages are individual WebSocket text frames

### Unix socket

- Default path: `~/.nymble/relay.sock`
- First line must be the auth token
- Subsequent lines are JSON messages (one per line)
- Responses are also one JSON object per line
