
import React, { useState } from 'react';
import { 
  Code, 
  Type as TypeIcon, 
  Heading, 
  Image as ImageIcon, 
  MoveHorizontal,
  Box,
  Layers,
  Columns as ColumnsIcon
} from 'lucide-react';
import { BlockType, Pattern } from '../types';

interface SidebarProps {
  onAddBlock: (type: BlockType) => void;
  onAddPattern: (pattern: Pattern) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddBlock, onAddPattern }) => {
  const [activeTab, setActiveTab] = useState<'blocks' | 'patterns'>('blocks');

  const blockCategories = [
    {
      name: 'Text & Media',
      items: [
        { type: BlockType.HEADING, label: 'Heading', icon: <Heading className="w-5 h-5" /> },
        { type: BlockType.PARAGRAPH, label: 'Paragraph', icon: <TypeIcon className="w-5 h-5" /> },
        { type: BlockType.IMAGE, label: 'Image', icon: <ImageIcon className="w-5 h-5" /> },
      ]
    },
    {
      name: 'Development',
      items: [
        { type: BlockType.CODE, label: 'Code Snippet', icon: <Code className="w-5 h-5" /> },
      ]
    },
    {
      name: 'Layout',
      items: [
        { type: BlockType.COLUMNS, label: 'Columns', icon: <ColumnsIcon className="w-5 h-5" /> },
        { type: BlockType.SPACER, label: 'Spacer', icon: <MoveHorizontal className="w-5 h-5" /> },
      ]
    }
  ];

  const patterns: Pattern[] = [
    {
      id: 'feature-grid',
      label: 'Feature Grid',
      description: '2 Columns feature list',
      blocks: [
        { type: BlockType.HEADING, attributes: { level: 2, content: 'Tính năng chính' } },
        { 
          type: BlockType.COLUMNS, 
          // Fix: Changed layout '1-1' to 'equal' to match defined layout types in BlockAttributes
          attributes: { columns: 2, layout: 'equal', gap: 30 },
          innerBlocks: [
            { type: BlockType.PARAGRAPH, attributes: { content: 'Tốc độ xử lý vượt trội với AI tích hợp sẵn trong trình soạn thảo.' } },
            { type: BlockType.PARAGRAPH, attributes: { content: 'Giao diện trực quan giúp bạn tập trung vào nội dung thay vì kỹ thuật.' } }
          ]
        }
      ]
    },
    {
      id: 'hero-with-image',
      label: 'Hero Image Split',
      description: 'Image left, Text right',
      blocks: [
        { 
          type: BlockType.COLUMNS, 
          // Fix: Changed layout '1-1' to 'equal' to match defined layout types in BlockAttributes
          attributes: { columns: 2, layout: 'equal', gap: 40 },
          innerBlocks: [
            { type: BlockType.IMAGE, attributes: { url: 'https://picsum.photos/600/400', caption: 'Product Shot' } },
            { type: BlockType.HEADING, attributes: { level: 2, content: 'Nâng tầm sáng tạo' } }
          ]
        }
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex border-b border-slate-100 p-1 bg-slate-100/50 m-2 rounded-lg">
        <button
          onClick={() => setActiveTab('blocks')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${
            activeTab === 'blocks' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Box className="w-3.5 h-3.5" /> Blocks
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${
            activeTab === 'patterns' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Patterns
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'blocks' ? (
          <div className="space-y-6">
            {blockCategories.map((cat) => (
              <div key={cat.name}>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">{cat.name}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {cat.items.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => onAddBlock(item.type)}
                      className="group flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all active:scale-95"
                    >
                      <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors mb-2 text-slate-500">
                        {item.icon}
                      </div>
                      <span className="text-[11px] font-medium text-slate-600">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {patterns.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => onAddPattern(pattern)}
                className="w-full text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-600 hover:shadow-lg transition-all group"
              >
                <h4 className="text-xs font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{pattern.label}</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">{pattern.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
