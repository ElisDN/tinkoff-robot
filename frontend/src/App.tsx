import React, {useEffect, useState} from 'react';

function App() {
  const [content, setContent] = useState(null)

  useEffect(() => {
    fetch('http://localhost:3001')
        .then((response) => response.json())
        .then((data) => {
          setContent(data)
        })
  }, [])

  return (
    <div>
      {JSON.stringify(content)}
    </div>
  );
}

export default App;
