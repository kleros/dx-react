import React from 'react'
import { Redirect, RedirectProps } from 'react-router'

import { Balance } from 'types'

interface RedirectHomeProps {
  sellAmount?: Balance
}

interface RedirectFactoryProps {
  to: RedirectProps['to'],
  condition: (props: any) => boolean
}

/**
 * A HOC that redirects to given path if condition(props) is true
 * @param Component - React component to wrap around
 */
const RedirectIfFactory = ({ to, condition }: RedirectFactoryProps) =>
  (Component: React.ClassType<any, any, any> = (): null => null) => (props: RedirectHomeProps) =>
    condition(props) ? <Component {...props}/> : <Redirect to={to} />

// we assume that sellAmount should be set prior to reaching /wallet page
export const RedirectHomeHOC = RedirectIfFactory({
  to: '/',
  condition: ({ sellAmount }) => !sellAmount || sellAmount !== '0',
})

export const RedirectHomeIfNoAccountHOC = RedirectIfFactory({
  to: '/',
  condition: ({ currentAccount }) => currentAccount !== undefined,
})

export default RedirectIfFactory
