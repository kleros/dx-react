import React from 'react'

interface InfoProps {
  mgnhref: string
}

const Info: React.SFC<InfoProps> = ({ mgnhref }) => (
  <>
    <p className="info-text">Magnolia (MGN) is an ERC20 token.</p>
    <p className="info-text">
      It is generated by trading on the DutchX protocol. Every 1 ETH worth of
      trade of a whitelisted token pair generates 1 MGN worth.
    </p>
    <p className="info-text">
      It will be minted and <strong>associated</strong> with your Ethereum
      address (from which you traded) only upon claiming your receiving tokens.
    </p>
    <p className="info-text">
      By default, MGN tokens are locked in the{' '}
      <a href={mgnhref} target="_blank">Magnolia contract</a>. Only locked MGN
      can be used for Liquidity Contribution reduction.
    </p>
    <p className="info-text">
      Once you click UNLOCK, the MGN do not count toward Liquidity Contributions
      on the DutchX, but you must wait for 24 hours* before the MGN tokens are
      transferable.
    </p>
    <p className="info-text">
      MGN tokens must be locked in the MGN contract to count toward Liquidity Contributions on the
      DutchX. They <u>must</u> be locked in the MGN contract to be registered for the dxDAO Vote Staking Period.
      They do not have to and cannot be locked on the dxDAO Vote Staking Interface.
    </p>
  </>
)

interface MiscProps {
  className?: string;
}

const Misc: React.SFC<MiscProps> = ({ className }) => (
  <p className={className}>
    *asterisk refers to the 24 period that your MGN is on hold (being unlocked
    but not tradable yet)
  </p>
)

export { Info, Misc }
