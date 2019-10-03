import React from 'react'
import { Balance } from 'types'
import etherLogo from '../../assets/tokens/ETH.svg'

export interface AuctionAmountSummaryProps {
  sellTokenSymbol: string,
  buyTokenSymbol: string,
  sellTokenAmount: Balance,
  buyTokenAmount: Balance,
  sellIsETH?: boolean,
  buyIsETH?: boolean,
  sellTokenSymbolMultihash?: string,
  buyTokenSymbolMultihash?: string
}

const AuctionAmountSummary: React.SFC<AuctionAmountSummaryProps> = ({
  sellTokenSymbol, buyTokenSymbol, sellTokenAmount, buyTokenAmount, buyIsETH, sellIsETH, sellTokenSymbolMultihash, buyTokenSymbolMultihash,
}) => {
  const dotenvParsed: any = process.env.DOTENV_PARSED
  return (
    <div className="auctionAmountSummary">
      <span className="tokenItemSummary">
        <div style={{
          height: '80px',
          width: '80px',
          backgroundColor: '#fcfcfc94',
          backgroundImage: `url(${ sellIsETH ? etherLogo : `${dotenvParsed.IPFS_GATEWAY}${sellTokenSymbolMultihash}`})`,
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          margin: '20px auto',
        }} />
        <big>DEPOSITING</big>
        <p>{sellTokenAmount} {sellTokenSymbol}</p>
      </span>

      <span className="tokenItemSummary">
        <div style={{
          height: '80px',
          width: '80px',
          backgroundColor: '#fcfcfc94',
          backgroundImage: `url(${ buyIsETH ? etherLogo : `${dotenvParsed.IPFS_GATEWAY}${buyTokenSymbolMultihash}`})`,
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          margin: '20px auto',
        }} />
        <big>RECEIVING (approx.)</big>
        <p>{buyTokenAmount} {buyTokenSymbol}</p>
      </span>
    </div>
  )
}

export default AuctionAmountSummary
