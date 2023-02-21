import {smartlingProxy, authenticate, getHeaders, findExistingJob} from './helpers'
import {Adapter, Secrets} from 'sanity-translations-tab'
import {getTranslationTask} from './getTranslationTask'

const createJob = async (
  jobName: string,
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
      jobName,
      targetLocaleIds: localeIds,
    }),
  })
    .then((res) => res.json())
    .then((res) => res.response.data.translationJobUid)
}

/* we're using batches here because it eliminates some
 * new string authorization issues for updating existing jobs,
 * and is able to be used for new bulk
 * job functionality.
 */
const createJobBatch = async (
  jobId: string,
  projectId: string,
  documentName: string,
  accessToken: string,
  localeIds: string[],
  workflowUid?: string
) => {
  const url = `https://api.smartling.com/job-batches-api/v2/projects/${projectId}/batches`
  const reqBody: {
    authorize: boolean
    translationJobUid: string
    fileUris: string[]
    localeWorkflows?: {targetLocaleId: string; workflowUid: string}[]
  } = {
    authorize: true,
    translationJobUid: jobId,
    fileUris: [documentName],
  }

  if (workflowUid) {
    reqBody.localeWorkflows = localeIds.map((l) => ({
      targetLocaleId: l,
      workflowUid,
    }))
  }

  return fetch(smartlingProxy, {
    method: 'POST',
    headers: {
      ...getHeaders(url, accessToken),
      'content-type': 'application/json',
    },
    body: JSON.stringify(reqBody),
  })
    .then((res) => res.json())
    .then((res) => res.response.data.batchUid)
}

const uploadFileToBatch = async (
  batchUid: string,
  document: Record<string, any>,
  projectId: string,
  localeIds: string[],
  accessToken: string
) => {
  const url = `https://api.smartling.com/job-batches-api/v2/projects/${projectId}/batches/${batchUid}/file`
  const formData = new FormData()
  formData.append('fileUri', document.name)
  formData.append('fileType', 'html')
  const htmlBuffer = Buffer.from(document.content, 'utf-8')
  formData.append('file', new Blob([htmlBuffer]), `${document.name}.html`)
  localeIds.forEach((localeId) => formData.append('localeIdsToAuthorize[]', localeId))

  return fetch(smartlingProxy, {
    method: 'POST',
    headers: getHeaders(url, accessToken),
    body: formData,
  }).then((res) => res.json())
}

//@ts-ignore until return TranslationTask type is added to sanity-translations-tab
export const createTask: Adapter['createTask'] = async (
  documentId: string,
  document: Record<string, any>,
  localeIds: string[],
  secrets: Secrets | null,
  workflowUid?: string
) => {
  if (!secrets?.project || !secrets?.secret) {
    throw new Error(
      'The Smartling adapter requires a project ID and a secret key. Please check your secrets document in this dataset, per the plugin documentation.'
    )
  }

  const accessToken = await authenticate(secrets.secret)

  let taskId = await findExistingJob(document.name, secrets.project, accessToken)
  if (!taskId) {
    taskId = await createJob(document.name, secrets.project, localeIds, accessToken)
  }

  const batchUid = await createJobBatch(
    taskId,
    secrets.project,
    document.name,
    accessToken,
    localeIds,
    workflowUid
  )
  const uploadFileRes = await uploadFileToBatch(
    batchUid,
    document,
    secrets.project,
    localeIds,
    accessToken
  )
  //eslint-disable-next-line no-console -- for developer debugging
  console.info('Upload status from Smartling: ', uploadFileRes)

  return getTranslationTask(documentId, secrets)!
}
