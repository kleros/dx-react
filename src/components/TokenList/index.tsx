import React from 'react'
import TokenItem from '../TokenItem'
import { TokenBalances, DefaultTokenObject, AccountsSet } from 'types'

interface TokenListProps {
  tokens: DefaultTokenObject[],
  balances: TokenBalances,
  approvedTokens: AccountsSet,
  onTokenClick(props: any): any
}

const TokenList: React.SFC<TokenListProps> = ({ tokens, balances, onTokenClick, approvedTokens }) => (
  <div className="tokenList">
    {tokens.sort((a, b) => {
      if (a.hasDutchXBadge && !b.hasDutchXBadge) return -1
      if (!a.hasDutchXBadge && b.hasDutchXBadge) return 1
      return 0
    }).map((token: DefaultTokenObject) =>
      <TokenItem
        {...token}
        name={token.name}
        balance={balances && token.address && balances[token.address] ? balances[token.address] : 0}
        key={token.address}
        onClick={onTokenClick}
        generatesMGN={token.isETH || approvedTokens.has(token.address)}
        balanceLoaded={!!balances && !!token.address && !!balances[token.address]}
      />)}
  </div>
)

export default TokenList
