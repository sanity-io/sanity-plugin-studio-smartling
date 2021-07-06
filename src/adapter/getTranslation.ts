import { smartlingProxy, authenticate, getHeaders } from './helpers'
import { Secrets } from 'sanity-translations-tab-cg'

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
  .then(res => {
    const chunks = []
    //@ts-ignore
    res.body.on('data', chunk => chunks.push(chunk)) 
    return new Promise(resolve => {
      //@ts-ignore
      res.body.on('end', () => {
          return resolve(Buffer.concat(chunks).toString())
	})
      })
    }) 

    return translatedHTML
}