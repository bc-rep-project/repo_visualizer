
// src/app/components/process-dir.ts


import { extractImports } from './extract-imports';

interface DirectoryNode {
  name: string;
  children: (DirectoryNode | FileNode)[];
}

interface ImportObject {
  moduleName: string;
  modulePath: string;
}

interface FileNode {
  name: string;
  imports: ImportObject[];
  type: string;
  x: number;
  y: number;
}

interface Dependencies {
  [key: string]: string[];
}

export function processDirectoryData(data: any[]): { root: DirectoryNode, importLinks: { source: FileNode, target: FileNode }[], dependencies: Dependencies } {
  const root: DirectoryNode = { name: '', children: [] };
  const childrenMap: { [key: string]: DirectoryNode | FileNode } = { [root.name]: root };
  const importLinks: { source: FileNode, target: FileNode }[] = [];
  const dependencies: Dependencies = {};

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
      const imports = extractImports(file.content); // The function returns an array of { moduleName: string, modulePath: string }
      const fileNode: FileNode = {
        name: fileName,
        imports,
        type: fileExt,
        x: 0,
        y: 0,
      };
      parentNode.children.push(fileNode);

      imports.forEach((importName) => {
        const importNode = findImportNode(importName.moduleName, root);
        if (importNode) {
          console.log("Generated Import Link:", { source: fileNode, target: importNode });
          importLinks.push({ source: fileNode, target: importNode });
        }
        if (findImportNode(importName.moduleName, root)) {
          dependencies[importNode?.name || ''] = dependencies[importNode?.name || ''] || [];
          dependencies[importNode?.name || ''].push(fileNode.name);
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

function findImportNode(importName: string, node: DirectoryNode): FileNode | undefined {
  if ('children' in node) {
    for (const child of node.children) {
      if ('children' in child) {
        const found = findImportNode(importName, child as DirectoryNode);
        if (found) {
          return found;
        }
      } else if ((child as FileNode).name === importName) {
        return child as FileNode;
      }
    }
  }

  return undefined;
}