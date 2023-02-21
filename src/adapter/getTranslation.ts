import {smartlingProxy, authenticate, getHeaders} from './helpers'
import {Adapter, Secrets} from 'sanity-translations-tab'

export const getTranslation: Adapter['getTranslation'] = async (
  taskId: string,
  localeId: string,
  secrets: Secrets | null
) => {
  if (!secrets?.project || !secrets?.secret) {
    throw new Error(
      'The Smartling adapter requires a project ID and a secret key. Please check your secrets document in this dataset, per the plugin documentation.'
    )
  }

  const url = `https://api.smartling.com/files-api/v2/projects/${secrets.project}/locales/${localeId}/file?fileUri=${taskId}&retrievalType=pending`
  const accessToken = await authenticate(secrets.secret)
  const translatedHTML = await fetch(smartlingProxy, {
    method: 'POST',
    headers: getHeaders(url, accessToken),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.body) {
        return res.body
      } else if (res.response.errors) {
        const errMsg =
          res.response.errors[0]?.message || 'Error retrieving translation from Smartling'
        throw new Error(errMsg)
      }
      return ''
    })

  return translatedHTML
}
