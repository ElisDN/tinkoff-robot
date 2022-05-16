import React, { useEffect, useState } from 'react'

function App() {
  const [content, setContent] = useState(null)

  useEffect(() => {
    fetch(process.env.REACT_APP_API_HOST + '/')
      .then((response) => response.json())
      .then((data) => {
        setContent(data)
      })
  }, [])

  return <div className="container">{JSON.stringify(content)}</div>
}

export default App
