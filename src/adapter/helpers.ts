import {Secrets} from 'sanity-translations-tab'

interface Headers {
  [key: string]: string
}

export const authenticate = (secrets: Secrets): Promise<string> => {
  const url = 'https://api.smartling.com/auth-api/v2/authenticate'
  const headers = {
    'content-type': 'application/json',
    'X-URL': url,
  }
  const {secret, proxy} = secrets
  if (!secret || !proxy) {
    throw new Error(
      'The Smartling adapter requires a secret key and a proxy URL. Please check your secrets document in this dataset, per the plugin documentation.'
    )
  }
  return fetch(proxy, {
    headers,
    method: 'POST',
    body: JSON.stringify(secret),
  })
    .then((res) => res.json())
    .then((res) => res.response.data.accessToken)
}

export const getHeaders = (url: string, accessToken: string): Headers => ({
  Authorization: `Bearer ${accessToken}`,
  'X-URL': url,
})

export const findExistingJob = (
  documentId: string,
  secrets: Secrets,
  accessToken: string
): Promise<string> => {
  const {project, proxy} = secrets
  if (!project || !proxy) {
    throw new Error(
      'The Smartling adapter requires a Smartling project identifier and a proxy URL. Please check your secrets document in this dataset, per the plugin documentation.'
    )
  }
  const url = `https://api.smartling.com/jobs-api/v3/projects/${project}/jobs?jobName=${documentId}`
  return fetch(proxy, {
    method: 'POST',
    headers: getHeaders(url, accessToken),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.response.data.items.length) {
        //smartling will fuzzy match job names. We need to be precise.
        const correctJob = res.response.data.items.find(
          (item: {jobName: string}) => item.jobName && item.jobName === documentId
        )
        if (correctJob) {
          return correctJob.translationJobUid
        }
        return ''
      }
      return ''
    })
}
