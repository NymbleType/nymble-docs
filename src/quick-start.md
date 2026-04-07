# Quick Start

Get text typing as real keystrokes in about 10 minutes.

## What you need

- A computer running **Linux, macOS, or Windows**
- A **Raspberry Pi Pico** (or any RP2040 board) — ~$4 from most electronics retailers
- A **USB data cable** (not a charge-only cable)

## 1. Flash the RP2040

Hold the **BOOTSEL** button on the Pico and plug it into your computer. It appears as a USB drive called `RPI-RP2`.

1. Download [CircuitPython for the Pico](https://circuitpython.org/board/raspberry_pi_pico/)
2. Drag the `.uf2` file onto the `RPI-RP2` drive
3. The board reboots and appears as `CIRCUITPY`
4. Download the [Adafruit CircuitPython Bundle](https://circuitpython.org/libraries) and copy `adafruit_hid/` to `CIRCUITPY/lib/`
5. Copy `boot.py` and `code.py` from the [nymble-hid-rp2040](https://github.com/NymbleType/nymble-hid-rp2040) firmware folder to `CIRCUITPY/`
6. Unplug and replug the Pico

> See [Flashing the Firmware](./hardware/flashing.md) for detailed instructions and troubleshooting.

## 2. Install the relay

Download the binary for your OS from the [latest release](https://github.com/NymbleType/nymble-relay/releases/latest), or install via pip:

```bash
# Option A: prebuilt binary (no Python needed)
chmod +x nymble-relay-*    # Linux/macOS only

# Option B: pip
pip install nymble-relay
```

## 3. Generate an auth token

```bash
nymble-relay --generate-token
```

Save the token — you'll need it to send text to the relay.

## 4. Start the relay

```bash
nymble-relay
```

You should see:

```
Connected to HID device on /dev/ttyACM0
WebSocket server listening on ws://127.0.0.1:9200
nymble-relay running (output: hid)
```

## 5. Send some text

Open a text editor and click so it has focus. Then, from another terminal:

```bash
# Via Unix socket (simplest for local use)
(echo "YOUR_TOKEN"; echo '{"type":"transcript","text":"Hello from Nymble!"}') | nc -N -U ~/.nymble/relay.sock
```

Or via WebSocket:

```bash
# Using websocat (install: cargo install websocat)
echo '{"type":"transcript","text":"Hello from Nymble!"}' | websocat ws://127.0.0.1:9200?auth=YOUR_TOKEN
```

The text appears in your editor, typed out as real keystrokes. ⌨️

## Next steps

- [Configuration](./relay/configuration.md) — output method, typing speed, bind address
- [Security](./relay/security.md) — token auth, LAN exposure, hardening
- [Sending Text](./integration/sending-text.md) — integrate with STT tools, scripts, and other apps
- [Buying an RP2040](./hardware/buying.md) — where to get one and what to look for
