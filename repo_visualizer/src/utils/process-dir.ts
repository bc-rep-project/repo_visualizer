// import fs from "fs";
// import * as nodePath from 'path';
// import { shouldExcludePath } from './should-exclude-path';


// export const processDir = async (rootPath = "", excludedPaths = [], excludedGlobs = []) => {
//   const foldersToIgnore = [".git", ...excludedPaths]
//   const fullPathFoldersToIgnore = new Set(foldersToIgnore.map((d) =>
//     nodePath.join(rootPath, d)
//   ));


//   const getFileStats = async (path = "") => {
//     const stats = await fs.statSync(`./${path}`);
//     const name = path.split("/").filter(Boolean).slice(-1)[0];
//     const size = stats.size;
//     const relativePath = path.slice(rootPath.length + 1);
//     return {
//       name,
//       path: relativePath,
//       size,
//     };
//   };
//   const addItemToTree = async (
//     path = "",
//     isFolder = true,
//   ) => {
//     try {
//       console.log("Looking in ", `./${path}`);

//       if (isFolder) {
//         const filesOrFolders = await fs.readdirSync(`./${path}`);
//         const children = [];

//         for (const fileOrFolder of filesOrFolders) {
//           const fullPath = nodePath.join(path, fileOrFolder);
//           if (shouldExcludePath(fullPath, fullPathFoldersToIgnore, excludedGlobs)) {
//             continue;
//           }

//           const info = fs.statSync(`./${fullPath}`);
//           const stats = await addItemToTree(
//             fullPath,
//             info.isDirectory(),
//           );
//           if (stats) children.push(stats);
//         }

//         const stats = await getFileStats(path);
//         return { ...stats, children };
//       }

//       if (shouldExcludePath(path, fullPathFoldersToIgnore, excludedGlobs)) {
//         return null;
//       }
//       const stats = getFileStats(path);
//       return stats;

//     } catch (e) {
//       console.log("Issue trying to read file", path, e);
//       return null;
//     }
//   };

//   const tree = await addItemToTree(rootPath);

//   return tree;
// };


import fs from 'fs';
import path from 'path';
import micromatch from 'micromatch';

interface Import {
  importedModule: string;
  importingFile: string;
}

const extractImports = (content: string): Import[] => {
  const importRegex = /import\s+(.+?)\s+from\s+['"](.+?)['"]/g;
  const imports: Import[] = [];

  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    const [ , importedModule, modulePath ] = match;
    imports.push({ importedModule, importingFile: modulePath });
  }

  return imports;
};

const shouldExcludePath = (filePath: string, pathsToIgnore: string[], globsToIgnore: string[]): boolean => {
  const isDirectPathIgnored = pathsToIgnore.includes(filePath);
  const isGlobPathIgnored = globsToIgnore.some((glob) => micromatch.isMatch(filePath, glob));
  return isDirectPathIgnored || isGlobPathIgnored;
};

interface FileStats {
  name: string;
  path: string;
  size: number;
  imports: Import[];
}

const getFileStats = (filePath: string): FileStats => {
  const stats = fs.statSync(filePath);
  const name = path.basename(filePath);
  const size = stats.size;
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports = extractImports(content);
  return {
    name,
    path: filePath,
    size,
    imports
  };
};

interface TreeItem {
  name: string;
  path: string;
  children?: TreeItem[];
}

const addItemToTree = (filePath: string, pathsToIgnore: string[], globsToIgnore: string[]): TreeItem | null => {
  const stats = fs.statSync(filePath);
  if (stats.isDirectory()) {
    const children = fs.readdirSync(filePath).map(child => {
      const childPath = path.join(filePath, child);
      return addItemToTree(childPath, pathsToIgnore, globsToIgnore);
    }).filter(Boolean) as TreeItem[];
    return { name: path.basename(filePath), path: filePath, children };
  } else {
    if (shouldExcludePath(filePath, pathsToIgnore, globsToIgnore)) return null;
    return getFileStats(filePath);
  }
};

const processDir = (rootPath: string, excludedPaths: string[] = [], excludedGlobs: string[] = []): TreeItem | null => {
  const tree = addItemToTree(rootPath, excludedPaths, excludedGlobs);
  return tree;
};

export { processDir };