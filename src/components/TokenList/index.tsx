import React from 'react'
import TokenItem from '../TokenItem'
import { code2tokenMap } from 'tokens'
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
      if (a.hasTrueCryptosystemBadge && !b.hasTrueCryptosystemBadge) return -1
      if (!a.hasTrueCryptosystemBadge && b.hasTrueCryptosystemBadge) return 1
      return 0
    }).map((token: DefaultTokenObject) =>
      <TokenItem
        {...token}
        name={token.name || code2tokenMap[token.symbol]}
        balance={balances[token.address]}
        key={token.address}
        onClick={onTokenClick}
        generatesMGN={token.isETH || approvedTokens.has(token.address)}
      />)}
  </div>
)

export default TokenList
