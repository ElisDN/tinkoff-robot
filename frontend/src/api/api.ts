function isJsonResponse(response: Response) {
  const type = response.headers.get('content-type')
  return type && type.includes('application/json')
}

// eslint-disable-next-line no-undef
function api(uri: string, params: RequestInit) {
  return fetch(process.env.REACT_APP_API_HOST + uri, params)
    .then((response) => {
      if (response.ok) {
        return response
      }
      throw response
    })
    .then((response) => {
      if (isJsonResponse(response)) {
        return response.json()
      }
      return response.text()
    })
}

export default api
