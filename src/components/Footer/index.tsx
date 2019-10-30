import React from 'react'
import appInfo from '../../../package.json'
import { connect } from 'react-redux'
import { State } from 'types'

import 'assets/pdf/PrivacyPolicy.pdf'
import { getActiveProviderObject } from 'selectors'

import { Link } from 'react-router-dom'
import { COMPANY_NAME } from 'globals'

interface FooterProps {
  network: string;
}

// TODO: add content for footer
const Footer = ({ network }: FooterProps) =>
    <footer>
        <p>
            {
                network === 'RINKEBY'
                    ?
                <>
                    This {COMPANY_NAME} version runs on the Rinkeby Test Network: Real funds are not at risk.
                </>
                    :
                <>
                    <Link to="/">Home</Link>
                </>
            }
        </p>
        <div>
            <i>{network}</i>
            <i>DX-React: {appInfo.version}</i>
            <i>DX-Contracts: {appInfo.dependencies['@gnosis.pm/dx-contracts']}</i>
        </div>
    </footer>

const mapState = (state: State) => {
  const provider = getActiveProviderObject(state)

  return { network: provider ? provider.network : 'UNKNOWN NETWORK' }
}

export default connect(mapState)(Footer)
