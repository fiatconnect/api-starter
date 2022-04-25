import { loadConfig } from './config'
import { getClientAuthMiddleware } from './middleware/authenticate'
import { initApp } from './app'

async function main() {
  const { port, authConfig, sessionSecret } = loadConfig()

  const clientAuthMiddleware = getClientAuthMiddleware(authConfig)

  const app = initApp({
    clientAuthMiddleware,
    sessionSecret,
    chainId: authConfig.chainId,
  })

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening on port ${port}`)
  })
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.log(err)
  process.exit(1)
})
