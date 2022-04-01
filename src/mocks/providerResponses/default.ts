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

export default {
  quoteIn: {
    quote: {
      fiatType: FiatType.USD,
      cryptoType: CryptoType.cUSD,
      fiatAmount: '100',
      cryptoAmount: '100',
    },
    kyc: {
      kycRequired: true,
      kycSchemas: [KycSchema.PersonalDataAndDocuments],
    },
    fiatAccount: {
      MockCheckingAccount: {
        fiatAccountSchemas: [FiatAccountSchema.MockCheckingAccount],
      },
      MockDebitCard: {
        fiatAccountSchemas: [FiatAccountSchema.MockCheckingAccount],
      },
      MockCreditCard: {
        fiatAccountSchemas: [FiatAccountSchema.MockCheckingAccount],
      },
    },
  },
  quoteOut: {
    quote: {
      fiatType: FiatType.USD,
      cryptoType: CryptoType.cUSD,
      fiatAmount: '100',
      cryptoAmount: '100',
    },
    kyc: {
      kycRequired: true,
      kycSchemas: [KycSchema.PersonalDataAndDocuments],
    },
    fiatAccount: {
      MockCheckingAccount: {
        fiatAccountSchemas: [FiatAccountSchema.MockCheckingAccount],
      },
      MockDebitCard: {
        fiatAccountSchemas: [FiatAccountSchema.MockCheckingAccount],
      },
      MockCreditCard: {
        fiatAccountSchemas: [FiatAccountSchema.MockCheckingAccount],
      },
    },
  },
  postKycData: {
    kycStatus: KycStatus.Approved,
  },
  getKycStatus: {
    status: KycStatus.Approved,
  },
  postAccountSchema: {
    fiatAccountId: '12345',
    name: 'Chase checking account',
    institution: 'Chase Bank',
    fiatAccountType: FiatAccountType.MockCheckingAccount,
  },
  getAccounts: {
    MockCheckingAccount: [
      {
        fiatAccountId: '12345',
        name: 'Chase checking account',
        institution: 'Chase Bank',
        fiatAccountType: FiatAccountType.MockCheckingAccount,
      },
    ],
    MockDebitCard: [
      {
        fiatAccountId: '12345',
        name: 'Chase checking account',
        institution: 'Chase Bank',
        fiatAccountType: FiatAccountType.MockCheckingAccount,
      },
    ],
    MockCreditCard: [
      {
        fiatAccountId: '12345',
        name: 'Chase checking account',
        institution: 'Chase Bank',
        fiatAccountType: FiatAccountType.MockCheckingAccount,
      },
    ],
  },
  postTransfer: {
    transferId: '9589gh57jd3',
    transferStatus: TransferStatus.TransferComplete,
    transferAddress: '0x57848hf478t784h',
  },
  getTransferStatus: {
    status: TransferStatus.TransferComplete,
    transferType: TransferType.TransferOut,
    fiatType: FiatType.USD,
    cryptoType: CryptoType.cUSD,
    amountProvided: '100',
    amountReceived: '100',
    fee: '0',
    fiatAccountId: '12345',
  },
}
