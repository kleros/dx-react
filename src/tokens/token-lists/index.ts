import t2crABI from './abis/t2cr.json'
import badgeABI from './abis/badge.json'
import tokensViewABI from './abis/tokens-view.json'
import erc20DetailedABI from './abis/token.json'

const ERC20_BADGE_ADDRESS = {
  1: '0xcb4aae35333193232421e86cd2e9b6c91f3b125f',
  42: '0x78895ec026aeff2db73bc30e623c39e1c69b1386',
}

const T2CR_ADDRESS = {
  1: '0xebcf3bca271b26ae4b162ba560e243055af0e679',
  42: '0x25dd2659a1430cdbd678615c7409164ae486c146',
}

const TOKENS_VIEW_ADDRESS = {
  1: '0xdc06b2e32399d3db41e69da4d112cf85dde4103f',
  42: '0x0004d3791c0ce1a43ceba04993e2636af8361035',
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

  const t2crContract = new web3.eth.Contract(t2crABI, T2CR_ADDRESS[network])
  const badgeContract = new web3.eth.Contract(badgeABI, ERC20_BADGE_ADDRESS[network])
  // We use a view contract to return all the
  // to return all the available token data at once.
  // Warning: Some token contracts do not implement the
  // decimals function. For these cases the decimals field
  // of the struct will be set to 0. Account for this
  // if your dapp uses this field.
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
  }]

  try {
    // Fetch addresses of tokens that have the badge.
    // Since the contract returns fixed sized arrays, we must filter out unused items.
    const addressesWithBadge = (await badgeContract.methods
      .queryAddresses(
        zeroAddress, // A token address to start/end the query from. Set to zero means unused.
        100, // Number of items to return at once.
        filter,
        true, // Return oldest first.
      )
      .call()).values.filter((address: string) => address !== zeroAddress)

    // Fetch their submission IDs on the T2CR.
    // As with addresses, the contract returns a fixed sized array so we filter out unused slots.
    const submissionIDs = [].concat(
      ...(await Promise.all(
        addressesWithBadge.map((address: string) =>
          t2crContract.methods
            .queryTokens(
              zeroSubmissionID, // A token ID from which to start/end the query from. Set to zero means unused.
              100, // Number of items to return at once.
              filter,
              true, // Return oldest first.
              address, // The token address for which to return the submissions.
            )
            .call()
            .then((res: any) => res.values.filter((ID: string) => ID !== zeroSubmissionID)),
        ),
      )),
    )

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
        decimals: token[6],
      }))

    elements = elements.concat(fetchedTokens)
  } catch (err) {
    console.error(err)
  }

  await Promise.all(elements.filter(token => token.decimals.toString() === '0').map(async token => {
    try {
      const tokenContract = new web3.eth.Contract(erc20DetailedABI, token.address)
      const decimals = (await tokenContract.decimals()).toNumber()
      token.decimals = decimals
    } catch (err) {
      console.warn(`Missing decimals for token of address ${token.address}`)
      // Contract does not implement decimals function. Check dictionary of known tokens.
      // If not present, assume 18 decimal places.
      if (DECIMALS_DICTIONARY[token.address.toLowerCase()] != null) {
        token.decimals = DECIMALS_DICTIONARY[token.address.toLowerCase()]
      }
      else {
        token.decimals = 18
      }
    }
  }))

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
