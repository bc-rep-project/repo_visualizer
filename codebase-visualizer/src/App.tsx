import React, { useState } from 'react';
import { processLocalRepo } from './utils/processLocalRepo';
import { fetchRepoData } from './utils/fetchRepoData';
import Tree from './components/Tree';
import { TreeNode } from './utils/types';
import './App.css';

const App: React.FC = () => {
  const [data, setData] = useState<TreeNode | null>(null);

  const handleLocalRepo = () => {
    const localData = processLocalRepo('/path/to/local/repo'); // Change this to actual path
    setData(localData);
  };

  const handleFetchRepo = async () => {
    const githubData = await fetchRepoData('username', 'repository'); // Change this to actual repo details
    setData(githubData);
  };

  return (
    <div className="App">
      <button onClick={handleLocalRepo}>Load Local Repo</button>
      <button onClick={handleFetchRepo}>Load GitHub Repo</button>
      {data && <Tree data={data} />}
    </div>
  );
};

export default App;
