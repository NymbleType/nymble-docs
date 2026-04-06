# Security

The relay types keystrokes into your active window. Anything that can send text to the relay can type on your machine. Security matters here.

## Token authentication

Every client — WebSocket or Unix socket — must authenticate with a token. There's no anonymous access.

### Generate a token

```bash
nymble-relay --generate-token
```

Output:

```
Generated auth token:

  dGhpcyBpcyBhIHNhbXBsZSB0b2tlbg...

Use this token to authenticate clients connecting to the relay.
```

Tokens are stored as SHA-256 hashes in `~/.nymble/paired_devices.json`. The plaintext token is only shown once at generation time.

### List paired devices

```bash
nymble-relay --list-devices
```

### Revoke all tokens

```bash
nymble-relay --revoke-all
```

## Network binding

By default, the relay listens on **`127.0.0.1` (localhost only)**. Connections from other machines on the network are refused.

If you need LAN access (e.g., a mobile app or Raspberry Pi sending text over WiFi):

```yaml
# ~/.nymble/relay.yaml
server:
  bind_address: "0.0.0.0"
```

Or via CLI:

```bash
nymble-relay --bind 0.0.0.0
```

> ⚠️ **When you bind to `0.0.0.0`, any device on your network can attempt to connect.** Token auth will still block unauthenticated clients, but the port is visible. Only do this on trusted networks.

## How authentication works

### WebSocket connections

Clients authenticate via URL parameters:

**Initial pairing (first-time device):**
```
ws://127.0.0.1:9200?token=PAIRING_TOKEN
```

The pairing token is generated at relay startup and shown in the logs. The relay responds with a permanent auth token that the client stores.

**Returning device:**
```
ws://127.0.0.1:9200?auth=STORED_AUTH_TOKEN
```

Connections without a valid token or auth parameter are rejected immediately (WebSocket close code 4003).

### Unix socket connections

Send the auth token as the first line, then JSON messages:

```
AUTH_TOKEN\n
{"type": "transcript", "text": "Hello"}\n
```

Invalid tokens receive an error message and the connection is closed.

## Recommendations

| Scenario | Bind address | Notes |
|----------|-------------|-------|
| Local scripts / STT on same machine | `127.0.0.1` (default) | Most secure. Use Unix socket for IPC. |
| Mobile app on same WiFi | `0.0.0.0` | Requires token auth. Use on trusted networks only. |
| Remote access over internet | `127.0.0.1` + SSH tunnel | Don't expose the relay port directly to the internet. |

### SSH tunnel for remote use

If you need to send text from a remote machine:

```bash
# On the remote machine:
ssh -L 9200:127.0.0.1:9200 user@relay-host
```

Then connect to `ws://127.0.0.1:9200?auth=TOKEN` on the remote machine. The relay stays bound to localhost on the host.

## Unix socket permissions

The Unix socket at `~/.nymble/relay.sock` inherits the permissions of the user running the relay. Other users on the system can't connect unless they have access to your home directory.

For shared-machine setups, ensure your home directory permissions are restrictive (`chmod 700 ~`).
