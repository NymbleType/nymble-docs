<div style="text-align:center; margin-bottom:24px;">
  <canvas id="nymbleIcon" width="140" height="140" style="border-radius:22.5%; filter:drop-shadow(0 0 40px rgba(224,152,0,0.25));"></canvas>
</div>

# Nymble Type

**An open source text-to-keystroke pipeline.**

Nymble Type takes text from any source and types it into any application as real keystrokes — not clipboard paste, not virtual keyboard input, but actual key presses from a real USB keyboard device.

The "keyboard" is a $4 Raspberry Pi Pico (RP2040) running a few hundred lines of CircuitPython. It plugs into your computer via USB, and your OS sees it as a standard keyboard. No drivers, no permissions dialogs, no configuration on the host machine.

## Why real keystrokes?

Most voice-to-text tools paste from the clipboard. That works until it doesn't:

- **Secure input fields** block paste (banking sites, password managers, 2FA codes)
- **Remote desktop sessions** don't share the local clipboard reliably
- **Games and full-screen apps** ignore clipboard events
- **Terminals and IDEs** sometimes mangle pasted text (bracket paste mode, auto-indent)
- **Clipboard managers** intercept your paste and overwrite what you had copied

A USB HID keyboard has none of these problems. To the operating system, it's just someone typing. Every app that accepts keyboard input accepts Nymble. No exceptions.

## What's in the box

Nymble Type is two components:

| Component | Repo | What it does |
|-----------|------|-------------|
| **Relay** | [nymble-relay](https://github.com/NymbleType/nymble-relay) | A headless daemon that receives text over WebSocket or Unix socket and delivers it as keystrokes |
| **Firmware** | [nymble-hid-rp2040](https://github.com/NymbleType/nymble-hid-rp2040) | CircuitPython firmware that turns an RP2040 board into a USB HID keyboard |

The relay is the bridge. It listens for text from whatever source you have — a speech-to-text engine, a script, a mobile app, a chatbot — and sends it to the RP2040 over USB serial. The RP2040 types it out, character by character.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Any source  │────▶│ nymble-relay │────▶│  RP2040 HID  │──▶ keystrokes
│  (text in)   │     │  (daemon)    │     │  (USB device) │
└──────────────┘     └──────────────┘     └──────────────┘
```

That's the whole pipeline. Text goes in, keystrokes come out.

## Fallback modes

No RP2040? The relay still works:

- **xdotool** — X11 keystroke simulation on Linux (no hardware needed)
- **Clipboard paste** — universal fallback on any OS

These are useful for testing or machines where USB hardware isn't practical. But the HID path is the point — it's what makes Nymble work where nothing else does.

## Who is this for?

- **Anyone who uses voice-to-text** and is tired of clipboard paste breaking in specific apps
- **Accessibility users** who need reliable keystroke input without per-app configuration
- **Developers** who want a programmable text-to-keystroke bridge for automation
- **Privacy-conscious users** who want offline, local-only voice typing
- **People on locked-down machines** where you can't install software but can plug in a USB keyboard
