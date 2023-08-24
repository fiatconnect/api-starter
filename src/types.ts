/* eslint-disable max-classes-per-file*/
import {
  TransferRequestBody,
  TransferStatusRequestParams,
  QuoteRequestBody,
  KycRequestParams,
  KycSchema,
  KycSchemas,
  PostFiatAccountRequestBody,
  DeleteFiatAccountRequestParams,
  FiatAccountSchema,
  FiatAccountSchemas,
  FiatType,
  CryptoType,
  FiatAccountType,
  FiatConnectError,
  AuthRequestBody,
} from '@fiatconnect/fiatconnect-types'

export {
  TransferRequestBody,
  TransferStatusRequestParams,
  QuoteRequestBody,
  KycRequestParams,
  KycSchema,
  KycSchemas,
  PostFiatAccountRequestBody,
  DeleteFiatAccountRequestParams,
  FiatAccountSchema,
  FiatAccountSchemas,
  FiatType,
  FiatAccountType,
  CryptoType,
  FiatConnectError,
  AuthRequestBody,
}

/*
/ Configuration Types
*/

export interface Config {
  authConfig: AuthenticationConfig
  port: number
  sessionSecret: string
}

export enum ClientAuthStrategy {
  Optional = 'Optional',
  Required = 'Required',
}

export interface AuthenticationConfig {
  clientAuthStrategy: ClientAuthStrategy
  network: Network
  web3ProviderUrl: string
  chainId: number
}

export enum Network {
  Alfajores = 'Alfajores',
  Mainnet = 'Mainnet',
}

/*
 * API error types
 */

export class ValidationError extends Error {
  validationError: any
  fiatConnectError: FiatConnectError
  constructor(
    msg: string,
    validationError: any,
    fiatConnectError: FiatConnectError,
  ) {
    super(msg)
    this.validationError = validationError
    this.fiatConnectError = fiatConnectError
  }
}

export class NotImplementedError extends Error {}

export class UnauthorizedError extends Error {
  fiatConnectError: FiatConnectError

  constructor(
    fiatConnectError: FiatConnectError = FiatConnectError.Unauthorized,
    msg?: string,
  ) {
    super(msg || fiatConnectError)
    this.fiatConnectError = fiatConnectError
  }
}

export class InvalidSiweParamsError extends Error {
  fiatConnectError: FiatConnectError

  constructor(fiatConnectError: FiatConnectError, msg?: string) {
    super(msg || fiatConnectError)
    this.fiatConnectError = fiatConnectError
  }
}

export type SupportedKycSchemas = KycSchema.PersonalDataAndDocuments
