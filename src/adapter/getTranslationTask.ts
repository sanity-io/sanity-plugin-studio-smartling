import {authenticate, getHeaders, findExistingJob} from './helpers'
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
  if (!secrets?.project || !secrets?.secret || !secrets?.proxy) {
    throw new Error(
      'The Smartling adapter requires a project ID, a secret key, and a proxy URL. Please check your secrets document in this dataset, per the plugin documentation.'
    )
  }

  const {project, proxy} = secrets

  const accessToken = await authenticate(secrets)
  const taskId = await findExistingJob(documentId, secrets, accessToken)
  if (!taskId) {
    return {
      documentId,
      taskId: documentId,
      locales: [],
    }
  }

  const progressUrl = `https://api.smartling.com/jobs-api/v3/projects/${project}/jobs/${taskId}/progress`
  const smartlingTask = await fetch(proxy, {
    method: 'GET',
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
    linkToVendorTask: `https://dashboard.smartling.com/app/projects/${project}/account-jobs/${project}:${taskId}`,
  }
}
