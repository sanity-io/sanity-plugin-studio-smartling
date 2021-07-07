import {
  smartlingProxy,
  authenticate,
  getHeaders,
  findExistingJob,
} from './helpers'
import { Secrets } from 'sanity-translations-tab'
import { getTranslationTask } from './getTranslationTask'

const uploadFile = async (
  documentId: string,
  projectId: string,
  document: Record<string, any>,
  accessToken: string
) => {
  const url = `https://api.smartling.com/files-api/v2/projects/${projectId}/file`
  const formData = new FormData()
  formData.append('fileUri', documentId)
  formData.append('fileType', 'html')
  const htmlBuffer = Buffer.from(document.content, 'utf-8')
  formData.append('file', new Blob([htmlBuffer]), `${document.name}.html`)

  return fetch(smartlingProxy, {
    method: 'POST',
    headers: getHeaders(url, accessToken),
    body: formData,
  }).then(res => res.json())
}

const assignFileToJob = async (
  jobId: string,
  documentId: string,
  projectId: string,
  localeIds: string[],
  accessToken: string
) => {
  const url = `https://api.smartling.com/jobs-api/v3/projects/${projectId}/jobs/${jobId}/file/add`
  return fetch(smartlingProxy, {
    method: 'POST',
    headers: {
      ...getHeaders(url, accessToken),
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      fileUri: documentId,
      targetLocaleIds: localeIds,
    }),
  })
    .then(res => res.json())
    .then(res => res.response)
}

const createJob = async (
  documentId: string,
  projectId: string,
  localeIds: string[],
  accessToken: string
) => {
  const url = `https://api.smartling.com/jobs-api/v3/projects/${projectId}/jobs`
  return fetch(smartlingProxy, {
    method: 'POST',
    headers: {
      ...getHeaders(url, accessToken),
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      jobName: documentId,
      targetLocaleIds: localeIds,
    }),
  })
    .then(res => res.json())
    .then(res => res.response.data.translationJobUid)
}

const authorizeJob = async (
  jobId: string,
  projectId: string,
  localeIds: string[],
  accessToken: string
) => {
  const url = `https://api.smartling.com/jobs-api/v3/projects/${projectId}/jobs/${jobId}/authorize`
  return fetch(smartlingProxy, {
    method: 'POST',
    headers: {
      ...getHeaders(url, accessToken),
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      localeWorkflows: localeIds.map(l => ({ targetLocaleId: l })),
    }),
  }).then(res => res.json())
}

export const createTask = async (
  documentId: string,
  document: Record<string, any>,
  localeIds: string[],
  secrets: Secrets
) => {
  const accessToken = await authenticate(secrets.secret)
  //TODO: announce errors here
  const uploadFileRes = await uploadFile(
    documentId,
    secrets.project,
    document,
    accessToken
  )
  console.log('uploadFileRes', uploadFileRes)
  let taskId = await findExistingJob(documentId, secrets.project, accessToken)
  if (!taskId) {
    taskId = await createJob(
      documentId,
      secrets.project,
      localeIds,
      accessToken
    )
  }

  //TODO: log errors here if needed
  const assignStatus = await assignFileToJob(
    taskId,
    documentId,
    secrets.project,
    localeIds,
    accessToken
  )
  console.log('assign status', assignStatus)
  const authorizeStatus = await authorizeJob(
    taskId,
    secrets.project,
    localeIds,
    accessToken
  )
  console.log('authStatus', authorizeStatus)

  return getTranslationTask(documentId, secrets)
}
