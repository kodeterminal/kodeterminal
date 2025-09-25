import chalk from "chalk";
import { table } from "table";
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

export function displayTrendingTable(tokens) {
  console.log(chalk.green.bold("\n🔥 Trending Memecoins\n"));

  const data = [
    [
      chalk.blue.bold("Rank"),
      chalk.blue.bold("Name"),
      chalk.blue.bold("Symbol"),
      chalk.blue.bold("Price"),
      chalk.blue.bold("Market Cap"),
      chalk.blue.bold("24h Volume"),
    ],
  ];

  tokens.forEach((token, index) => {
    data.push([
      chalk.yellow(`#${index + 1}`),
      chalk.white(token.name),
      chalk.cyan(token.symbol),
      chalk.green(`$${formatNumber(token.price)}`),
      chalk.yellow(`$${formatLargeNumber(token.marketCap)}`),
      chalk.cyan(`$${formatLargeNumber(token.volume24h)}`),
    ]);
  });

  const config = {
    border: {
      topBody: chalk.gray("─"),
      topJoin: chalk.gray("┬"),
      topLeft: chalk.gray("┌"),
      topRight: chalk.gray("┐"),
      bottomBody: chalk.gray("─"),
      bottomJoin: chalk.gray("┴"),
      bottomLeft: chalk.gray("└"),
      bottomRight: chalk.gray("┘"),
      bodyLeft: chalk.gray("│"),
      bodyRight: chalk.gray("│"),
      bodyJoin: chalk.gray("│"),
      joinBody: chalk.gray("─"),
      joinLeft: chalk.gray("├"),
      joinRight: chalk.gray("┤"),
      joinJoin: chalk.gray("┼"),
    },
  };

  console.log(table(data, config));
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
