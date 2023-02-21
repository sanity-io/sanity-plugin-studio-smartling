import {smartlingProxy, authenticate, getHeaders, findExistingJob} from './helpers'
import {Adapter, Secrets} from 'sanity-translations-tab'

interface SmartlingProgressItem {
  targetLocaleId: string
  progress: {
    percentComplete: number
  }
}

export const getTranslationTask: Adapter['getTranslationTask'] = async (
  documentId: string,
  secrets: Secrets | null
) => {
  if (!secrets?.project || !secrets?.secret) {
    throw new Error(
      'The Smartling adapter requires a project ID and a secret key. Please check your secrets document in this dataset, per the plugin documentation.'
    )
  }

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
    .then((res) => res.json())
    .then((res) => res.response.data)

  let locales = []
  if (smartlingTask && smartlingTask.contentProgressReport) {
    locales = smartlingTask.contentProgressReport.map((item: SmartlingProgressItem) => ({
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
