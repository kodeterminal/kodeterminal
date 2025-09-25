import chalk from "chalk";
import { fetchTokenData } from "./api.js";

export function displayTokenInfo(tokenData) {
  console.log(chalk.green.bold(`\n📊 ${tokenData.name} (${tokenData.symbol})`));
  console.log(chalk.gray("─".repeat(50)));

  console.log(chalk.blue("Contract Address:"), chalk.white(tokenData.address));
  console.log(
    chalk.blue("Price:"),
    chalk.green(`$${formatNumber(tokenData.price)}`)
  );
  console.log(
    chalk.blue("Market Cap:"),
    chalk.yellow(`$${formatLargeNumber(tokenData.marketCap)}`)
  );
  console.log(
    chalk.blue("24h Volume:"),
    chalk.cyan(`$${formatLargeNumber(tokenData.volume24h)}`)
  );
  console.log(
    chalk.blue("Holders:"),
    chalk.magenta(formatNumber(tokenData.holders))
  );

  if (tokenData.description) {
    console.log(
      chalk.blue("Description:"),
      chalk.gray(tokenData.description.substring(0, 100) + "...")
    );
  }

  // Social links
  const socials = [];
  if (tokenData.website) socials.push(chalk.blue("🌐 Website"));
  if (tokenData.twitter) socials.push(chalk.blue("🐦 Twitter"));
  if (tokenData.telegram) socials.push(chalk.blue("💬 Telegram"));

  if (socials.length > 0) {
    console.log(chalk.blue("Socials:"), socials.join(" | "));
  }

  console.log(chalk.gray("─".repeat(50)));
  console.log(chalk.gray(`Last updated: ${new Date().toLocaleTimeString()}\n`));
}


export async function displayWatchList(watchlist) {
  if (watchlist.length === 0) {
    console.log(chalk.yellow("📝 Your watchlist is empty"));
    console.log(chalk.gray("Add tokens with: kode watchlist --add <address>"));
    return;
  }

  console.log(chalk.green.bold("\n👀 Your Watchlist\n"));

  for (const address of watchlist) {
    try {
      const tokenData = await fetchTokenData(address);
      displayTokenInfo(tokenData);
    } catch (error) {
      console.log(
        chalk.red(`❌ Error fetching data for ${address}: ${error.message}`)
      );
    }
  }
}

function formatNumber(num) {
  if (num < 0.000001) return num.toExponential(2);
  if (num < 0.01) return num.toFixed(6);
  if (num < 1) return num.toFixed(4);
  return num.toFixed(2);
}

function formatLargeNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toFixed(2);
}
