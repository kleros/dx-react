interface Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any,
  TextDecoder: any,
  ethereum: any,
  mist: any,
  web3: any,
}

declare module 'ipfs'
declare module 'storybook-router'
declare module 'truffle-contract'
declare module 'web3'
declare module 'web3/lib/utils/utils.js'
declare module 'ethjs-abi'
declare module 'web3Latest'

declare module '*.svg' {
  const content: any
  export default content
}

declare module '*.png' {
  const content: any
  export default content
}

declare module '*.json' {
  const content: any
  export default content
}

declare const before: typeof beforeAll
declare const after: typeof afterAll

declare interface Array<T> {
  __last: () => T;
}
