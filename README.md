<<<<<<< HEAD
# TERKODE 🚀

> The terminal memecoin tracker that speaks your language

TERKODE is a powerful command-line interface for tracking memecoin data in real-time. Built for developers and crypto enthusiasts who prefer the terminal over web interfaces.

## Features

- 📊 **Real-time token data** - Get live price, market cap, volume, and holder information
- 🔥 **Trending tokens** - See what's hot in the memecoin space
- 👀 **Watchlist management** - Track your favorite tokens
- ⚡ **Live monitoring** - Watch tokens with real-time updates
- 🎨 **Beautiful terminal UI** - Clean, colorful output with ASCII art
- 🔍 **Multi-source data** - Fetches from pump.fun and DexScreener APIs

## Installation

### Global Installation
\`\`\`bash
npm install -g terkode
\`\`\`

### Local Development
\`\`\`bash
git clone https://github.com/yourusername/terkode.git
cd terkode
npm install
npm link
\`\`\`

## Usage

### Get Token Information
\`\`\`bash
# Get basic token info
terkode get <contract_address>

# Watch token with live updates (every 30s)
terkode get <contract_address> --watch
\`\`\`

### View Trending Tokens
\`\`\`bash
# Show top 10 trending memecoins
terkode trending

# Show top 20 trending memecoins
terkode trending --limit 20
\`\`\`

### Manage Watchlist
\`\`\`bash
# Add token to watchlist
terkode watchlist --add <contract_address>

# Remove token from watchlist
terkode watchlist --remove <contract_address>

# Show current watchlist with live data
terkode watchlist --show
\`\`\`

### Search Tokens (Coming Soon)
\`\`\`bash
# Search for tokens by name or symbol
terkode search "dogecoin"
\`\`\`



<!--
**kodeterminal/kodeterminal** is a ✨ _special_ ✨ repository because its `README.md` (this file) appears on your GitHub profile.

Here are some ideas to get you started:

- 🔭 I’m currently working on ...
- 🌱 I’m currently learning ...
- 👯 I’m looking to collaborate on ...
- 🤔 I’m looking for help with ...
- 💬 Ask me about ...
- 📫 How to reach me: ...
- 😄 Pronouns: ...
- ⚡ Fun fact: ...
-->
>>>>>>> e556f86803e8c37fa79b4fb98b502397693556fe
