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
  MockCheckingAccount,
  FiatType,
  CryptoType,
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
  MockCheckingAccount,
  FiatType,
  CryptoType,
}

/*
/ Configuration Types
*/

export interface Config {
  authConfig: AuthenticationConfig
  port: number
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

export interface AuthRequestBody {
  message: string
  signature: string
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

export class InvalidAuthParamsError extends Error {}

export class UnauthorizedError extends Error {}

export class InvalidSiweParamsError extends Error {}
