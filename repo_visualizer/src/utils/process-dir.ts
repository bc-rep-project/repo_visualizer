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


import fs from "fs";
import * as nodePath from 'path';
import { shouldExcludePath } from '../components/should-exclude-path';

const importRegex: RegExp = /import\s+(?:[\w{}\s,*]+from\s+)?"'["']/g;

const extractImports = (filePath: string): string[] => {
  const content: string = fs.readFileSync(filePath, 'utf-8');
  const imports: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
};

export const processDir = async (rootPath: string = "", excludedPaths: string[] = [], excludedGlobs: string[] = []) => {
  const foldersToIgnore: string[] = [".git", ...excludedPaths];
  const fullPathFoldersToIgnore: Set<string> = new Set(foldersToIgnore.map((d: string) =>
    nodePath.join(rootPath, d)
  ));

  const fileDependencies: {[key: string]: string[]} = {};

  const getFileStats = async (path: string = "") => {
    const stats: fs.Stats = fs.statSync(`./${path}`);
    const name: string = path.split("/").filter(Boolean).slice(-1)[0];
    const size: number = stats.size;
    const relativePath: string = path.slice(rootPath.length + 1);
    return {
      name,
      path: relativePath,
      size,
    };
  };

  const addItemToTree = async (
    path: string = "",
    isFolder: boolean = true,
  ) => {
    try {
      console.log("Looking in ", `./${path}`);

      if (isFolder) {
        const filesOrFolders: string[] = fs.readdirSync(`./${path}`);
        const children: any[] = [];

        for (const fileOrFolder of filesOrFolders) {
          const fullPath: string = nodePath.join(path, fileOrFolder);
          if (shouldExcludePath(fullPath, fullPathFoldersToIgnore, excludedGlobs)) {
            continue;
          }

          const info: fs.Stats = fs.statSync(`./${fullPath}`);
          const stats = await addItemToTree(
            fullPath,
            info.isDirectory(),
          );
          if (stats) children.push(stats);
        }

        const stats = await getFileStats(path);
        return { ...stats, children };
      }

      if (shouldExcludePath(path, fullPathFoldersToIgnore, excludedGlobs)) {
        return null;
      }
      
      const stats = getFileStats(path);

      // Extract imports and link them
      const imports: string[] = extractImports(`./${path}`);
      fileDependencies[path] = imports;

      return stats;

    } catch (e) {
      console.log("Issue trying to read file", path, e);
      return null;
    }
  };

  const tree = await addItemToTree(rootPath);

  // Output the file dependencies map
  console.log("File Dependencies: ", fileDependencies);

  return tree;
};