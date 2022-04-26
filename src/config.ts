import {
  Config,
  ClientAuthStrategy,
  AuthenticationConfig,
  Network,
} from './types'
import * as dotenv from 'dotenv'
import yargs from 'yargs'

const DEFAULT_PORT = 8080
export const ALFAJORES_FORNO_URL = 'https://alfajores-forno.celo-testnet.org'
export const MAINNET_FORNO_URL = 'https://forno.celo.org'

export const authConfigOptions: Record<string, AuthenticationConfig> = {
  test: {
    web3ProviderUrl: ALFAJORES_FORNO_URL,
    network: Network.Alfajores,
    chainId: 44787,
    clientAuthStrategy: ClientAuthStrategy.Optional,
  },
  alfajores: {
    web3ProviderUrl: ALFAJORES_FORNO_URL,
    network: Network.Alfajores,
    chainId: 44787,
    clientAuthStrategy: ClientAuthStrategy.Optional,
  },
  mainnet: {
    web3ProviderUrl: MAINNET_FORNO_URL,
    network: Network.Mainnet,
    chainId: 42220,
    clientAuthStrategy: ClientAuthStrategy.Required,
  },
}

export function loadConfig(): Config {
  // Note that this is just one possible way of dealing with configuration/environment variables.
  // Feel free to adapt this to your needs!
  dotenv.config()

  const argv = yargs
    .env('')
    .option('auth-config-option', {
      description: 'Authentication strategy to use',
      example: 'mainnet',
      type: 'string',
      demandOption: true,
      choices: Object.keys(authConfigOptions),
    })
    .option('port', {
      description: 'Port to use for running the API',
      example: DEFAULT_PORT,
      type: 'number',
      default: DEFAULT_PORT,
    })
    .option('session-secret', {
      description: 'The secret for signing the session',
      example: 'my-session-secret',
      type: 'string',
      demandOption: true,
    })
    .parseSync()

  return {
    authConfig: authConfigOptions[argv['auth-config-option']],
    port: argv.port,
    sessionSecret: argv.sessionSecret,
  }
}
