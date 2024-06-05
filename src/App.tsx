// import React, { useState, useEffect } from 'react';
// import { Tree } from './components/Tree';
// import { processDir } from './components/process-dir';

// function App() {
//   const [repoData, setRepoData] = useState(null);
  
//   useEffect(() => {
//     const fetchRepoData = async () => {
//       const data = await processDir(/* Your repo root */);
//       setRepoData(data);
//     };

//     fetchRepoData();
//   }, []);

//   if (!repoData) {
//     return <div>Loading...</div>; 
//   }

//   return (
//     <div className="App">
//       <Tree data={repoData} maxDepth={9} colorEncoding="type" />
//     </div>
//   );
// }

// export default App;


import React from 'react';
import './App.css';
import { Tree } from './components/Tree';
import { FileType } from './components/types';
import { processDir } from './components/processDir';

function App() {
  const [data, setData] = React.useState<FileType | undefined>(undefined)

  React.useEffect(() => {
    const getData = async () => {
      const data = await processDir();
      setData(data)
    }
    getData()

  }, [])
  if (!data) {
    return <div>Loading</div>
  }
  return (
    <div className="App">
      <Tree data={data} filesChanged={[]} maxDepth={9} colorEncoding={"type"}/>
    </div>
  );
}

export default App;