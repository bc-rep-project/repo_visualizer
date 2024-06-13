// // src/app/components/process-dir.ts

// import * as fs from 'fs';
// import * as path from 'path';
// import * as micromatch from 'micromatch';

// export function processDir(rootPath: string, excludedPaths: string[], excludedGlobs: string[]): any {
//   // Create Ignore Sets
//   const pathsToIgnore = new Set(excludedPaths);
//   const globsToIgnore = excludedGlobs;

//   function getFileStats(filePath: string): any {
//     const stats = fs.statSync(filePath);
//     const imports = extractImports(fs.readFileSync(filePath, 'utf8'));
//     return { stats, imports };
//   }

//   function addItemToTree(filePath: string): any {
//     const stats = fs.statSync(filePath);

//     if (stats.isDirectory()) {
//       const children = fs.readdirSync(filePath).map((child) => addItemToTree(path.join(filePath, child)));
//       return { path: filePath, type: 'directory', children };
//     } else if (stats.isFile()) {
//       if (shouldExcludePath(filePath, pathsToIgnore, globsToIgnore)) {
//         return null;
//       }
//       return getFileStats(filePath);
//     }
//   }

//   function extractImports(fileContents: string): any[] {
//     const imports: any[] = [];
//     const importRegex = /import\s+(.+?)\s+from\s+(['"])(.+?)\2/g;
//     let match: RegExpExecArray | null;
//     while ((match = importRegex.exec(fileContents)) !== null) {
//       imports.push({
//         importedModule: match[3], // The imported module
//         importingFile: match[1] // The file doing the importing
//       });
//     }
//     return imports;
//   }

//   function shouldExcludePath(path: string, pathsToIgnore: Set<string>, globsToIgnore: string[]): boolean {
//     return (
//       pathsToIgnore.has(path) ||
//       globsToIgnore.some((glob) => micromatch.isMatch(path, glob, { dot: true }))
//     );
//   }

//   return addItemToTree(rootPath);
// }


// src/app/components/process-dir.ts

import * as d3 from 'd3';
import { extractImports } from './extract-imports';

interface DirectoryNode {
  name: string;
  children: (DirectoryNode | FileNode)[];
}

interface FileNode {
  name: string;
  imports: string[];
}

export function processDirectoryData(data: any[]): [DirectoryNode, { source: FileNode, target: FileNode }[]] {
  const root: DirectoryNode = { name: '', children: [] };
  const childrenMap: { [key: string]: DirectoryNode | FileNode } = { [root.name]: root };
  const importLinks: { source: FileNode, target: FileNode }[] = [];

  data.forEach((file) => {
    const fileParts = file.path.split('/');
    const fileName = fileParts[fileParts.length - 1];

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
      };
      parentNode.children.push(fileNode);

      imports.forEach((importName) => {
        const importNode = findImportNode(importName, root);
        if (importNode && 'imports' in importNode) {
          console.log("Generated Import Link:", { source: fileNode, target: importNode as FileNode });
          importLinks.push({ source: fileNode, target: importNode as FileNode });
        }
      });
    }
  });

  console.log("Final Import Links:", importLinks);
  return [root, importLinks];
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