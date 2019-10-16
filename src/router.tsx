import React from 'react'
import { ConnectedRouter } from 'connected-react-router'
import { Route, Redirect, StaticRouter, Switch } from 'react-router-dom'
import { History } from 'history'
import { hot } from 'react-hot-loader'

import Header from 'components/Header'
import Footer from 'components/Footer'
import Home from 'containers/Home'
import MGN from 'containers/MGN'
import PageNotFound from 'components/PageNotFound'
import OrderPanel from 'containers/OrderPanel'
import WalletPanel from 'containers/WalletPanel'
import AuctionPanel from 'containers/AuctionPanel'
import ContentPageContainer from 'containers/ContentPages'

import GoogleAnalyticsTracking from 'components/GoogleAnalyticsTracking'
import WalletIntegration from 'containers/WalletIntegration'
import AppValidator from 'containers/AppValidator'

import { SHOW_FOOTER_CONTENT } from 'globals'

interface AppRouterProps {
  history: History;
  analytics: boolean;
  disabled?: boolean;
}

// TODO: consider redirecting from inside /order, /wallet, /auction/:nonexistent_addr to root
const withHeaderAndFooter = (Component: React.ComponentClass | React.SFC, headerProps?: { content?: boolean, dumb?: boolean, noMenu?: boolean }, useFooter = true, othProps?: any) => (compProps: any) => (
  <>
    <Header {...headerProps}/>
    <Component {...othProps} {...compProps}/>
    {useFooter && <Footer />}
  </>
)

const HomeWHF = withHeaderAndFooter(Home)
const OrderPanelWHF = withHeaderAndFooter(OrderPanel)
const WalletPanelWHF = withHeaderAndFooter(WalletPanel)
const AuctionPanelWHF = withHeaderAndFooter(AuctionPanel)
const MGN_WHF = withHeaderAndFooter(MGN)
// true passed in to show different, solidBackgorund Header
const ContentPageContainerWHF =
  withHeaderAndFooter(ContentPageContainer, { content: true, dumb: true }, SHOW_FOOTER_CONTENT)
const FourOhFourWHF =
  withHeaderAndFooter(PageNotFound, { dumb: true }, SHOW_FOOTER_CONTENT)

const AppRouter: React.SFC<AppRouterProps> = ({ analytics, history, disabled }) => {
  // App is disabled (Geo Block, Net Block etc)
  if (disabled) {
    return (
      <StaticRouter context={{}}>
        <div className="appFlex">
          <Header />
          <Home showPicker/>
        </div>
      </StaticRouter>
    )
  }

  // Render main App
  return (
    <ConnectedRouter history={history}>
      <div className="appFlex">

        <Switch>
          {/* DISCONNECTED CONTENT PAGES */}

          <Route path="/content/:contentPage" component={ContentPageContainerWHF} />
          <Redirect from="/content" to="/content/HowItWorks" />

          {/* CONNECTED APP */}
          <WalletIntegration>
            <AppValidator>
              <Switch>
                <Route exact path="/" component={HomeWHF} />
                <Route path="/order" component={OrderPanelWHF} />
                <Route path="/wallet" component={WalletPanelWHF} />

                {/* TODO: check for valid params.addr and redirect if necessary */}
                <Route path="/auction/:sell-:buy-:index" component={AuctionPanelWHF} />

                <Route path="/mgn" component={MGN_WHF}/>

                <Route path="/404" component={FourOhFourWHF} />
                <Redirect to="/404" />

              </Switch>
            </AppValidator>
          </WalletIntegration>
        </Switch>

        {analytics && <GoogleAnalyticsTracking />}
      </div>
  </ConnectedRouter>
  )
}

export default hot(module)(AppRouter)
