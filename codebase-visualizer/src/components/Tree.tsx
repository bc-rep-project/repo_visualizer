import React from 'react';
import Treemap from 'react-d3-treemap';
import { TreeNode } from '../utils/types';

interface TreeProps {
  data: TreeNode;
}

const Tree: React.FC<TreeProps> = ({ data }) => {
    const formatDataForTreemap = (node: TreeNode): { name: string, value?: number, children?: any[] } => {
    if (node.type === 'file') {
      return { name: node.name, value: node.size };
    } else {
      return {
        name: node.name,
        children: node.children ? node.children.map(formatDataForTreemap) : [],
      };
    }
  };

  const treemapData = formatDataForTreemap(data);

  return (
    <Treemap
    width={800}
    height={600}
    data={treemapData}
    valueFn={(value: number) => String(value)}
    />
  );
};

export default Tree;