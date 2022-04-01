// import defaultResponse from './default.json'
import {
  QuoteResponse,
  FiatType,
  CryptoType,
  KycSchema,
  FiatAccountSchema,
  KycStatus,
  GetFiatAccountsResponse,
  FiatAccountType,
  ObfuscatedFiatAccountData,
  TransferStatusResponse,
  TransferStatus,
  TransferType,
  TransferResponse,
} from '@fiatconnect/fiatconnect-types'
import defaultResponse from './default'

interface ProviderResponse {
  quoteIn: QuoteResponse
  quoteOut: QuoteResponse
  postKycData: { kycStatus: KycStatus }
  getKycStatus: { status: KycStatus }
  postAccountSchema: ObfuscatedFiatAccountData
  getAccounts: GetFiatAccountsResponse
  postTransfer: TransferResponse
  getTransferStatus: TransferStatusResponse
}

export const availableProviders = ['default']

const providerResponses: Record<string, ProviderResponse> = {
  default: defaultResponse,
}
export { providerResponses }
