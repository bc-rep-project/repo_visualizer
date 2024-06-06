import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com';

export const fetchRepoData = async (owner, repo) => {
  const fetchContents = async (path) => {
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`;
    const response = await axios.get(url);
    return response.data;
  };

  const buildTree = async (path = '') => {
    const contents = await fetchContents(path);
    const children = await Promise.all(contents.map(async (item) => {
      if (item.type === 'dir') {
        return { name: item.name, type: 'directory', children: await buildTree(item.path) };
      }
      return { name: item.name, type: 'file', path: item.path };
    }));
    return children;
  };

  return { name: repo, type: 'directory', children: await buildTree() };
};