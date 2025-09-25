import axios from "axios";
import chalk from "chalk";
import ora from "ora";
import { displayTokenInfo } from "./display.js";

const SOLANA_RPC = "https://api.mainnet-beta.solana.com";
const JUPITER_API = "https://price.jup.ag/v4";
const DEXSCREENER_API = "https://api.dexscreener.com/latest";
const PUMP_FUN_API = "https://frontend-api.pump.fun";

export async function fetchTokenData(contractAddress) {
  const spinner = ora("Fetching token data...").start();

  try {
    // Try DexScreener for Solana tokens first
    const dexResponse = await axios.get(
      `${DEXSCREENER_API}/dex/tokens/${contractAddress}`,
      {
        timeout: 10000,
      }
    );

    if (dexResponse.data.pairs && dexResponse.data.pairs.length > 0) {
      // Try to get holder count from Solana RPC
      let holderCount = 0;
      try {
        holderCount = await getTokenHolderCount(contractAddress);
      } catch (holderError) {
        // If we can't get holder count, continue with 0
      }

      spinner.succeed("Token data fetched successfully");
      return formatDexScreenerData(dexResponse.data, holderCount);
    }
  } catch (dexError) {
    // Continue to next API
  }

  try {
    // Try Jupiter API for Solana mainnet
    const jupiterResponse = await axios.get(
      `${JUPITER_API}/price?ids=${contractAddress}`,
      {
        timeout: 10000,
      }
    );

    if (
      jupiterResponse.data.data &&
      jupiterResponse.data.data[contractAddress]
    ) {
      // Try to get holder count from Solana RPC
      let holderCount = 0;
      try {
        holderCount = await getTokenHolderCount(contractAddress);
      } catch (holderError) {
        // If we can't get holder count, continue with 0
      }

      spinner.succeed("Token data fetched successfully");
      return formatJupiterData(
        jupiterResponse.data.data[contractAddress],
        contractAddress,
        holderCount
      );
    }
  } catch (jupiterError) {
    // Continue to next API
  }

  try {
    // Fallback to pump.fun
    const pumpResponse = await axios.get(
      `${PUMP_FUN_API}/coins/${contractAddress}`,
      {
        timeout: 10000,
      }
    );

    spinner.succeed("Token data fetched successfully");
    return formatPumpFunData(pumpResponse.data);
  } catch (pumpError) {
    spinner.fail("Failed to fetch token data");
    throw new Error("Token not found on Solana mainnet APIs");
  }
}

export async function watchToken(contractAddress) {
  console.log(chalk.blue(`👀 Watching token: ${contractAddress}`));
  console.log(chalk.gray("Press Ctrl+C to stop watching\n"));

  const updateInterval = setInterval(async () => {
    try {
      const tokenData = await fetchTokenData(contractAddress);
      console.clear();
      console.log(chalk.green("🔄 Live Data (Updates every 30s)\n"));
      displayTokenInfo(tokenData);
    } catch (error) {
      console.error(chalk.red("Error updating token data:"), error.message);
    }
  }, 30000);

  // Initial fetch
  try {
    const tokenData = await fetchTokenData(contractAddress);
    displayTokenInfo(tokenData);
  } catch (error) {
    console.error(
      chalk.red("Error fetching initial token data:"),
      error.message
    );
  }

  // Handle Ctrl+C
  process.on("SIGINT", () => {
    clearInterval(updateInterval);
    console.log(chalk.yellow("\n👋 Stopped watching token"));
    process.exit(0);
  });
}

async function getTokenHolderCount(mintAddress) {
  try {
    // Use Solana RPC to get all token accounts for this mint
    const response = await axios.post(SOLANA_RPC, {
      jsonrpc: "2.0",
      id: 1,
      method: "getProgramAccounts",
      params: [
        "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", // SPL Token program
        {
          encoding: "jsonParsed",
          filters: [
            {
              dataSize: 165, // Token account data size
            },
            {
              memcmp: {
                offset: 0, // Mint address offset in token account
                bytes: mintAddress,
              },
            },
          ],
        },
      ],
    });

    if (response.data.result && Array.isArray(response.data.result)) {
      // Filter out accounts with zero balance
      const activeHolders = response.data.result.filter((account) => {
        const balance = account.account.data.parsed.info.tokenAmount.uiAmount;
        return balance > 0;
      });
      return activeHolders.length;
    }
    return 0;
  } catch (error) {
    // If we can't get holder count, return 0
    return 0;
  }
}

function formatJupiterData(data, address, holderCount = 0) {
  return {
    name: data.name || "Unknown",
    symbol: data.symbol || "N/A",
    address: address,
    price: Number.parseFloat(data.price || 0),
    marketCap: data.marketCap ? Number.parseFloat(data.marketCap) : 0,
    volume24h: 0, // Jupiter doesn't provide volume
    holders: holderCount,
    description: "Data from Jupiter API (Solana mainnet)",
    website: null,
    twitter: null,
    telegram: null,
  };
}

function formatPumpFunData(data) {
  return {
    name: data.name || "Unknown",
    symbol: data.symbol || "N/A",
    address: data.mint || data.address,
    price: data.usd_market_cap ? data.usd_market_cap / data.total_supply : 0,
    marketCap: data.usd_market_cap || 0,
    volume24h: data.volume_24h || 0,
    holders: data.holder_count || 0,
    description: data.description || "No description available",
    website: data.website || null,
    twitter: data.twitter || null,
    telegram: data.telegram || null,
  };
}

function formatDexScreenerData(data, holderCount = 0) {
  const pair = data.pairs?.[0];
  if (!pair) throw new Error("No trading pair found");

  return {
    name: pair.baseToken.name,
    symbol: pair.baseToken.symbol,
    address: pair.baseToken.address,
    price: Number.parseFloat(pair.priceUsd || 0),
    marketCap: Number.parseFloat(pair.fdv || 0),
    volume24h: Number.parseFloat(pair.volume?.h24 || 0),
    holders: holderCount,
    description: "Data from DexScreener",
    website: pair.info?.websites?.[0]?.url || null,
    twitter: pair.info?.socials?.find((s) => s.type === "twitter")?.url || null,
    telegram:
      pair.info?.socials?.find((s) => s.type === "telegram")?.url || null,
  };
}
