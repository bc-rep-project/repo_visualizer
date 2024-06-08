// export type ImportType = {
//   moduleName: string;
//   defaultImport: string;
//   namedImports: Record<string, string>[];
//   starImport: string;
//   sideEffectOnly: boolean;
// };
// export type CommitType = {
//   hash: string;
//   subject: string;
//   author: string;
//   date: string;
//   diff: { added: number; removed: number; modified: number };
// };
// export type FileType = {
//   name: string;
//   path: string;
//   size: number;
//   commits?: CommitType[];
//   imports?: ImportType[];
//   numberOfLines?: number;
//   children?: FileType[];
// };



export type ImportType = {
  moduleName: string;
  defaultImport: string;
  namedImports: Record<string, string>[];
  starImport: string;
  sideEffectOnly: boolean;
};

export type CommitType = {
  hash: string;
  subject: string;
  author: string;
  date: string;
  diff: { added: number; removed: number; modified: number };
};

export type FileType = {
  name: string;
  path: string;
  size: number;
  commits?: CommitType[];
  imports?: ImportType[];
  numberOfLines?: number;
  children?: FileType[];
};

export interface TreeNode {
  name: string;
  path: string;
  size: number;
  type: 'file' | 'directory'; 
  children?: TreeNode[];
  imports?: { importedModule: string; importingFile: string }[]; 
  x?: number; 
  y?: number;
}