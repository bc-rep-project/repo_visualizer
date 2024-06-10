// src/app/components/process-dir.ts

import * as fs from 'fs';
import * as path from 'path';
import * as micromatch from 'micromatch';

export function processDir(rootPath: string, excludedPaths: string[], excludedGlobs: string[]): any {
  // Create Ignore Sets
  const pathsToIgnore = new Set(excludedPaths);
  const globsToIgnore = excludedGlobs;

  function getFileStats(filePath: string): any {
    const stats = fs.statSync(filePath);
    const imports = extractImports(fs.readFileSync(filePath, 'utf8'));
    return { stats, imports };
  }

  function addItemToTree(filePath: string): any {
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      const children = fs.readdirSync(filePath).map((child) => addItemToTree(path.join(filePath, child)));
      return { path: filePath, type: 'directory', children };
    } else if (stats.isFile()) {
      if (shouldExcludePath(filePath, pathsToIgnore, globsToIgnore)) {
        return null;
      }
      return getFileStats(filePath);
    }
  }

  function extractImports(fileContents: string): any[] {
    const imports: any[] = [];
    const importRegex = /import\s+(.+?)\s+from\s+(['"])(.+?)\2/g;
    let match: RegExpExecArray | null;
    while ((match = importRegex.exec(fileContents)) !== null) {
      imports.push({
        importedModule: match[3], // The imported module
        importingFile: match[1] // The file doing the importing
      });
    }
    return imports;
  }

  function shouldExcludePath(path: string, pathsToIgnore: Set<string>, globsToIgnore: string[]): boolean {
    return (
      pathsToIgnore.has(path) ||
      globsToIgnore.some((glob) => micromatch.isMatch(path, glob, { dot: true }))
    );
  }

  return addItemToTree(rootPath);
}