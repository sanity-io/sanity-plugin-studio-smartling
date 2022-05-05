export const smartlingProxy = process.env.SANITY_STUDIO_SMARTLING_PROXY

export const authenticate = async (secret: string) => {
  const url = 'https://api.smartling.com/auth-api/v2/authenticate'
  const headers = {
    'content-type': 'application/json',
    'X-URL': url,
  }
  return fetch(smartlingProxy, {
    headers,
    method: 'POST',
    body: JSON.stringify(secret),
  })
    .then(res => res.json())
    .then(res => res.response.data.accessToken)
}

export const getHeaders = (url: string, accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
  'X-URL': url,
})

export const findExistingJob = async (
  documentId: string,
  projectId: string,
  accessToken: string
): Promise<string> => {
  const url = `https://api.smartling.com/jobs-api/v3/projects/${projectId}/jobs?jobName=${documentId}`
  return fetch(smartlingProxy, {
    method: 'POST',
    headers: getHeaders(url, accessToken),
  })
    .then(res => res.json())
    .then(res => {
      if (res.response.data.items.length) {
        //smartling will fuzzy match job names. We need to be precise.
        const correctJob = res.response.data.items.find(
          item => item.jobName && item.jobName === documentId
        )
        if (correctJob) {
          return correctJob.translationJobUid
        } else {
          return ''
        }
      } else {
        return ''
      }
    })
}
