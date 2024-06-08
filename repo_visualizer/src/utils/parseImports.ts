import * as babelParser from '@babel/parser'; 
import fs from 'fs';
import { TreeNode } from '../components/types';

export const parseImports = (rootNode: TreeNode): void => {
  const traverseNodes = (node: TreeNode) => {
    if (node.type === 'file' && node.path.endsWith('.js')) { 
      try {
        const code = fs.readFileSync(node.path, 'utf-8');
        const ast = babelParser.parse(code, { 
          sourceType: 'module', 
          plugins: ['typescript'] 
        });

        ast.program.body.forEach(statement => {
          if (statement.type === 'ImportDeclaration') {
            const importedModule = statement.source.value;

            // Extract additional import details 
            const importDetails = {
              importedModule,
              importingFile: node.path,
              defaultImport: '', // Name of the default import (if any)
              namedImports: [] as string[], // Array of named imports 
              sideEffectImport: !statement.specifiers.length // True if only side effects are imported
            };

            statement.specifiers.forEach(specifier => {
              if (specifier.type === 'ImportDefaultSpecifier') {
                importDetails.defaultImport = specifier.local.name;
              } else if (specifier.type === 'ImportSpecifier') {
                importDetails.namedImports.push(specifier.imported.name);
              } 
            });

            node.imports?.push(importDetails);
          }
        });

      } catch (error) {
        console.error(`Error parsing imports in file: ${node.path}`, error);
      }
    }

    node.children?.forEach(traverseNodes);
  };

  traverseNodes(rootNode);
};