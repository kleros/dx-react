// Array prototypes + others
// BROKEN in MM 4.10
// import 'utils/prototypes'

import React from 'react'
import ReactDOM from 'react-dom'

// import fireListeners from 'integrations/events'
import App, { loadLocalSettings } from 'components/App'

/* global document */
const rootElement = document.getElementById('root')

const preAppRender = async () => {
  // fire provider network change listener
  // fireListeners()
  // load localForage settings
  // register provider + update provider state
  await loadLocalSettings()

  ReactDOM.render(<App />, rootElement)
}

// Render app to user
preAppRender().catch(console.error)
