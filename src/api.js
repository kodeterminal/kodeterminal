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
    // Try Jupiter API first for Solana mainnet
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
      spinner.succeed("Token data fetched successfully");
      return formatJupiterData(
        jupiterResponse.data.data[contractAddress],
        contractAddress
      );
    }
  } catch (jupiterError) {
    // Continue to next API
  }

  try {
    // Try DexScreener for Solana tokens
    const dexResponse = await axios.get(
      `${DEXSCREENER_API}/dex/tokens/${contractAddress}`,
      {
        timeout: 10000,
      }
    );

    spinner.succeed("Token data fetched successfully");
    return formatDexScreenerData(dexResponse.data);
  } catch (dexError) {
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
}

export async function fetchTrendingTokens(limit = 10) {
  const spinner = ora("Fetching trending tokens...").start();

  try {
    // Try DexScreener trending tokens for Solana
    const response = await axios.get(`${DEXSCREENER_API}/dex/tokens/solana`, {
      timeout: 10000,
    });

    if (response.data.pairs && response.data.pairs.length > 0) {
      // Sort by volume and take top tokens
      const trendingPairs = response.data.pairs
        .filter(pair => pair.volume?.h24 && parseFloat(pair.volume.h24) > 0)
        .sort((a, b) => parseFloat(b.volume?.h24 || 0) - parseFloat(a.volume?.h24 || 0))
        .slice(0, limit);
      
      if (trendingPairs.length > 0) {
        spinner.succeed("Trending tokens fetched successfully");
        return trendingPairs.map(formatDexScreenerTrendingData);
      }
    }
  } catch (dexError) {
    // Continue to next API
  }

  try {
    // Fallback to pump.fun
    const response = await axios.get(`${PUMP_FUN_API}/coins/king-of-the-hill`, {
      timeout: 10000,
    });

    spinner.succeed("Trending tokens fetched successfully");
    return response.data.slice(0, limit).map(formatPumpFunData);
  } catch (error) {
    spinner.fail("Failed to fetch trending tokens");
    // Return mock data for demo
    return generateMockTrendingData(limit);
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

function formatJupiterData(data, address) {
  return {
    name: data.name || "Unknown",
    symbol: data.symbol || "N/A",
    address: address,
    price: Number.parseFloat(data.price || 0),
    marketCap: data.marketCap ? Number.parseFloat(data.marketCap) : 0,
    volume24h: 0, // Jupiter doesn't provide volume
    holders: 0, // Jupiter doesn't provide holder count
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

function formatDexScreenerData(data) {
  const pair = data.pairs?.[0];
  if (!pair) throw new Error("No trading pair found");

  return {
    name: pair.baseToken.name,
    symbol: pair.baseToken.symbol,
    address: pair.baseToken.address,
    price: Number.parseFloat(pair.priceUsd || 0),
    marketCap: Number.parseFloat(pair.fdv || 0),
    volume24h: Number.parseFloat(pair.volume?.h24 || 0),
    holders: 0, // DexScreener doesn't provide holder count
    description: "Data from DexScreener",
    website: pair.info?.websites?.[0]?.url || null,
    twitter: pair.info?.socials?.find((s) => s.type === "twitter")?.url || null,
    telegram:
      pair.info?.socials?.find((s) => s.type === "telegram")?.url || null,
  };
}

function formatDexScreenerTrendingData(pair) {
  return {
    name: pair.baseToken.name,
    symbol: pair.baseToken.symbol,
    address: pair.baseToken.address,
    price: Number.parseFloat(pair.priceUsd || 0),
    marketCap: Number.parseFloat(pair.fdv || 0),
    volume24h: Number.parseFloat(pair.volume?.h24 || 0),
    holders: 0, // DexScreener doesn't provide holder count
    description: "Data from DexScreener (Solana mainnet)",
    website: pair.info?.websites?.[0]?.url || null,
    twitter: pair.info?.socials?.find((s) => s.type === "twitter")?.url || null,
    telegram:
      pair.info?.socials?.find((s) => s.type === "telegram")?.url || null,
  };
}

function generateMockTrendingData(limit) {
  const mockTokens = [
    {
      name: "KODE",
      symbol: "KODE",
      price: 0.00123,
      marketCap: 1234567,
      volume24h: 89012,
    },
    {
      name: "DOGE",
      symbol: "DOGE",
      price: 0.08456,
      marketCap: 12345678,
      volume24h: 234567,
    },
    {
      name: "PEPE",
      symbol: "PEPE",
      price: 0.00000789,
      marketCap: 3456789,
      volume24h: 123456,
    },
    {
      name: "SHIB",
      symbol: "SHIB",
      price: 0.00001234,
      marketCap: 5678901,
      volume24h: 345678,
    },
    {
      name: "BONK",
      symbol: "BONK",
      price: 0.00002345,
      marketCap: 2345678,
      volume24h: 456789,
    },
  ];

  return mockTokens.slice(0, limit).map((token, index) => ({
    ...token,
    address: `mock${index + 1}${"x".repeat(40)}`,
    holders: Math.floor(Math.random() * 10000) + 1000,
    description: `Mock ${token.name} token for demo purposes`,
    website: null,
    twitter: null,
    telegram: null,
  }));
}
