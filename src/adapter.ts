import { Secrets, Adapter } from 'sanity-translations-tab'
const serverlessSmartling = 'http://localhost:3000/api'

const getLocales = (secrets: Secrets) => (
  fetch(`${serverlessSmartling}/getLocales`)
    .then(res => res.json())
    .then(res => res.locales)
)

const getTranslationTask = (documentId: string, secrets: Secrets) => (
  fetch(`${serverlessSmartling}/getTranslationTask?documentId=${documentId}`)
    .then(res => res.json())
)

const createTask = async (
  documentId: string,
  document: Record<string, any>,
  localeIds: string[],
  secrets: Secrets) => {
  return fetch(`${serverlessSmartling}/createTask`, {
    method: 'POST',
    body: JSON.stringify({
      documentId,
      document,
      localeIds,
      secrets })
    })
    .then(res => getTranslationTask(documentId, secrets))
}

const getTranslation = (taskId: string, localeId: string, secrets: Secrets) => (
  fetch(`${serverlessSmartling}/getTranslation?taskId=${taskId}&localeId=${localeId}`)
    .then(res => res.json())
)

export const SmartlingAdapter: Adapter = {
  getLocales,
  getTranslationTask,
  createTask,
  getTranslation
}

