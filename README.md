# KODE 🚀

> The terminal memecoin tracker that speaks your language

KODE is a powerful command-line interface for tracking memecoin data in real-time. Built for developers and crypto enthusiasts who prefer the terminal over web interfaces.

## Features

- 📊 **Real-time token data** - Get live price, market cap, volume, and holder information
- 🔥 **Trending tokens** - See what's hot in the memecoin space
- 👀 **Watchlist management** - Track your favorite tokens
- ⚡ **Live monitoring** - Watch tokens with real-time updates
- 🎨 **Beautiful terminal UI** - Clean, colorful output with ASCII art
- 🔍 **Multi-source data** - Fetches from Solana mainnet APIs

## Installation

### Global Installation

```bash
npm install -g kode
```

### Local Development

```bash
git clone https://github.com/yourusername/kode.git
cd kode
npm install
npm link
```

## Usage

### Get Token Information

```bash
# Get basic token info
kode get <contract_address>

# Watch token with live updates (every 30s)
kode get <contract_address> --watch
```

### View Trending Tokens

```bash
# Show top 10 trending memecoins
kode trending

# Show top 20 trending memecoins
kode trending --limit 20
```

### Manage Watchlist

```bash
# Add token to watchlist
kode watchlist --add <contract_address>

# Remove token from watchlist
kode watchlist --remove <contract_address>

# Show current watchlist with live data
kode watchlist --show
```

### Search Tokens (Coming Soon)

```bash
# Search for tokens by name or symbol
kode search "dogecoin"
```

## Examples

```bash
# Track a Solana token
kode get CejBaQt21V512bbE4tDbQ86vtry71R3JY3f8Heuppump
```
