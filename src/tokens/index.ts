import { TokenCode, DefaultTokenObject, TokenName } from 'types'

export const ETH_ADDRESS = '0x0'
export const WETH_ADDRESS_RINKEBY = '0xc778417e063141139fce010982780140aa0cd5ab'

/*
 * TRADE BLOCKED TOKENS
 */
export const TRADE_BLOCKED_TOKENS = {
  MAIN: {},
  RINKEBY: {},
  get noBlock() {
    return !Object.keys(this.MAIN).length && !Object.keys(this.RINKEBY).length
  },
}

export const EMPTY_TOKEN: DefaultTokenObject = {
  name: '' as TokenName,
  symbol: '' as TokenCode,
  decimals: 18,
  address: '',
}

export const WETH_TEMPLATE: Pick<DefaultTokenObject, Exclude<keyof DefaultTokenObject, 'address'>> = {
  name: 'WRAPPED ETHER',
  symbol: 'WETH',
  decimals: 18,
}

// Network token list hashes (latest versions)
export const TESTING_TOKEN_LIST_HASH = 'QmXgUiWTumXghNuLk3vAypVeL4ycVkNKhrtWfvFHoQTJAM'
export const RINKEBY_TOKEN_LIST_HASH = process.env.FE_CONDITIONAL_ENV === 'production' ? 'QmW4NCDDZRexP5FVpMQXxNWwFHTQjCGeb5d8ywLs2XRJxR' : 'QmfB3fRGacBseNiBMhKFaYoEGDyiWnUCBPsE7Xo3sKqSyi'
export const KOVAN_TOKEN_LIST_HASH = 'QmVk68VH1D2uGx2LUGXsrfvKHQiA1R4sjw8cw4so33DPsw'
export const MAINNET_TOKEN_LIST_HASH = 'QmVoyJobifVKCGnwKxq7kHYbWK2XDkxz8Xg1teiqX3XVqr'

export const TokenListHashMap = {
  RINKEBY: RINKEBY_TOKEN_LIST_HASH,
  KOVAN: KOVAN_TOKEN_LIST_HASH,
  MAIN: MAINNET_TOKEN_LIST_HASH,
}
