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

We recommend using a [virtual environment](https://docs.python.org/3/library/venv.html) to keep dependencies isolated:

```bash
python3 -m venv .venv
source .venv/bin/activate          # Linux/macOS
# .venv\Scripts\activate           # Windows

pip install nymble-relay
```

This installs the relay daemon with WebSocket server, Unix socket listener, and clipboard/xdotool output support. Serial communication with the RP2040 HID device requires `pyserial`, which is included by default.

Once installed, run it directly from the terminal:

```bash
nymble-relay --help                # show all options
nymble-relay                       # start the relay daemon
nymble-relay --generate-token      # generate an auth token
```

> **Remember:** You need to activate the venv each time you open a new terminal — otherwise the `nymble-relay` command won't be found. Just run `source .venv/bin/activate` (or `.venv\Scripts\activate` on Windows) before using it.

> **What's a virtual environment?** It's an isolated Python installation just for this project. Your system Python stays untouched, and you avoid version conflicts with other tools. Activate it each time you open a new terminal with `source .venv/bin/activate` (or `.venv\Scripts\activate` on Windows).

## Run from source

```bash
git clone https://github.com/NymbleType/nymble-relay.git
cd nymble-relay
python3 -m venv .venv
source .venv/bin/activate          # Linux/macOS
# .venv\Scripts\activate           # Windows
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
