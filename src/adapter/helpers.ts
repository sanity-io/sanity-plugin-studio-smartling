export const smartlingProxy = 'http://localhost:3000/api/proxy'

export const authenticate = async (secret: string) => {
  const url = 'https://api.smartling.com/auth-api/v2/authenticate'
  const headers = {
    'content-type': 'application/json',
    'X-URL': url
  }
  return fetch(smartlingProxy, {
    headers,
    method: 'POST',
    body: secret
  })
  .then(res => res.json())
  .then(res => res.response.data.accessToken)
}

export const getHeaders = (url: string, accessToken: string) => ({
  'Authorization': `Bearer ${accessToken}`,
  'X-URL': url
})