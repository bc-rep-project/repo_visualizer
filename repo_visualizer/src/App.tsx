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
import { processDir } from './utils/process-dir';
import Tree from './components/Tree';

const App: React.FC = () => {
  const [fileTree, setFileTree] = useState<TreeNode | null>(null);

  useEffect(() => {
    const rootPath = '/path/to/your/repository';
    const excludedPaths = ['node_modules', '.git'];
    const excludedGlobs = ['**/*.test.js'];

    const tree = processDir(rootPath, excludedPaths, excludedGlobs);
    setFileTree(tree);
  }, []);

  if (!fileTree) return <div>Loading...</div>;

  return <Tree data={fileTree} />;
};

export default App;