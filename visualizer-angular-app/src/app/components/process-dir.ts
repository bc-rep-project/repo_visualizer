
// src/app/components/process-dir.ts


import { extractImports } from './extract-imports';

interface DirectoryNode {
  name: string;
  children: (DirectoryNode | FileNode)[];
}

interface FileNode {
  name: string;
  imports: string[];
  type: string;
  x: number;
  y: number;
}

export function processDirectoryData(data: any[]): { root: DirectoryNode, importLinks: { source: FileNode, target: FileNode }[], dependencies: { [key: string]: string[] } } {
  const root: DirectoryNode = { name: '', children: [] };
  const childrenMap: { [key: string]: DirectoryNode | FileNode } = { [root.name]: root };
  const importLinks: { source: FileNode, target: FileNode }[] = [];
  const dependencies: { [key: string]: string[] } = {};

  data.forEach((file) => {
    const fileParts = file.path.split('/');
    const fileName = fileParts[fileParts.length - 1];
    const fileExt = fileName.split('.').pop() || '';

    let parentNode: DirectoryNode = root;
    fileParts.forEach((part: string) => {
      if (!childrenMap[part]) {
        const childNode: DirectoryNode = { name: part, children: [] };
        childrenMap[part] = childNode;
        parentNode.children.push(childNode);
      }
      parentNode = childrenMap[part] as DirectoryNode;
    });

    if (file.content) {
      const imports = extractImports(file.content);
      const fileNode: FileNode = {
        name: fileName,
        imports,
        type: fileExt,
        x: 0,
        y: 0,
      };
      parentNode.children.push(fileNode);

      imports.forEach((importName) => {
        const importNode = findImportNode(importName, root);
        if (importNode && 'imports' in importNode) {
          console.log("Generated Import Link:", { source: fileNode, target: importNode as FileNode });
          importLinks.push({ source: fileNode, target: importNode as FileNode });
        }
      });

      dependencies[fileNode.name] = [];
      imports.forEach((importName) => {
        if (findImportNode(importName, root)) {
          dependencies[importName].push(fileNode.name);
        }
      });

      fileNode.x = parentNode.children.indexOf(fileNode);
      fileNode.y = parentNode.children.length - 1;
    }
  });

  console.log("Final Import Links:", importLinks);
  console.log("Final Dependencies:", dependencies);
  return { root, importLinks, dependencies };
}

function findImportNode(importName: string, node: DirectoryNode): DirectoryNode | FileNode | undefined {
  if ('name' in node && node.name === importName) {
    return node;
  }

  if ('children' in node) {
    for (const child of node.children) {
      const found = findImportNode(importName, child as DirectoryNode);
      if (found) {
        return found;
      }
    }
  }

  return undefined;
}