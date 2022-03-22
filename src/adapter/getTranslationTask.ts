import {
  smartlingProxy,
  authenticate,
  getHeaders,
  findExistingJob,
} from './helpers'
import { Secrets } from 'sanity-translations-tab'

export const getTranslationTask = async (
  documentId: string,
  secrets: Secrets
) => {
  const accessToken = await authenticate(secrets.secret)
  const taskId = await findExistingJob(documentId, secrets.project, accessToken)
  if (!taskId) {
    return {
      documentId,
      taskId: documentId,
      locales: [],
    }
  }

  const projectId = secrets.project
  const progressUrl = `https://api.smartling.com/jobs-api/v3/projects/${projectId}/jobs/${taskId}/progress`
  const smartlingTask = await fetch(smartlingProxy, {
    method: 'POST',
    headers: getHeaders(progressUrl, accessToken),
  })
    .then(res => res.json())
    .then(res => res.response.data)

  let locales = []
  if (smartlingTask && smartlingTask.contentProgressReport) {
    locales = smartlingTask.contentProgressReport.map(item => ({
      localeId: item.targetLocaleId,
      progress: item.progress ? item.progress.percentComplete : 0,
    }))
  }

  return {
    documentId,
    locales,
    //since our download is tied to document id for smartling, keep track of it as a task
    taskId: documentId,
    linkToVendorTask: `https://dashboard.smartling.com/app/projects/${projectId}/account-jobs/${projectId}:${taskId}`,
  }
}
