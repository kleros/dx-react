import React, { Component } from 'react'
import { createSelector } from 'reselect'

import TokenOverlayHeader from 'components/TokenOverlayHeader'
import TokenList from 'components/TokenList'
import Loader from 'components/Loader'

import { code2tokenMap } from 'tokens'
import { DefaultTokenObject, TokenBalances, TokenMod, AccountsSet, AvailableAuctions, TokenPair, Account } from 'types'
import { handleKeyDown } from 'utils'
import BigNumber from 'bignumber.js'

const getTokenModAndAddress = createSelector(
  (_: TokenOverlayState, { mod }: TokenOverlayProps) => mod,
  (_, { tokenPair }) => tokenPair,
  (_, { WETHAddress }) => WETHAddress,
  (mod, tokenPair, WETHAddress) => {
    const oldToken = tokenPair[mod]

    const oldAddress = oldToken &&
      (oldToken.isETH ? WETHAddress : oldToken.address)

    const oppositeToken = tokenPair[mod === 'sell' ? 'buy' : 'sell']

    const oppositeAddress = oppositeToken &&
      (oppositeToken.isETH ? WETHAddress : oppositeToken.address)

    return {
      mod,
      // token we clicked on
      oldAddress,
      // opposite in a pair
      oppositeAddress,
      WETHAddress,
    }
  },
)

const prefilterByAvailableAuctions = createSelector(
  (_: TokenOverlayState, props: TokenOverlayProps) => props.tokenList,
  (_, props) => props.availableAuctions,
  (_, { MGNAddress }) => MGNAddress,
  getTokenModAndAddress,
  (tokenList, availableAuctions, MGNAddress, { mod, oppositeAddress, WETHAddress }) => {
    // if opposite token is an empty placeholder, show every token EXCEPT MGN
    if (!oppositeAddress) return tokenList.filter(t => t.address !== MGNAddress)
    // if (oppositeAddress && (oppositeAddress !== ETH_ADDRESS || oppositeAddress === WETHAddress)) return tokenList.filter(t => !t.isETH)
    return tokenList.filter(token => {
      // don't show opposite token as it's already selected for the other position
      // e.g sellToken = ETH, don't show ETH in buyToken
      if (token.address === oppositeAddress) return false

      // check, based on MOD, whether to show isETH and WETH or just WETH
      // buy token should NEVER have both WETH and isETH
      let tokenAddress
      let pairStr

      // if selecting for sell position, check direct pairs with opposite token
      if (mod === 'sell') {
        tokenAddress = token.isETH ? WETHAddress : token.address
        pairStr = `${oppositeAddress}-${tokenAddress}`
      }
      // otherwise opposite pairs
      else if (mod === 'buy') {
        // buy token should NEVER have both WETH and isETH
        tokenAddress = token.address
        pairStr = `${tokenAddress}-${oppositeAddress}`
      }
      else throw new Error(`tokenPair.mod isn't set, ${mod}`)

      // show only token pairs that would actually allow a sell order
      return availableAuctions.has(pairStr)
    })
  },
)

const sortedTokenList = createSelector(
  prefilterByAvailableAuctions,
  (_, props: TokenOverlayProps) => props.tokenBalances,
  (tokenList, balances) => tokenList.sort((a, b) => {
    // first ETH
    // then WETH
    if (a.symbol === 'ETH') return -1
    if (b.symbol === 'ETH') return 1
    if (a.symbol === 'WETH') return -1
    if (b.symbol === 'WETH') return 1

    // // then by balance
    const balA = !balances[a.address] || balances[a.address].isZero() ? new BigNumber(0) : balances[a.address].div(a.decimals)
    const balB = !balances[b.address] || balances[a.address].isZero() ? new BigNumber(0) : balances[b.address].div(b.decimals)
    if (balA.lt(balB)) return 1
    if (balB.lt(balA)) return -1

    // then by symbol
    const symbolA = a.symbol.toUpperCase()
    const symbolB = b.symbol.toUpperCase()
    if (symbolA < symbolB) {
      return -1
    }
    if (symbolA > symbolB) {
      return 1
    }

    return 0
  }),

)

const filterTokens = createSelector(
  (state: TokenOverlayState, _: TokenOverlayProps) => state.filter.toUpperCase(),
  sortedTokenList,
  (filter, tokens) => filter
    ?
    tokens.filter(({
      symbol = '',
      name = code2tokenMap[symbol] || '',
    }) => symbol.toUpperCase().includes(filter) || name.toUpperCase().includes(filter))
    :
    tokens,
)

export interface TokenOverlayProps {
  tokenList: DefaultTokenObject[],
  tokenPair: TokenPair,
  tokenBalances: TokenBalances,
  open: boolean,
  mod: TokenMod,
  approvedTokens: AccountsSet,
  availableAuctions: AvailableAuctions,
  WETHAddress: Account,
  MGNAddress: Account,
  resettable: boolean,
  closeOverlay(): any,
  selectTokenPairAndRatioPair(props: any): any,
  resetTokenPairAndCloseOverlay(): any,
}

interface TokenOverlayState {
  filter: string
}

class TokenOverlay extends Component<TokenOverlayProps, TokenOverlayState> {
  state = {
    filter: '',
  }

  outerDiv: HTMLDivElement

  changeFilter = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({
    filter: e.target.value,
  })

  selectTokenAndCloseOverlay: TokenOverlayProps['selectTokenPairAndRatioPair'] = (tokenProps) => {
    console.log('tokenProps: ', tokenProps)
    const { selectTokenPairAndRatioPair, mod } = this.props

    selectTokenPairAndRatioPair({ token: tokenProps, mod })
  }

  closeOverlay = () => {
    this.props.closeOverlay()
    this.setState({ filter: '' })
  }

  componentDidMount() {
    this.outerDiv && this.outerDiv.focus()
  }

  render() {
    const { tokenBalances, approvedTokens, closeOverlay, resettable, resetTokenPairAndCloseOverlay } = this.props
    const { filter } = this.state

    const filteredTokens = filterTokens(this.state, this.props)
    console.info('filteredTokens', filteredTokens)

    return (
      <div className="tokenOverlay" ref={c => this.outerDiv = c} tabIndex={-1} onKeyDown={(e) => handleKeyDown(e, closeOverlay, 'Escape')}>
        <TokenOverlayHeader
          onChange={this.changeFilter}
          closeOverlay={this.closeOverlay}
          value={filter}
          resettable={resettable}
          reset={resetTokenPairAndCloseOverlay}
        />
        <Loader
          hasData={filteredTokens.length > 0}
          message="Loading tokens - please wait"
          reSize={0.72}
          render={() =>
            <TokenList
              tokens={filteredTokens}
              balances={tokenBalances}
              onTokenClick={this.selectTokenAndCloseOverlay}
              approvedTokens={approvedTokens}
            />
          } />
      </div>
    )
  }
}

export default TokenOverlay
