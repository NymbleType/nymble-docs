# Buying an RP2040

The RP2040 is the microcontroller chip designed by Raspberry Pi. It's the brain of the Raspberry Pi Pico and dozens of third-party boards. It's cheap, widely available, and trivial to set up.

## What to buy

The **Raspberry Pi Pico** is the simplest choice:

- **Price:** ~$4 USD (sometimes less)
- **Where:** Amazon, Adafruit, SparkFun, PiShop, AliExpress, Micro Center, or your local electronics store
- **What to search:** "Raspberry Pi Pico" (not "Pico W" — you don't need WiFi)

Any RP2040-based board works. The Pico is just the cheapest and most common. Other options include:

| Board | Notes |
|-------|-------|
| Raspberry Pi Pico | The default. $4, widely stocked. |
| Raspberry Pi Pico H | Same as Pico but with pre-soldered headers. No soldering needed. |
| Adafruit QT Py RP2040 | Tiny, USB-C, good if you want something smaller. |
| Seeed XIAO RP2040 | Another compact USB-C option. |
| Waveshare RP2040-Zero | Very small form factor with USB-C. |

> **Tip:** If you're buying from AliExpress or similar, boards are often under $2. They all work the same way — CircuitPython doesn't care about the brand.

## What you also need

- **A USB data cable.** Many cheap cables are charge-only and won't work for serial communication. If in doubt, use the cable that came with a phone or external drive. Micro-USB for the standard Pico, USB-C for newer boards.

That's it. No breadboard, no wiring, no soldering, no other components.

## Is this the Raspberry Pi computer?

No. The Raspberry Pi Pico is a **microcontroller board**, not a full computer. It's a tiny chip on a small PCB with a USB port. It doesn't run Linux, doesn't have an HDMI port, and costs a fraction of the Raspberry Pi single-board computers.

You plug it in via USB and it shows up as a USB device — in our case, a keyboard. That's all it does.

## RP2040 vs RP2350

Raspberry Pi has released the RP2350 (used in the Pico 2). The Nymble firmware works on both — the `boot.py` identifies itself by firmware version, not by chip. If you happen to buy a Pico 2, it'll work fine.
