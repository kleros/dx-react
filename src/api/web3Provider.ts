import { ProviderInterface } from './types'
import { windowLoaded, promisify } from 'utils'
import { Account, Provider } from 'types'
import Web3 from 'web3'

export const setupWeb3 = async (provider?: Provider) => {
  await windowLoaded

  if (!provider) {
    if (window.ethereum) {
      // TODO: be careful this doesn't override window.web3 @ 0.20.x
      // with a version 1.X.xx that breaks app...
      const providerWeb3 = window.web3 = new Web3(window.ethereum)
      try {
          // Request account access if needed
        await window.ethereum.enable()
        return providerWeb3
      } catch (error) {
          // User denied account access...
        console.error(error)
        throw new Error(error)
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      return new Web3(window.web3.currentProvider)
    }
    // none passed, none detected, use localhost
    return new Web3('http://localhost:8545')
  }

  return new Web3(provider)
}

let web3API: ProviderInterface

export const promisedWeb3 = async (provider?: Provider, force?: boolean | 'FORCE') => {
  if (web3API && !force) return web3API

  web3API = await init(provider)
  return web3API
}

async function init(provider: Provider): Promise<ProviderInterface> {
  try {
    if ((typeof navigator !== 'undefined' && !navigator.onLine) || typeof window.web3  === 'undefined') throw 'Web3 connectivity issues due to client network connectivity loss'

    const web3 = await setupWeb3(provider)
    const getAccounts = promisify(web3.eth.getAccounts, web3.eth)
    const getBalance = promisify(web3.eth.getBalance, web3.eth)

    const getBlock = promisify(web3.eth.getBlock, web3.eth)
    const getTransaction = promisify(web3.eth.getTransaction, web3.eth)
    const getTransactionReceipt = promisify(web3.eth.getTransactionReceipt, web3.eth)

    const getCurrentAccount = async () => {
      const [account] = await getAccounts()

      return account
    }

    const getETHBalance = async (account: Account, inETH?: boolean) => {
      const wei = await getBalance(account)

      return inETH ? web3.fromWei(wei, 'ether') : wei
    }

    const getNetwork = promisify(web3.version.getNetwork, web3.version)

    const isConnected = web3.isConnected.bind(web3)

    const setProvider = web3.setProvider.bind(web3)

    const isAddress = web3.isAddress.bind(web3)

    const resetProvider = () => setProvider(this.currentProvider)

    const getTimestamp = async (block = 'latest') => {
      const blockData = await promisify(web3.eth.getBlock, web3.eth)(block)

      return blockData.timestamp
    }

    console.warn(`
      WEB3 API INITIALISED
    `)

    return {
      getCurrentAccount,
      getAccounts,
      getBlock,
      getTransaction,
      getTransactionReceipt,
      getETHBalance,
      getNetwork,
      isConnected,
      isAddress,
      get currentProvider() {
        return web3.currentProvider
      },
      web3,
      setProvider,
      resetProvider,
      getTimestamp,
    }
  } catch (err) {
    console.error(err)
  }
}
