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
import { processLocalRepo } from './processLocalRepo';
import { fetchRepoData } from './components/fetchRepoData';
import ForceGraph from './components/ForceGraph';
import { TreeNode } from './components/types'; 

const App: React.FC = () => {
  const [data, setData] = useState<TreeNode | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null); 
  const [repoSource, setRepoSource] = useState<'local' | 'github' | null>(null); 
  const [localRepoPath, setLocalRepoPath] = useState<string>('/path/to/your/repo'); // Default path
  const [githubRepo, setGithubRepo] = useState<{ owner: string, repo: string }>({
    owner: 'facebook', 
    repo: 'react'
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let fetchedData: TreeNode | null = null;

        if (repoSource === 'local') {
          fetchedData = await processLocalRepo(localRepoPath);
        } else if (repoSource === 'github') {
          fetchedData = await fetchRepoData(githubRepo.owner, githubRepo.repo);
        } 

        setData(fetchedData);
      } catch (err) {
        setError('Error fetching repository data.'); 
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (repoSource) { 
      fetchData(); 
    }

  }, [repoSource, localRepoPath, githubRepo]); // Fetch when source changes

  const handleLocalRepoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalRepoPath(event.target.value);
  };

  const handleGithubOwnerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGithubRepo(prev => ({ ...prev, owner: event.target.value }));
  };

  const handleGithubRepoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGithubRepo(prev => ({ ...prev, repo: event.target.value }));
  };

  return (
    <div>
      <h1>Codebase Visualizer</h1> 

      <div>
        <label htmlFor="localRepoPath">Local Repository Path:</label>
        <input 
          type="text" 
          id="localRepoPath"
          value={localRepoPath}
          onChange={handleLocalRepoChange}
        />
        <button onClick={() => setRepoSource('local')}>Visualize Local</button>
      </div>

      <div>
        <label htmlFor="githubOwner">GitHub Owner:</label>
        <input 
          type="text" 
          id="githubOwner"
          value={githubRepo.owner}
          onChange={handleGithubOwnerChange} 
        />
        <label htmlFor="githubRepo">Repository:</label>
        <input 
          type="text" 
          id="githubRepo" 
          value={githubRepo.repo} 
          onChange={handleGithubRepoChange} 
        />
        <button onClick={() => setRepoSource('github')}>Visualize GitHub</button>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && <ForceGraph data={data} />}
    </div>
  );
};

export default App;