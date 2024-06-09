import fs from 'fs';
import path from 'path';
import { TreeNode } from './types';
import { parseImports } from './parseImports';

export const readDirectory = (dirPath: string): TreeNode => {
  const stats = fs.statSync(dirPath);
  const node: TreeNode = {
    name: path.basename(dirPath),
    path: dirPath,
    size: stats.size,
    type: stats.isDirectory() ? 'directory' : 'file',
    children: [],
  };

  if (stats.isDirectory()) {
    const children = fs.readdirSync(dirPath).map((child) => readDirectory(path.join(dirPath, child)));
    node.children = children;
    node.size = children.reduce((acc, child) => acc + child.size, 0);
  }

  return node;
};

export const processLocalRepo = (rootPath: string): TreeNode => {
  const rootNode = readDirectory(rootPath);
  parseImports(rootNode);
  return rootNode;
};
