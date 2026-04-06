# Architecture

Nymble Type is intentionally simple. Two components, one pipeline.

## Overview

```
┌──────────────────┐
│   Text source    │   Any program that produces text:
│                  │   STT engine, script, chatbot, mobile app, etc.
└────────┬─────────┘
         │
         │  WebSocket (ws://127.0.0.1:9200)
         │  or Unix socket (~/.nymble/relay.sock)
         │
         ▼
┌──────────────────┐
│  nymble-relay    │   Headless Python daemon.
│                  │   Receives JSON messages, authenticates clients,
│                  │   routes text to the output backend.
│                  │
│  Output backends:│
│  ├─ HID (serial) │──▶ RP2040 device
│  ├─ xdotool      │──▶ X11 keystroke simulation
│  └─ clipboard    │──▶ copy + paste
└──────────────────┘
         │
         │  USB serial (115200 baud)
         │  Protocol: TYPE:<text>\n → OK:TYPED\n
         │
         ▼
┌──────────────────┐
│ nymble-hid-rp2040│   RP2040 microcontroller running CircuitPython.
│                  │   Receives text over serial, types it as a
│                  │   USB HID keyboard. To the OS, it's a real keyboard.
└──────────────────┘
         │
         │  USB HID keystrokes
         │
         ▼
    ┌──────────┐
    │  Host OS │   Any application with focus receives the keystrokes.
    └──────────┘
```

## The relay

**Repo:** [nymble-relay](https://github.com/NymbleType/nymble-relay)

The relay is a headless Python daemon with two listeners:

- **WebSocket server** — for network clients (mobile apps, remote machines)
- **Unix socket** — for local clients (scripts, STT tools on the same machine)

Both require token authentication. The relay doesn't do any transcription itself — it only receives text and delivers it.

### Output priority (auto mode)

1. **HID** — if an RP2040 is connected, use it
2. **xdotool** — if running on Linux with X11
3. **clipboard** — copy + paste as last resort

### Key files

| File | Role |
|------|------|
| `server.py` | WebSocket + Unix socket listeners, pairing, auth |
| `protocol.py` | JSON message parsing and building |
| `auth.py` | Token generation, hashing, validation, persistence |
| `output/manager.py` | Routes text to the right output backend |
| `output/hid.py` | Serial communication with RP2040 |
| `output/clipboard.py` | Clipboard paste fallback |
| `output/xdotool.py` | X11 keystroke simulation |
| `config.py` | Layered config loading (bundled → user → CLI) |
| `__main__.py` | CLI entry point and argument parsing |

## The firmware

**Repo:** [nymble-hid-rp2040](https://github.com/NymbleType/nymble-hid-rp2040)

Two CircuitPython files on the device:

| File | Role |
|------|------|
| `boot.py` | Runs at power-on. Sets USB identification to "Nymble HID" so the relay can auto-detect it. Enables keyboard-only HID. |
| `code.py` | Main loop. Reads serial input line-by-line, dispatches to `type_text()` or `press_key()`. Uses `adafruit_hid` for keystroke injection. |

### Serial protocol

```
→ TYPE:Hello world     ← OK:TYPED      Type text as keystrokes
→ KEY:ENTER            ← OK:KEY        Press a special key
→ COMBO:CTRL+A         ← OK:COMBO      Press a key combination
→ HOLD:SHIFT           ← OK:HOLD       Hold a key down
→ RELEASE              ← OK:RELEASE    Release all held keys
→ SPEED:50             ← OK:SPEED      Set inter-key delay (ms)
→ DELAY:1000           ← OK:DELAY      Pause for 1 second
→ PING                 ← OK:PONG       Health check
→ Hello world          ← OK:TYPED      Raw text treated as TYPE
```

The protocol is intentionally trivial — newline-delimited, human-readable, easy to debug with `screen` or `minicom`. Every command gets an `OK:` response when complete, so the relay knows when to send the next one.

### Device detection

The relay auto-detects the RP2040 in this order:

1. USB device description contains **"Nymble"** (set by `boot.py`)
2. USB vendor ID matches known Pico/CircuitPython IDs (`0x2E8A`, `0x239A`)
3. Manual port configuration in `hid.port`

## Design principles

- **The relay is a dumb pipe.** It doesn't interpret, transform, or queue text. It receives and delivers.
- **The firmware is a dumb keyboard.** It receives characters and types them. No buffering, no state, no network.
- **Authentication is mandatory but simple.** SHA-256 hashed tokens, generated once, validated on every connection.
- **Local by default.** Binds to `127.0.0.1`. LAN exposure is opt-in.
- **No cloud dependencies.** Everything runs locally. The optional discovery server is for mobile pairing only and is self-hosted.
