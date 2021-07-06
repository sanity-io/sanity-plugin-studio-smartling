import { smartlingProxy, authenticate, getHeaders } from './helpers'
import { Secrets } from 'sanity-translations-tab-cg'
import { getTranslationTask } from './getTranslationTask'

const uploadFile = async (
  documentId: string,
  projectId: string,
  document: Record<string, any>,
  accessToken: string) => {

  const url = `https://api.smartling.com/files-api/v2/projects/${projectId}/file`
  const formData = new FormData()
  formData.append('fileUri', documentId)
  formData.append('fileType', 'html')
  const htmlBuffer = Buffer.from(document.content, 'utf-8')
  formData.append('file', new Blob([htmlBuffer]), `${document.name}.html`)

  fetch(smartlingProxy, {
    method: 'POST',
    headers: getHeaders(url, accessToken),
    body: formData
  })
}

const findExistingJob = async (
  documentId: string,
  projectId: string,
  accessToken: string): 
    Promise<string> => {
  const url = `https://api.smartling.com/jobs-api/v3/projects/${projectId}/jobs?jobName=${documentId}` 
  return fetch(smartlingProxy, {
    method: 'POST',
    headers: getHeaders(url, accessToken)
  })
  .then(res => res.json())
  .then(res => {
    if (res.response.data.items.length) {
      return res.response.data.items[0].translationJobUid
      } else {
        return ''
      }
  })
}

const assignFileToJob = async (
  jobId: string,
  documentId: string,
  projectId: string,
  localeIds: string[],
  accessToken: string) => {
  const url = `https://api.smartling.com/jobs-api/v3/projects/${projectId}/jobs/${jobId}/file/add`
  return fetch(smartlingProxy, {
    method: 'POST',
    headers: getHeaders(url, accessToken),
    body: JSON.stringify({
      fileUri: documentId,
      targetLocaleIds: localeIds
    })
  })
  .then(res => res.json())
  .then(res => res.response.data)
}

const createJob = async (
	documentId: string,
	projectId: string,
	localeIds: string[],
	accessToken: string) => {
   const url = `https://api.smartling.com/jobs-api/v3/projects/${projectId}/jobs`
   return fetch(smartlingProxy, {
       method: 'POST',
       headers: getHeaders(url, accessToken),
	body: JSON.stringify({
	    jobName: documentId,
	    targetLocaleIds: localeIds
	})
       
   })
    .then(res => res.json())
    .then(res => res.response.data.translationJobUid)
}
      
const authorizeJob = async (
  jobId: string,
  projectId: string,
  localeIds: string[],
  accessToken: string) => {
  const url = `https://api.smartling.com/jobs-api/v3/projects/${projectId}/jobs/${jobId}/authorize`
  return fetch(smartlingProxy, {
    method: 'POST',
    headers: getHeaders(url, accessToken),
    body: JSON.stringify({
      localeWorkflows: localeIds.map(l => ({targetLocaleId: l}))
    })
  })
  .then(res => res.json())
}


export const createTask = async (
  documentId: string,
  document: Record<string, any>,
  localeIds: string[],
  secrets: Secrets
) => {
  const accessToken = await authenticate(secrets.secret)
  await uploadFile(documentId, secrets.project, document, accessToken)
  let taskId = await findExistingJob(documentId, secrets.project, accessToken)
  if (!taskId) {
    taskId = await createJob(documentId, secrets.project, localeIds, accessToken)
  }

  //TODO: log errors here if needed
  const assignStatus = await assignFileToJob(
	  taskId, documentId, secrets.project, localeIds, accessToken)
  const authorizeStatus = await authorizeJob(
	  taskId, secrets.project, localeIds, accessToken)

   return getTranslationTask(documentId, secrets)
}
