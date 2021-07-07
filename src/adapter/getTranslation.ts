import { smartlingProxy, authenticate, getHeaders } from './helpers'
import { Secrets } from 'sanity-translations-tab'

export const getTranslation = async (
  taskId: string,
  localeId: string,
  secrets: Secrets
) => {
  const url = `https://api.smartling.com/files-api/v2/projects/${secrets.project}/locales/${localeId}/file?fileUri=${taskId}&retrievalType=pending`
  const accessToken = await authenticate(secrets.secret)
  const translatedHTML = await fetch(smartlingProxy, {
    method: 'POST',
    headers: getHeaders(url, accessToken),
  })
    .then(res => res.json())
    .then(res => res.body)

  return translatedHTML
}
