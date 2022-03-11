import jwt from 'jsonwebtoken'
import { ethers } from 'ethers'
import KeyEncoder from 'key-encoder'
import { trimLeading0x, ensureLeading0x } from '@celo/utils/lib/address'
import fetch from 'node-fetch'

const keyEncoder = new KeyEncoder('secp256k1')

/**
 * This function shows how to generate and sign a JWT for authentication with a local server via the FiatConnect API.
 *
 * (Note that the transferId given is 'test', which probably won't exist. Note also that this function doesn't start
 *  the local server. It's just an example that you can optionally borrow from for integration testing.)
 */
async function main() {
  const privateKey = '0x9999999999999999999999999999999999999999999999999999999999999999'
  const privateKeyPem = keyEncoder.encodePrivate(trimLeading0x(privateKey), 'raw', 'pem')

  const publicKey = new ethers.utils.SigningKey(privateKey).compressedPublicKey

  const accountAddress = ethers.utils.computeAddress(ensureLeading0x(publicKey))

  const token = jwt.sign({ iss: publicKey, sub: accountAddress }, privateKeyPem, {
    algorithm: 'ES256',
    expiresIn: '5m'
  })

  const response = await fetch('http://localhost:8080/transfer/test/status', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  const data = await response.json()
  console.log(data)
}

main()
