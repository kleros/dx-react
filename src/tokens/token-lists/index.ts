import badgeABI from './abis/badge.json'
import tokensViewABI from './abis/tokens-view.json'
import erc20DetailedABI from './abis/token.json'

const DUTCHX_BADGE_ADDRESS = {
  1: '0x6e06861cefc3d6ea24483d3f1fe80759a73524b4',
  42: '0xb3b888988e4f6e581e8108fd73416d57a935c093',
}

const ERC_20_BADGE_ADDRESS = {
  1: '0xcb4aae35333193232421e86cd2e9b6c91f3b125f',
  42: '0x78895ec026aeff2db73bc30e623c39e1c69b1386',
}

const T2CR_ADDRESS = {
  1: '0xebcf3bca271b26ae4b162ba560e243055af0e679',
  42: '0x25dd2659a1430cdbd678615c7409164ae486c146',
}

const TOKENS_VIEW_ADDRESS = {
  1: '0xf9b9b5440340123b21bff1ddafe1ad6feb9d6e7f',
  42: '0xaef5648bb17d474369e1b1eb0c742ba8968a7acc',
}

const DECIMALS_DICTIONARY = {
  '0xe0b7927c4af23765cb51314a0e0521a9645f0e2a': 9, // DGD
}

const zeroAddress = '0x0000000000000000000000000000000000000000'
const zeroSubmissionID =
  '0x0000000000000000000000000000000000000000000000000000000000000000'
const filter = [
  false, // Do not include items which are not on the TCR.
  true,  // Include registered items.
  false, // Do not include items with pending registration requests.
  true,  // Include items with pending clearing requests.
  false, // Do not include items with challenged registration requests.
  true,  // Include items with challenged clearing requests.
  false, // Include token if caller is the author of a pending request.
  false,  // Include token if caller is the challenger of a pending request.
]

export default async (network: string, web3: any) => {
  const erc20BadgeContract = new web3.eth.Contract(badgeABI, ERC_20_BADGE_ADDRESS[network])
  const dutchXbadgeContract =
    new web3.eth.Contract(badgeABI, DUTCHX_BADGE_ADDRESS[network])

  // We use a view contract to return all the
  // available token data at once.
  const tokensViewContract = new web3.eth.Contract(
    tokensViewABI,
    TOKENS_VIEW_ADDRESS[network],
  )

  let elements = [{
    symbol: 'ETH',
    name: 'Ether',
    address: '0x0',
    decimals: 18,
    isETH: true,
    hasTrueCryptosystemBadge: false,
  }]

  let tokensWithTrueCryptosystemBadge: string[] = []

  // Fetch tokens with the DutchX badge and tokens with the true cryptosystem badge in parallel.
  // Tokens with the true cryptosystem badge are displayed first in the list.
  await Promise.all([
    (async () => {
      // Fetch addresses of tokens that have the badge.
      // Since the contract returns fixed sized arrays, we must filter out unused items.
      let addressesWithBadge: string[] = []
      let hasMore = true
      let lastAddress = zeroAddress
      while (hasMore) {
        const result = await erc20BadgeContract.methods
          .queryAddresses(
            lastAddress, // A token address to start/end the query from. Set to zero means unused.
            1000, // Number of items to return at once.
            filter,
            true, // Return oldest first.
          ).call()

        addressesWithBadge = addressesWithBadge.concat(result.values.filter((address: string) => address !== zeroAddress))
        lastAddress = addressesWithBadge[addressesWithBadge.length - 1]
        hasMore = result.hasMore
      }

      // Fetch their submission IDs on from T2CR.
      // As with addresses, the contract returns a fixed sized array so we filter out unused slots.
      const submissionIDs = (await tokensViewContract.methods.getTokensIDsForAddresses(T2CR_ADDRESS[network], addressesWithBadge).call())
        .filter((tokenID: string) => tokenID !== zeroSubmissionID)

      // With the token IDs, get the information and add it to the object.
      const fetchedTokens = (await tokensViewContract.methods
        .getTokens(T2CR_ADDRESS[network], submissionIDs)
        .call())
        .filter((tokenInfo: any) => tokenInfo[3] !== zeroAddress)
        .map((token: any) => ({
          name: token[1],
          symbol: token[2],
          address: token[3],
          symbolMultihash: token[4],
          decimals: Number(token[6]),
        }))

      elements = elements.concat(fetchedTokens)

      await Promise.all(elements.filter(token => token.decimals === 0).map(async token => {
        try {
          const tokenContract = new web3.eth.Contract(erc20DetailedABI, token.address)
          const decimals = (await tokenContract.decimals()).toNumber()
          token.decimals = decimals
        } catch (err) {
          console.warn(`Missing decimals for token of address ${token.address}`)
          // Contract does not implement decimals function. Check dictionary of known tokens.
          // If not present, assume 18 decimal places.
          if (DECIMALS_DICTIONARY[token.address.toLowerCase()] != null) {
            console.warn(`Using value from dictionary: ${DECIMALS_DICTIONARY[token.address.toLowerCase()]}`)
            token.decimals = DECIMALS_DICTIONARY[token.address.toLowerCase()]
          }
          else {
            console.warn('Using default: 18')
            token.decimals = 18
          }
        }
      }))

    })(),
    (async () => {
      // Fetch tokens with the true cryptosystem badge
      let addressesWithBadge: string[] = []
      let hasMore = true
      let lastAddress = zeroAddress
      while (hasMore) {
        const result = await dutchXbadgeContract.methods
          .queryAddresses(
            lastAddress, // A token address to start/end the query from. Set to zero means unused.
            1000, // Number of items to return at once.
            filter,
            true, // Return oldest first.
          ).call()

        addressesWithBadge = addressesWithBadge.concat(
          result.values.filter((address: string) => address !== zeroAddress),
        )
        lastAddress = addressesWithBadge[addressesWithBadge.length - 1]
        hasMore = result.hasMore
      }

      tokensWithTrueCryptosystemBadge = addressesWithBadge
    })(),
  ])

  elements.filter(token => tokensWithTrueCryptosystemBadge.includes(token.address))
    .forEach(token => {
      token.hasTrueCryptosystemBadge = true
    })

  const tokenList = {
    elements,
    pagination: {
      endingBefore: null as any,
      startingAfter: null as any,
      limit: 20,
      order: [
        {
          param: 'symbol',
          direction: 'ASC',
        },
      ],
      previousUri: null as any,
      nextUri: null as any,
    },
    network,
    version: '2.4.2',
  }

  return tokenList
}
