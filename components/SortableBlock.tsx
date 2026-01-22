
import React, { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  Trash2, 
  Cpu, 
  Loader2,
  Settings2,
  Plus,
  Copy
} from 'lucide-react';
import { Block, BlockType } from '../types';
import { generateCodeFromPrompt } from '../services/geminiService';

declare var Quill: any;

interface SortableBlockProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (id: string, attrs: Partial<Block['attributes']>) => void;
  onRemove: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onUpdateInner?: (newInnerBlocks: Block[]) => void;
}

const QuillEditor: React.FC<{ 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string;
  isSelected: boolean;
}> = ({ value, onChange, placeholder, isSelected }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (containerRef.current && !quillRef.current) {
      quillRef.current = new Quill(containerRef.current, {
        theme: 'snow',
        placeholder: placeholder || 'Bắt đầu viết...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'clean']
          ]
        }
      });

      quillRef.current.on('text-change', () => {
        if (!isUpdatingRef.current) {
          onChange(quillRef.current.root.innerHTML);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      isUpdatingRef.current = true;
      const selection = quillRef.current.getSelection();
      quillRef.current.root.innerHTML = value || '';
      if (selection) {
        quillRef.current.setSelection(selection.index, selection.length);
      }
      isUpdatingRef.current = false;
    }
  }, [value]);

  return (
    <div className="relative w-full">
      <div ref={containerRef} className="w-full text-slate-600 leading-relaxed" />
    </div>
  );
};

