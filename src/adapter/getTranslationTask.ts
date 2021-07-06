import { smartlingProxy, authenticate, getHeaders } from './helpers'
import { Secrets } from 'sanity-translations-tab-cg'

export const getTranslationTask = async (documentId: string, secrets: Secrets) => {
  const url = `https://api.smartling.com/files-api/v2/projects/${secrets.project}/jobs/${documentId}/progress`
  const accessToken = await authenticate(secrets.secret)
  const smartlingTask = await fetch(smartlingProxy, {
    method: 'POST',
    headers: getHeaders(url, accessToken)
  })
  .then(res => res.json())
  .then(res => res.response.data)

  let locales = []

  if (smartlingTask) {
    locales = smartlingTask.contentProgressReport.map(item => ({
      localeId: item.targetLocaleId,
      progress: item.progress.percentComplete,
    }))
  }

  return {
    documentId,
    locales,
    taskId: documentId
  }
}
