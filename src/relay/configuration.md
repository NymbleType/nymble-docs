# Configuration

The relay loads configuration in layers. Each layer overrides the previous:

1. **Bundled defaults** — `config/config.yaml` in the package
2. **User config** — `~/.nymble/relay.yaml`
3. **Explicit path** — `--config /path/to/file.yaml`
4. **CLI arguments** — highest priority

## Full reference

```yaml
server:
  # WebSocket listen port
  ws_port: 9200

  # Bind address. Default: 127.0.0.1 (local only).
  # Set to 0.0.0.0 for LAN access (e.g., mobile app on same network).
  bind_address: "127.0.0.1"

  # Unix socket for local IPC (scripts, nymble-stt, etc.)
  unix_socket: "~/.nymble/relay.sock"

output:
  # Output method: auto | hid | clipboard | xdotool
  # "auto" tries hid → xdotool → clipboard in order.
  method: auto

  typing_speed:
    # Delay between keystrokes in milliseconds (0 = fastest)
    delay_ms: 0
    # Characters per burst (0 = all at once; only used when delay_ms > 0)
    burst_size: 0
    # Delay before starting to type, in milliseconds
    pre_delay_ms: 0

  # Append Enter after each transcription
  append_newline: false
  # Text to prepend to every transcription
  prefix: ""
  # Text to append to every transcription
  suffix: ""

hid:
  # Serial port for RP2040 (null = auto-detect)
  port: null
  # Baud rate for serial communication
  baud_rate: 115200
  # Serial read timeout in seconds
  timeout: 1.0

pairing:
  # Discovery server URL for remote pairing (empty = disabled)
  discovery_url: ""
```

## CLI overrides

| Flag | Overrides |
|------|-----------|
| `--port 9300` | `server.ws_port` |
| `--bind 0.0.0.0` | `server.bind_address` |
| `--socket /tmp/relay.sock` | `server.unix_socket` |
| `--output hid` | `output.method` |
| `--config ~/custom.yaml` | Adds a config layer |
| `--verbose` / `-v` | Enables debug logging |

## Output methods

### `hid` — USB HID keyboard (RP2040)

Real keystrokes via the RP2040 device. The relay auto-detects the device by looking for "Nymble" in the USB description. If that fails, it falls back to known Pico/CircuitPython vendor IDs.

To specify the port explicitly:

```yaml
hid:
  port: "/dev/ttyACM0"  # Linux
  # port: "/dev/tty.usbmodem1101"  # macOS
  # port: "COM3"  # Windows
```

### `xdotool` — X11 keystroke simulation

Uses `xdotool` to simulate keystrokes on Linux with X11. No hardware needed.

```bash
sudo apt install xdotool  # Debian/Ubuntu
```

> **Note:** xdotool doesn't work on Wayland. Use HID or clipboard on Wayland desktops.

### `clipboard` — Copy and paste

Copies text to the clipboard and simulates `Ctrl+V` (or `Cmd+V` on macOS). Works everywhere but has the limitations that HID exists to solve — some apps block paste, clipboard managers interfere, etc.

### `auto` — Try all methods

Default mode. Tries `hid` → `xdotool` → `clipboard` in order, using the first one that's available.

## Typing speed

By default, text is sent as fast as possible. For applications that drop rapid keystrokes, add a delay:

```yaml
output:
  typing_speed:
    delay_ms: 30        # 30ms between keystrokes
    burst_size: 5       # type 5 chars, pause, repeat
    pre_delay_ms: 200   # wait 200ms before starting
```

Typing speed can also be updated at runtime by sending a `config` message over the protocol.

## Config file location

Create `~/.nymble/relay.yaml` with only the values you want to override:

```yaml
# Example: force HID output on a specific port, with a small typing delay
output:
  method: hid
  typing_speed:
    delay_ms: 20

hid:
  port: "/dev/ttyACM0"
```
