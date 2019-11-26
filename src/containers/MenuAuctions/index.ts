import { connect } from 'react-redux'
import { push } from 'connected-react-router'

import { State } from 'types'

import MenuAuctions from 'components/MenuAuctions'
import { claimAndWithdrawSellerFundsFromSeveral } from 'actions'

import { auctionClaimable } from 'selectors'

const mapStateToProps = (state: State) => ({
  ongoingAuctions: state.auctions.ongoingAuctions,
  claimable: auctionClaimable(state),
  dxBalances: state.dxBalances,
})

export default connect(mapStateToProps, { claimAndWithdrawSellerFundsFromSeveral, push })(MenuAuctions as any)
