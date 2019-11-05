import { createAction } from 'redux-actions'
import { Settings, CookieSettings } from 'types'
import { Dispatch } from 'redux'
import localForage from 'localforage'

export const saveSettings = createAction<Partial<Settings | CookieSettings>>('SAVE_SETTINGS')

export const asyncLoadSettings = () => async (dispatch: Dispatch<any>) => {
  const [disclaimerSettings, cookieSettings] = await Promise.all<Settings, CookieSettings>([
    localForage.getItem('settings'),
    localForage.getItem('cookieSettings'),
  ])

  const settings = [disclaimerSettings, cookieSettings]
  // save in redux store
  return settings.forEach(setting => dispatch(saveSettings(setting)))
}

export const asyncSaveSettings = (payload: Partial<Settings>) =>
  async (dispatch: Dispatch<any>) => {
    const prevState: Settings | Partial<Settings> = (await localForage.getItem('settings')) || { networks_accepted: {} }
    const action = dispatch(saveSettings(payload))

    localForage.setItem('settings', {
      ...prevState,
      disclaimer_accepted: true,
      networks_accepted: {
        ...prevState.networks_accepted,
        ...payload.networks_accepted,
      },
    })
    return action
  }
