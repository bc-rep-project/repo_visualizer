// import React from 'react';
// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

// src/App.tsx
import React, { useState, useEffect } from 'react';
import Legend from './components/Legend';
import { TreeNode } from './components/types';
import Tree from './components/Tree';
import { fetchRepoData } from './components/fetchRepoData'
import { processLocalRepo } from './utils/processLocalRepo';

const App: React.FC = () => {
  const [fileTree, setFileTree] = useState<TreeNode | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      let data: TreeNode | null = null;
  
      // Determine data source (from user input or configuration)
      if (dataSource === 'github') {
        data = await fetchRepoData('facebook', 'react'); 
      } else if (dataSource === 'local') {
        data = await processLocalRepo('/path/to/local/repo');
      } 
      // ... (handle other data sources)
  
      if (data) {
        setFileTree(data);
      }
    };
    fetchData();
  }, [dataSource]); 

  if (!fileTree) return <div>Loading...</div>;

  return (
    <div>
      {/* ... (Your other content, like the Tree component) ... */}
      <Tree data={fileTree} />;
      <Legend /> {/* Place the Legend component where you want it to appear */}
    </div>
  )
};

export default App;