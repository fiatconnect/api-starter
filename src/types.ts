/* eslint-disable max-classes-per-file*/
import {
  TransferRequestBody,
  TransferStatusRequestParams,
  QuoteRequestQuery,
  KycRequestParams,
  KycSchema,
  PersonalDataAndDocumentsKyc,
  AddFiatAccountRequestParams,
  DeleteFiatAccountRequestParams,
  FiatAccountSchema,
  AccountNumber,
  FiatType,
  CryptoType,
  FiatAccountType,
  FiatConnectError,
  AuthRequestBody,
} from '@fiatconnect/fiatconnect-types'
import express from 'express'

export {
  TransferRequestBody,
  TransferStatusRequestParams,
  QuoteRequestQuery,
  KycRequestParams,
  KycSchema,
  PersonalDataAndDocumentsKyc,
  AddFiatAccountRequestParams,
  DeleteFiatAccountRequestParams,
  FiatAccountSchema,
  AccountNumber,
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

export enum JwtAuthStrategy {
  DecodeOnly = 'DecodeOnly',
  SignatureAndAddress = 'SignatureAndAddress',
}

export enum ClientAuthStrategy {
  Optional = 'Optional',
  Required = 'Required',
}

export interface AuthenticationConfig {
  jwtAuthStrategy: JwtAuthStrategy
  clientAuthStrategy: ClientAuthStrategy
  network: Network
  web3ProviderUrl: string
  chainId: number
}

export enum Network {
  Alfajores = 'Alfajores',
  Mainnet = 'Mainnet',
}

export interface AuthorizationTokens {
  jwt?: string
  client?: string
}

export interface JwtAuthorizationMiddleware {
  expirationRequired: express.RequestHandler[]
  expirationOptional: express.RequestHandler[]
}

/*
 * API error types
 */

export class ValidationError extends Error {
  validationError: any
  constructor(msg: string, validationError: any) {
    super(msg)
    this.validationError = validationError
  }
}

export class NotImplementedError extends Error {}

export class UnauthorizedError extends Error {
  fiatConnectError: FiatConnectError

  constructor(fiatConnectError: FiatConnectError = FiatConnectError.Unauthorized, msg?: string) {
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