const SortableBlock: React.FC<SortableBlockProps> = ({ 
  block, isSelected, onSelect, onUpdate, onRemove, onDuplicate, onUpdateInner 
}) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const {
    attributes: dndAttributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.3 : 1,
  };

  const blockStyle: React.CSSProperties = {
    backgroundColor: block.attributes.backgroundColor,
    color: block.attributes.textColor,
    padding: block.attributes.padding ? `${block.attributes.padding}px` : undefined,
    borderRadius: block.attributes.borderRadius ? `${block.attributes.borderRadius}px` : undefined,
  };

  const handleAiGenerate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const result = await generateCodeFromPrompt(aiPrompt, block.attributes.language || 'javascript');
      onUpdate(block.id, { content: result });
      setAiPrompt('');
    } finally {
      setIsAiLoading(false);
    }
  };

  const addInnerBlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newBlock: Block = {
      id: `inner-${Date.now()}-${Math.random()}`,
      type: BlockType.PARAGRAPH,
      attributes: { content: '<p>Nội dung mới trong cột...</p>' }
    };
    if (onUpdateInner) {
      onUpdateInner([...(block.innerBlocks || []), newBlock]);
    }
  };

  const renderContent = () => {
    switch (block.type) {
      case BlockType.HEADING:
        return (
          <input
            value={block.attributes.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            placeholder="Heading..."
            style={{ color: 'inherit' }}
            className={`w-full bg-transparent border-none outline-none font-bold placeholder:text-slate-200 ${
              block.attributes.level === 1 ? 'text-4xl' : 
              block.attributes.level === 2 ? 'text-3xl' : 
              'text-2xl'
            }`}
          />
        );
      case BlockType.PARAGRAPH:
        return (
          <QuillEditor 
            value={block.attributes.content || ''} 
            onChange={(val) => onUpdate(block.id, { content: val })}
            isSelected={isSelected}
          />
        );
      case BlockType.CODE:
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded">
                {block.attributes.language}
              </span>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <input 
                  type="text" 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Gợi ý AI..."
                  className="text-[10px] px-2 py-1 border border-slate-200 rounded-lg outline-none focus:border-blue-400 w-24 transition-all focus:w-40"
                />
                <button 
                  onClick={handleAiGenerate}
                  disabled={isAiLoading}
                  className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Cpu className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <textarea
              value={block.attributes.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              className="w-full bg-[#0d1117] text-[#c9d1d9] p-5 rounded-xl font-mono text-xs leading-relaxed outline-none border border-transparent focus:border-blue-500/30 shadow-2xl min-h-[100px]"
              rows={Math.max(3, (block.attributes.content?.split('\n').length || 3))}
            />
          </div>
        );
      case BlockType.IMAGE:
        return (
          <div className="space-y-3">
            {block.attributes.url ? (
              <img src={block.attributes.url} style={{ borderRadius: blockStyle.borderRadius }} className="w-full h-auto border border-slate-100 shadow-sm" />
            ) : (
              <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center text-[11px] text-slate-400 bg-slate-50/50">
                Configure Image in Inspector
              </div>
            )}
            <input 
              value={block.attributes.caption}
              onChange={(e) => onUpdate(block.id, { caption: e.target.value })}
              placeholder="Caption cho ảnh..."
              className="w-full text-center italic text-xs text-slate-400 outline-none bg-transparent"
            />
          </div>
        );
      case BlockType.SPACER:
        return (
          <div style={{ height: `${block.attributes.height}px` }} className="w-full border-y border-dashed border-slate-100 flex items-center justify-center bg-slate-50/20">
             <span className="text-[9px] uppercase tracking-widest text-slate-300 font-bold opacity-0 group-hover:opacity-100">Khoảng trống {block.attributes.height}px</span>
          </div>
        );
      case BlockType.COLUMNS:
        const columnCount = block.attributes.columns || 2;
        const layout = block.attributes.layout || 'equal';
        const vAlign = block.attributes.verticalAlign || 'start';

        let gridTemplate = `repeat(${columnCount}, 1fr)`;
        if (layout === '70-30') gridTemplate = '7fr 3fr';
        if (layout === '30-70') gridTemplate = '3fr 7fr';
        if (layout === '25-50-25') gridTemplate = '1fr 2fr 1fr';
        if (layout === 'wide-center') gridTemplate = '1fr 3fr 1fr';

        const alignMap = { start: 'flex-start', center: 'center', end: 'flex-end' };
        
        return (
          <div className="relative pt-6 pb-2 px-2 border-2 border-dashed border-slate-200/50 rounded-2xl bg-slate-50/30 group/columns">
            <div className="absolute -top-3 left-4 bg-white border border-slate-200 rounded-full px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
              Columns Container ({layout})
            </div>
            <div 
              className="grid" 
              style={{ 
                gridTemplateColumns: gridTemplate, 
                gap: `${block.attributes.gap}px`,
                alignItems: alignMap[vAlign]
              }}
            >
              {block.innerBlocks?.map((inner) => (
                <div key={inner.id} className="relative">
                  <SortableBlock 
                    block={inner}
                    isSelected={isSelected && inner.id === block.id}
                    onSelect={onSelect}
                    onUpdate={(id, attrs) => {
                       const updated = block.innerBlocks?.map(b => b.id === id ? {...b, attributes: {...b.attributes, ...attrs}} : b);
                       if (onUpdateInner && updated) onUpdateInner(updated);
                    }}
                    onRemove={(id) => {
                       const filtered = block.innerBlocks?.filter(b => b.id !== id);
                       if (onUpdateInner && filtered) onUpdateInner(filtered);
                    }}
                    onDuplicate={(id) => {
                       const bToCopy = block.innerBlocks?.find(b => b.id === id);
                       if (bToCopy && onUpdateInner) {
                          const copy = {...bToCopy, id: `inner-copy-${Date.now()}`};
                          onUpdateInner([...(block.innerBlocks || []), copy]);
                       }
                    }}
                  />
                </div>
              ))}
              {(!block.innerBlocks || block.innerBlocks.length < 12) && (
                <button 
                  onClick={addInnerBlock}
                  className="flex items-center justify-center p-6 border border-dashed border-slate-200 rounded-xl text-slate-300 hover:text-blue-500 hover:border-blue-400 bg-white/50 transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => setShowToolbar(false)}
      className={`group relative py-4 px-12 transition-all border-2 rounded-2xl mb-2 ${
        isSelected 
          ? 'border-blue-500 bg-white shadow-2xl shadow-blue-500/5 ring-4 ring-blue-500/5 is-selected' 
          : 'border-transparent hover:bg-slate-50/40'
      }`}
    >
      <div 
        {...dndAttributes} 
        {...listeners}
        className={`absolute left-3 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-2 text-slate-300 hover:text-blue-500 transition-opacity ${showToolbar || isSelected ? 'opacity-100' : 'opacity-0'}`}
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {(showToolbar || isSelected) && (
        <div className="absolute -top-4 right-8 flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 animate-in fade-in slide-in-from-bottom-2">
           <button 
            onClick={(e) => { e.stopPropagation(); onDuplicate?.(block.id); }}
            title="Duplicate"
            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
           <button 
            onClick={(e) => { e.stopPropagation(); onRemove(block.id); }}
            title="Delete"
            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-px bg-slate-100 mx-0.5"></div>
          <button onClick={(e) => { e.stopPropagation(); onSelect(); }} className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg">
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="w-full transition-all" style={blockStyle}>
        {renderContent()}
      </div>
    </div>
  );
};

export default SortableBlock;
