import fs from "fs/promises"
import path from "path"
import os from "os"

const WATCHLIST_FILE = path.join(os.homedir(), ".terkode-watchlist.json")

export async function getWatchlist() {
  try {
    const data = await fs.readFile(WATCHLIST_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

export async function addToWatchlist(address) {
  const watchlist = await getWatchlist()
  if (!watchlist.includes(address)) {
    watchlist.push(address)
    await saveWatchlist(watchlist)
  }
}

export async function removeFromWatchlist(address) {
  const watchlist = await getWatchlist()
  const filtered = watchlist.filter((addr) => addr !== address)
  await saveWatchlist(filtered)
}

async function saveWatchlist(watchlist) {
  await fs.writeFile(WATCHLIST_FILE, JSON.stringify(watchlist, null, 2))
}
