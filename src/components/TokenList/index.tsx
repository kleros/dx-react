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
    {tokens.length === 0 && (
      <div className="spinnerContainer">
        <h2>This token has no trading pairs.</h2>
        <h4>To add the token, please see <a href="https://dutchx.readthedocs.io/en/latest/add-token-pair.html">the documentation</a></h4> for instructions.
      </div>
    )}
  </div>
)

export default TokenList
