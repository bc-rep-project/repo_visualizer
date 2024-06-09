import * as babelParser from '@babel/parser'; 
import type { 
  ImportDeclaration,
  Node,
  Statement
} from '@babel/types'; 
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

        ast.program.body.forEach((statement: Statement) => {
          if (statement.type === 'ImportDeclaration') {
            const importedModule = statement.source.value;

            // Extract additional import details 
            const importDetails = {
              importedModule,
              importingFile: node.path,
              defaultImport: '', 
              namedImports: [] as string[], 
              sideEffectImport: !statement.specifiers.length 
            };

            (statement as ImportDeclaration).specifiers.forEach((specifier: Node) => {
              if (specifier.type === 'ImportDefaultSpecifier') {
                importDetails.defaultImport = specifier.local.name;
              } else if (specifier.type === 'ImportSpecifier' && specifier.imported.type === 'Identifier') {
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