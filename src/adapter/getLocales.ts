import { smartlingProxy, authenticate, getHeaders } from './helpers'
import { Secrets } from 'sanity-translations-tab-cg'

export const getLocales = async (secrets: Secrets) => {
  const url = `https://api.smartling.com/projects-api/v2/projects/${secrets.project}`
  const accessToken = await authenticate(secrets.secret)
  return fetch(smartlingProxy, {
      method: 'POST',
      headers: getHeaders(url, accessToken)
    })
    .then(res => res.json())
    .then(res => res.response.data.targetLocales)
}