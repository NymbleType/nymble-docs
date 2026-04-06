# Protocol Reference

All communication uses JSON over WebSocket or Unix socket. Messages are newline-delimited on Unix sockets.

## Client → Relay

### `transcript` — Type text

```json
{"type": "transcript", "text": "Hello world"}
```

The relay delivers the text via the active output method (HID, xdotool, or clipboard). This is the primary message type.

**Shorthand:** Plain text (non-JSON) is treated as a transcript:

```
Hello world
```

### `stream_chunk` — Streaming text

```json
{"type": "stream_chunk", "text": "Hello wor", "is_final": false}
{"type": "stream_chunk", "text": "Hello world", "is_final": true}
```

For real-time STT. Only the final chunk (`is_final: true`) is typed. Intermediate chunks are ignored (the relay doesn't do partial output).

### `key` — Special keystroke

```json
{"type": "key", "key": "ENTER"}
```

Sends a single special key. Supported keys:

`ENTER`, `TAB`, `BACKSPACE`, `DELETE`, `ESCAPE`, `SPACE`, `UP`, `DOWN`, `LEFT`, `RIGHT`, `HOME`, `END`, `PAGEUP`, `PAGEDOWN`

### `ping` — Keepalive

```json
{"type": "ping"}
```

Response: `{"type": "pong"}`

### `config` — Runtime configuration

```json
{
  "type": "config",
  "typing_speed": {
    "delay_ms": 30,
    "burst_size": 5,
    "pre_delay_ms": 100
  },
  "output": "hid"
}
```

Update typing speed or output method without restarting the relay. All fields are optional.

## Relay → Client

### `paired` — Pairing successful

```json
{"type": "paired", "auth_token": "abc123..."}
```

Sent after a successful pairing. The client should store this token for future connections.

### `authenticated` — Auth confirmed

```json
{"type": "authenticated"}
```

Sent after a returning device provides a valid auth token.

### `status` — Current state

```json
{"type": "status", "output": "hid", "connected": true}
```

Sent on connect and after config changes. `output` is the active output method.

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
