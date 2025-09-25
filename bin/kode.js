#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import figlet from "figlet";
import { fetchTokenData, watchToken } from "../src/api.js";
import { displayTokenInfo, displayWatchList } from "../src/display.js";
import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} from "../src/watchlist.js";

const program = new Command();

// ASCII Art Header
console.log(
  chalk.green(
    figlet.textSync("KODE TERMINAL", {
      font: "ANSI Shadow",
      horizontalLayout: "default",
      verticalLayout: "default",
    })
  )
);

console.log(
  chalk.gray("> The terminal memecoin tracker that speaks your language")
);
console.log(chalk.blue("🌐 Visit us: https://www.koodeterminal.com\n"));

program
  .name("kode")
  .description("Terminal-based memecoin data fetcher and tracker")
  .version("1.0.0");

program
  .command("get <address>")
  .description("Get detailed information about a token by contract address")
  .option("-w, --watch", "Watch token in real-time (updates every 30s)")
  .action(async (address, options) => {
    try {
      if (options.watch) {
        await watchToken(address);
      } else {
        const tokenData = await fetchTokenData(address);
        displayTokenInfo(tokenData);
      }
    } catch (error) {
      console.error(chalk.red("Error fetching token data:"), error.message);
    }
  });

program
  .command("watchlist")
  .description("Manage your token watchlist")
  .option("-a, --add <address>", "Add token to watchlist")
  .option("-r, --remove <address>", "Remove token from watchlist")
  .option("-s, --show", "Show current watchlist")
  .action(async (options) => {
    try {
      if (options.add) {
        await addToWatchlist(options.add);
        console.log(chalk.green(`✓ Added ${options.add} to watchlist`));
      } else if (options.remove) {
        await removeFromWatchlist(options.remove);
        console.log(chalk.yellow(`✓ Removed ${options.remove} from watchlist`));
      } else {
        const watchlist = await getWatchlist();
        await displayWatchList(watchlist);
      }
    } catch (error) {
      console.error(chalk.red("Error managing watchlist:"), error.message);
    }
  });

program
  .command("search <query>")
  .description("Search for tokens by name or symbol")
  .action(async (query) => {
    console.log(chalk.blue(`🔍 Searching for: ${query}`));
    console.log(chalk.gray("Search functionality coming soon..."));
  });

program.parse();
