import {smartlingProxy, authenticate, getHeaders} from './helpers'
import {Secrets} from 'sanity-translations-tab'
import {Adapter} from 'sanity-translations-tab'

export const getLocales: Adapter['getLocales'] = async (secrets: Secrets | null) => {
  if (!secrets?.project || !secrets?.secret) {
    throw new Error(
      'The Smartling adapter requires a project ID and a secret key. Please check your secrets document in this dataset, per the plugin documentation.'
    )
  }
  const url = `https://api.smartling.com/projects-api/v2/projects/${secrets.project}`
  const accessToken = await authenticate(secrets.secret)
  return fetch(smartlingProxy, {
    method: 'POST',
    headers: getHeaders(url, accessToken),
  })
    .then((res) => res.json())
    .then((res) => res.response.data.targetLocales)
}
