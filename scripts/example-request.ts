import { ethers } from 'ethers'
import { ensureLeading0x } from '@celo/utils/lib/address'
import fetch from 'node-fetch'
import { SiweMessage } from 'siwe'

/**
 * This function shows how to use SIWE for authentication with a local server via the FiatConnect API.
 *
 * (Note that the transferId given is 'test', which probably won't exist. Note also that this function doesn't start
 *  the local server. It's just an example that you can optionally borrow from for integration testing.)
 */
async function main() {
  const privateKey =
    '0x9999999999999999999999999999999999999999999999999999999999999999'
  const publicKey = new ethers.utils.SigningKey(privateKey).compressedPublicKey
  const accountAddress = ethers.utils.computeAddress(ensureLeading0x(publicKey))
  const wallet = new ethers.Wallet(privateKey)

  const expirationDate = new Date(Date.now() - 14400000)

  const siweMessage = new SiweMessage({
    domain: 'foo.com',
    address: accountAddress,
    statement: 'Sign in with Ethereum',
    uri: 'http://foo.com',
    version: '1',
    chainId: 42220,
    nonce: '12345678',
    expirationTime: expirationDate.toISOString(),
  })
  const message = siweMessage.prepareMessage()
  const signature = await wallet.signMessage(message)

  const authResponse = await fetch('http://localhost:8080/auth/login', {
    method: 'POST',
    body: JSON.stringify({ message, signature }),
    headers: { 'Content-Type': 'application/json' },
  })

  if (!authResponse.ok) {
    console.log('Auth request failed:', await authResponse.text())
    return
  }

  // set-cookie will be of the form:
  // api-starter=<cookie-val>; Path=/; Expires=Fri, 22 Apr 2022 10:36:40 GMT; HttpOnly; SameSite=Strict
  const authCookie = authResponse.headers.raw()['set-cookie'][0]

  const response = await fetch('http://localhost:8080/transfer/test/status', {
    headers: {
      'cookie': authCookie.split(';')[0] // strip out additional fields like Path, Expires
    }
  })
  const data = await response.json()
  console.log(data)
}

main()
