# Flashing the Firmware

Getting the RP2040 running as a Nymble HID keyboard takes about 5 minutes. No programming experience needed.

## Step 1: Install CircuitPython

1. Go to [circuitpython.org/downloads](https://circuitpython.org/downloads) and find your board (e.g., "Raspberry Pi Pico")
2. Download the latest `.uf2` file
3. Hold the **BOOTSEL** button on the Pico and plug it into your computer via USB
4. A drive called **RPI-RP2** appears
5. Drag the `.uf2` file onto that drive
6. The board reboots automatically and reappears as a drive called **CIRCUITPY**

> **BOOTSEL** is the small white button on the Pico. Hold it *before* plugging in the USB cable, then release it once the drive appears.

## Step 2: Install the HID library

The firmware needs the `adafruit_hid` library to send keystrokes.

1. Go to [circuitpython.org/libraries](https://circuitpython.org/libraries)
2. Download the **Bundle for your CircuitPython version** (match major version, e.g., 9.x)
3. Unzip the bundle
4. Copy the **`adafruit_hid`** folder from `lib/` in the bundle to `CIRCUITPY/lib/`

Your drive should now look like:

```
CIRCUITPY/
  lib/
    adafruit_hid/
      __init__.mpy
      keyboard.mpy
      keyboard_layout_us.mpy
      keycode.mpy
      ...
```

## Step 3: Deploy the Nymble firmware

Clone or download the [nymble-hid-rp2040](https://github.com/NymbleType/nymble-hid-rp2040) repo. Copy two files to the CIRCUITPY drive:

```
firmware/boot.py  →  CIRCUITPY/boot.py
firmware/code.py  →  CIRCUITPY/code.py
```

> **Important:** After copying `boot.py`, **unplug and replug** the USB cable. `boot.py` only runs at power-on, so changes require a power cycle.

## Step 4: Verify

Open a serial terminal to confirm the device is working:

**Linux:**
```bash
screen /dev/ttyACM0 115200
```

**macOS:**
```bash
screen /dev/tty.usbmodem* 115200
```

**Windows:**
Use PuTTY or the Arduino Serial Monitor. Check Device Manager for the COM port number.

You should see:

```
nymble-hid-rp2040 ready
```

Type `PING` and press Enter. The response should be:

```
OK:PONG
```

The onboard LED will blink twice. Try a few more commands:

```
TYPE:Hello world          → OK:TYPED   (types "Hello world")
KEY:ENTER                 → OK:KEY     (presses Enter)
COMBO:CTRL+A              → OK:COMBO   (select all)
SPEED:50                  → OK:SPEED   (50ms between keys)
TYPE:this types slowly    → OK:TYPED
SPEED:0                   → OK:SPEED   (back to fastest)
```

Your device is ready.

> **To exit screen:** press `Ctrl+A` then `K`, then confirm with `Y`.

## Troubleshooting

### No `CIRCUITPY` drive appears
- Make sure you're using CircuitPython, not MicroPython. They're different.
- Re-enter BOOTSEL mode and re-flash the `.uf2` file.

### No serial port shows up
- Check that `boot.py` is on the drive and the board was power-cycled.
- On Linux, you may need to add your user to the `dialout` group: `sudo usermod -aG dialout $USER` (log out and back in).

### Keystrokes not appearing on the host
- On macOS, go to **System Preferences → Privacy & Security → Input Monitoring** and check that the device isn't blocked.
- Try a different USB port (some hubs don't pass HID properly).

### Characters are dropped or garbled
- Increase `CHAR_DELAY` in `code.py` (default is `0.02` seconds / 20ms between characters). Some applications need a slightly longer delay.
- Make sure you're using a **data cable**, not a charge-only cable.

### The relay can't find the device
- The relay auto-detects by looking for "Nymble" in the USB device description (set by `boot.py`). If `boot.py` wasn't copied or the board wasn't power-cycled, it falls back to detecting Pico/CircuitPython vendor IDs.
- You can also set the port explicitly in the config: `hid.port: "/dev/ttyACM0"`
