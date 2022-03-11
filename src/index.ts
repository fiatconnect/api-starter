import { loadConfig } from './config'
import {
  getJwtAuthMiddleware,
  getClientAuthMiddleware,
} from './middleware/authenticate'
import { initApp } from './app'

async function main() {
  const { port, authConfig } = loadConfig()

  const jwtAuthMiddleware = getJwtAuthMiddleware(authConfig)
  const clientAuthMiddleware = getClientAuthMiddleware(authConfig)

  const app = initApp({
    jwtAuthMiddleware,
    clientAuthMiddleware,
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
