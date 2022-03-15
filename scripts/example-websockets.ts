// This script will watch for Transfer events emitted from the cUSD contract. This script was simplified and
// adapated from this version which uses Web3 internally:
// https://gist.github.com/critesjosh/a230e7b2eb54c8d330ca57db1f6239db

// At the time of writing, Forno websocket connections are disconnected after 20 minutes.
// When the websocket connection is broken, the script will stop listening for 500ms before attempting to reconnect.
// If a block is created during that gap, the relevant events in that block will be missed. Running two or more
// listeners concurrently will reduce the chance of missed blocks.

// This script has not been extensively tested. In particular, the logic for re-initiating a connection
// with Forno on disconnect is not guaranteed to be correct. Use at your own risk.

import { ethers } from 'ethers'
import CUSD_ABI from './abis/cUSD.json'

const cUSDAddress = "0x765DE816845861e75A25fCA122bb6898B8B1282a" // cUSD contract

function setupProviderAndSubscriptions() {
  const provider = new ethers.providers.WebSocketProvider('wss://forno.celo.org/ws')
  const cUSDContract = new ethers.Contract(cUSDAddress, CUSD_ABI, provider)

  let setupNewProvider = false
  // Keeps track of the number of times we've retried to set up a new provider
  // and subs without a successful header
  let sequentialRetryCount = 0

  const setupNewProviderAndSubs = async () => {
    // To prevent us from retrying too aggressively, wait a little if
    // we try setting up multiple times in a row
    const sleepTimeMs = sequentialRetryCount * 100
    console.log('sleeping', sleepTimeMs)
    await sleep(sleepTimeMs)
    sequentialRetryCount++
    // To avoid a situation where multiple error events are triggered
    if (!setupNewProvider) {
      setupNewProvider = true
      setupProviderAndSubscriptions()
    }
  }

  provider.on('error', async (error: any) => {
    console.log('WebsocketProvider encountered an error', error)
    await setupNewProviderAndSubs()
  })

  cUSDContract.on('Transfer', async (from, to, value) => {
    console.log(`Transfer of cUSD from ${from} to ${to} for ${ethers.utils.formatEther(value)}`)
  })

  cUSDContract.on('error', async (error: any) => {
    console.log(`Contract listener encountered an error`, error)
    await setupNewProviderAndSubs()
  })
}

setupProviderAndSubscriptions()

function sleep(ms: number, onSleep?: () => void): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
    if (onSleep) {
      onSleep()
    }
  })
}
