import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { TreeNode } from './types';

const parseFileImports = (filePath: string): { importedModule: string; importingFile: string }[] => {
  const code = fs.readFileSync(filePath, 'utf-8');
  const ast = parse(code, { sourceType: 'module', plugins: ['typescript'] });
  const imports: { importedModule: string; importingFile: string }[] = [];

  traverse(ast, {
    ImportDeclaration({ node }) {
      imports.push({
        importedModule: node.source.value,
        importingFile: filePath,
      });
    },
  });

  return imports;
};

export const parseImports = (node: TreeNode): void => {
  if (node.type === 'file' && node.path.endsWith('.js')) {
    node.imports = parseFileImports(node.path);
  }

  if (node.children) {
    node.children.forEach(parseImports);
  }
};
