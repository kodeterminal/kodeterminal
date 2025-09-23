#!/usr/bin/env node

import { Command } from "commander"
import chalk from "chalk"
import figlet from "figlet"
import { fetchTokenData, fetchTrendingTokens, watchToken } from "../src/api.js"
import { displayTokenInfo, displayTrendingTable, displayWatchList } from "../src/display.js"
import { addToWatchlist, getWatchlist, removeFromWatchlist } from "../src/watchlist.js"

const program = new Command()

// ASCII Art Header
console.log(
  chalk.green(
    figlet.textSync("TERKODE", {
      font: "ANSI Shadow",
      horizontalLayout: "default",
      verticalLayout: "default",
    }),
  ),
)

console.log(chalk.gray("> The terminal memecoin tracker that speaks your language\n"))

program.name("terkode").description("Terminal-based memecoin data fetcher and tracker").version("1.0.0")

program
  .command("get <address>")
  .description("Get detailed information about a token by contract address")
  .option("-w, --watch", "Watch token in real-time (updates every 30s)")
  .action(async (address, options) => {
    try {
      if (options.watch) {
        await watchToken(address)
      } else {
        const tokenData = await fetchTokenData(address)
        displayTokenInfo(tokenData)
      }
    } catch (error) {
      console.error(chalk.red("Error fetching token data:"), error.message)
    }
  })

program
  .command("trending")
  .description("Show trending memecoins")
  .option("-l, --limit <number>", "Number of tokens to show", "10")
  .action(async (options) => {
    try {
      const trending = await fetchTrendingTokens(Number.parseInt(options.limit))
      displayTrendingTable(trending)
    } catch (error) {
      console.error(chalk.red("Error fetching trending tokens:"), error.message)
    }
  })

program
  .command("watchlist")
  .description("Manage your token watchlist")
  .option("-a, --add <address>", "Add token to watchlist")
  .option("-r, --remove <address>", "Remove token from watchlist")
  .option("-s, --show", "Show current watchlist")
  .action(async (options) => {
    try {
      if (options.add) {
        await addToWatchlist(options.add)
        console.log(chalk.green(`✓ Added ${options.add} to watchlist`))
      } else if (options.remove) {
        await removeFromWatchlist(options.remove)
        console.log(chalk.yellow(`✓ Removed ${options.remove} from watchlist`))
      } else {
        const watchlist = await getWatchlist()
        await displayWatchList(watchlist)
      }
    } catch (error) {
      console.error(chalk.red("Error managing watchlist:"), error.message)
    }
  })

program
  .command("search <query>")
  .description("Search for tokens by name or symbol")
  .action(async (query) => {
    console.log(chalk.blue(`🔍 Searching for: ${query}`))
    console.log(chalk.gray("Search functionality coming soon..."))
  })

program.parse()
