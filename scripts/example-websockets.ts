// This script will watch for Transfer events emitted from the cUSD contract.

// At the time of writing, Forno websocket connections are disconnected after 20 minutes.
// The native Websocket provider included with ethers does not natively handle disconnects,
// so we use a web3 provider instead.

import { ethers } from 'ethers'
import Web3WsProvider from 'web3-providers-ws'
import CUSD_ABI from './abis/cUSD.json'

const cUSDAddress = "0x765DE816845861e75A25fCA122bb6898B8B1282a" // cUSD contract

function main() {
  const provider = new ethers.providers.Web3Provider(
    new (Web3WsProvider as any)('wss://forno.celo.org/ws', {
      clientConfig: {
        keepalive: true,
        keepaliveInterval: 60000, // ms
      },
      // Enable auto reconnection
      reconnect: {
        auto: true,
        delay: 1000, // ms
        maxAttempts: 5,
        onTimeout: false
      }
    }),
  )

  const cUSDContract = new ethers.Contract(cUSDAddress, CUSD_ABI, provider)

  cUSDContract.on('Transfer', async (from, to, value) => {
    console.log(`Transfer of cUSD from ${from} to ${to} for ${ethers.utils.formatEther(value)}`)
  })
}

main()
