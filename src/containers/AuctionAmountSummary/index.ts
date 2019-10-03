import { connect } from 'react-redux'

import { State } from 'types'
import AuctionAmountSummary from 'components/AuctionAmountSummary'
import { FIXED_DECIMALS } from 'globals'

const mapState = (state: State) => {
  // TODO: always have some price for every pair in RatioPairs
  const { sell, buy, lastPrice: price } = state.tokenPair
  const { sellAmount } = state.tokenPair
  return ({
    // TODO: change prop to sellTokenBalance
    sellTokenSymbol: sell.symbol || sell.name || sell.address,
    buyTokenSymbol: buy.symbol || buy.name || buy.address,
    sellTokenAmount: sellAmount,
    // TODO: use BN.mult() inside component
    buyTokenAmount: (+price * +sellAmount).toFixed(FIXED_DECIMALS),
    sellIsETH: sell.isETH,
    buyIsETH: buy.isETH,
    sellTokenSymbolMultihash: sell.symbolMultihash,
    buyTokenSymbolMultihash: buy.symbolMultihash,
  })
}

export default connect(mapState)(AuctionAmountSummary)
