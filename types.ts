
export enum BlockType {
  CODE = 'code',
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
  IMAGE = 'image',
  SPACER = 'spacer',
  COLUMNS = 'columns'
}

export interface BlockAttributes {
  // Content Attributes
  content?: string;
  language?: string;
  level?: 1 | 2 | 3 | 4;
  url?: string;
  caption?: string;
  height?: number;
  
  // Layout & Column Attributes
  columns?: number;
  gap?: number;
  layout?: 'equal' | '70-30' | '30-70' | '25-50-25' | 'wide-center';
  verticalAlign?: 'start' | 'center' | 'end';
  
  // Style Attributes
  backgroundColor?: string;
  textColor?: string;
  padding?: number;
  borderRadius?: number;
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge';
}

export interface Block {
  id: string;
  type: BlockType;
  attributes: BlockAttributes;
  innerBlocks?: Block[];
}

export interface EditorState {
  version: string;
  blocks: Block[];
}

export type PatternBlock = Omit<Block, 'id' | 'innerBlocks'> & {
  innerBlocks?: PatternBlock[];
};

export interface Pattern {
  id: string;
  label: string;
  description: string;
  blocks: PatternBlock[];
}
