# Installation

## Prebuilt Binaries (recommended)

Download a standalone binary from the [latest release](https://github.com/NymbleType/nymble-relay/releases/latest) — no Python required:

| Platform | File |
|----------|------|
| Linux x86_64 | `nymble-relay-linux-x86_64` |
| macOS Apple Silicon | `nymble-relay-macos-arm64` |
| Windows x86_64 | `nymble-relay-windows-x86_64.exe` |

### Linux / macOS

```bash
chmod +x nymble-relay-*
./nymble-relay-linux-x86_64 --help
```

> **macOS Gatekeeper:** On first launch, macOS may block the unsigned binary. Right-click → Open, or run:
> ```bash
> xattr -d com.apple.quarantine nymble-relay-macos-arm64
> ```

### Windows

Download the `.exe` and run it from a terminal:

```
nymble-relay-windows-x86_64.exe --help
```

## Install from PyPI

```bash
pip install nymble-relay
```

This installs the relay daemon with WebSocket server, Unix socket listener, and clipboard/xdotool output support. Serial communication with the RP2040 HID device requires `pyserial`, which is included by default.

## Run from source

```bash
git clone https://github.com/NymbleType/nymble-relay.git
cd nymble-relay
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

## Verify installation

```bash
nymble-relay --help
```

## Running as a systemd service (Linux)

For always-on use, run the relay as a user service:

```ini
# ~/.config/systemd/user/nymble-relay.service
[Unit]
Description=Nymble Relay — text-to-keystroke daemon
After=default.target

[Service]
ExecStart=%h/.local/bin/nymble-relay
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

Enable and start:

```bash
systemctl --user daemon-reload
systemctl --user enable nymble-relay
systemctl --user start nymble-relay
systemctl --user status nymble-relay
```

> **Note:** The relay needs access to the USB serial device. Make sure your user is in the `dialout` group (`sudo usermod -aG dialout $USER`).

## Running on macOS

On macOS, you can use a LaunchAgent:

```xml
<!-- ~/Library/LaunchAgents/com.nymble.relay.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.nymble.relay</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/nymble-relay</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
</dict>
</plist>
```

```bash
launchctl load ~/Library/LaunchAgents/com.nymble.relay.plist
```

## Requirements

- Python 3.10+
- `websockets` ≥ 12.0
- `pyyaml` ≥ 6.0
- `pyserial` ≥ 3.5 (for HID output)
