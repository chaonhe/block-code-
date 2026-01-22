
import React, { useState, useCallback, useMemo } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  Layout,
  Menu,
  Settings,
  Save,
} from 'lucide-react';

import { Block, BlockType, EditorState, Pattern } from './types';
import Sidebar from './components/Sidebar';
import SortableBlock from './components/SortableBlock';
import Inspector from './components/Inspector';

const App: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: 'initial-1',
      type: BlockType.HEADING,
      attributes: { level: 2, content: 'Thiết kế Layout Chuyên Nghiệp' }
    },
    {
      id: 'initial-2',
      type: BlockType.COLUMNS,
      attributes: { columns: 2, gap: 32, layout: '70-30', verticalAlign: 'center' },
      innerBlocks: [
        {
          id: 'inner-1',
          type: BlockType.PARAGRAPH,
          attributes: { 
            content: 'Cột này chiếm 70% chiều rộng. Bạn có thể thay đổi tỷ lệ trong phần Inspector bên phải.',
            backgroundColor: '#eff6ff',
            padding: 24,
            borderRadius: 12
          }
        },
        {
          id: 'inner-2',
          type: BlockType.IMAGE,
          attributes: { url: 'https://picsum.photos/400/300', borderRadius: 12 }
        }
      ]
    }
  ]);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findBlockById = (blocks: Block[], id: string): Block | null => {
    for (const block of blocks) {
      if (block.id === id) return block;
      if (block.innerBlocks) {
        const found = findBlockById(block.innerBlocks, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedBlock = useMemo(() => 
    selectedBlockId ? findBlockById(blocks, selectedBlockId) : null,
  [blocks, selectedBlockId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex);
        }
        return items;
      });
    }
  };

  const addBlock = useCallback((type: BlockType) => {
    const newBlock: Block = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      attributes: {
        content: type === BlockType.CODE ? '// Code here...' : '',
        language: type === BlockType.CODE ? 'javascript' : undefined,
        level: type === BlockType.HEADING ? 2 : undefined,
        height: type === BlockType.SPACER ? 40 : undefined,
        columns: type === BlockType.COLUMNS ? 2 : undefined,
        gap: type === BlockType.COLUMNS ? 24 : undefined,
        layout: type === BlockType.COLUMNS ? 'equal' : undefined,
        verticalAlign: type === BlockType.COLUMNS ? 'start' : undefined,
      },
      innerBlocks: type === BlockType.COLUMNS ? [] : undefined
    };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  }, []);

  const duplicateBlock = useCallback((id: string) => {
    const createCopy = (b: Block): Block => ({
      ...b,
      id: `copy-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      innerBlocks: b.innerBlocks ? b.innerBlocks.map(createCopy) : undefined
    });

    const blockToCopy = findBlockById(blocks, id);
    if (!blockToCopy) return;

    const copy = createCopy(blockToCopy);
    
    // Logic to insert copy right after the original
    const insertAfter = (list: Block[]): Block[] => {
      const index = list.findIndex(b => b.id === id);
      if (index !== -1) {
        const newList = [...list];
        newList.splice(index + 1, 0, copy);
        return newList;
      }
      return list.map(b => b.innerBlocks ? { ...b, innerBlocks: insertAfter(b.innerBlocks) } : b);
    };

    setBlocks(prev => insertAfter(prev));
    setSelectedBlockId(copy.id);
  }, [blocks]);

  const addPattern = useCallback((pattern: Pattern) => {
    const createBlockWithId = (pb: any): Block => {
      const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return {
        ...pb,
        id,
        innerBlocks: pb.innerBlocks ? pb.innerBlocks.map(createBlockWithId) : undefined
      };
    };
    const newBlocks: Block[] = pattern.blocks.map(createBlockWithId);
    setBlocks(prev => [...prev, ...newBlocks]);
    if (newBlocks.length > 0) setSelectedBlockId(newBlocks[0].id);
  }, []);

  const updateBlockRecursive = (blocks: Block[], id: string, attributes: Partial<Block['attributes']>): Block[] => {
    return blocks.map(block => {
      if (block.id === id) {
        return { ...block, attributes: { ...block.attributes, ...attributes } };
      }
      if (block.innerBlocks) {
        return { ...block, innerBlocks: updateBlockRecursive(block.innerBlocks, id, attributes) };
      }
      return block;
    });
  };

  const removeBlockRecursive = (blocks: Block[], id: string): Block[] => {
    return blocks.filter(block => {
      if (block.id === id) return false;
      if (block.innerBlocks) {
        block.innerBlocks = removeBlockRecursive(block.innerBlocks, id);
      }
      return true;
    });
  };

  const updateBlock = (id: string, attributes: Partial<Block['attributes']>) => {
    setBlocks(prev => updateBlockRecursive(prev, id, attributes));
  };

  const removeBlock = (id: string) => {
    setBlocks(prev => removeBlockRecursive(prev, id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const updateInnerBlocks = (parentId: string, newInnerBlocks: Block[]) => {
    setBlocks(prev => prev.map(block => 
      block.id === parentId ? { ...block, innerBlocks: newInnerBlocks } : block
    ));
  };

  const exportSchema = () => {
    const state: EditorState = { version: '1.2.0', blocks };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blockcode-advanced-schema.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden text-slate-900">
      {isSidebarOpen && (
        <aside className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <h1 className="font-bold text-lg flex items-center gap-2">
              <Layout className="w-5 h-5 text-blue-600" />
              BlockCode <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">PRO</span>
            </h1>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-slate-100 rounded text-slate-500">
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
             <Sidebar onAddBlock={addBlock} onAddPattern={addPattern} />
          </div>
        </aside>
      )}

      <main className="flex-1 flex flex-col relative bg-[#f8fafc] overflow-hidden">
        <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
               <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded text-slate-500">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="h-4 w-px bg-slate-200"></div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Gutenberg Editor</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={exportSchema}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-200 transition-all active:scale-95">
              Publish
            </button>
          </div>
        </header>

        <div 
          className="flex-1 overflow-y-auto py-16 px-4 md:px-8 scroll-smooth"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBlockId(null);
          }}
        >
          <div className="max-w-5xl mx-auto min-h-[80vh] bg-white rounded-2xl shadow-sm border border-slate-200/60 p-12">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {blocks.map((block) => (
                    <SortableBlock 
                      key={block.id} 
                      block={block} 
                      isSelected={selectedBlockId === block.id}
                      onSelect={() => setSelectedBlockId(block.id)}
                      onUpdate={updateBlock}
                      onRemove={removeBlock}
                      onDuplicate={duplicateBlock}
                      onUpdateInner={(newInners) => updateInnerBlocks(block.id, newInners)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </main>

      <aside className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0 hidden lg:flex shadow-2xl">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h2 className="font-bold text-[11px] uppercase tracking-wider text-slate-500">
            Inspector
          </h2>
          <Settings className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex-1 overflow-hidden">
          {selectedBlock ? (
            <Inspector 
              block={selectedBlock} 
              onUpdate={(attrs) => updateBlock(selectedBlock.id, attrs)} 
            />
          ) : (
            <div className="p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="mb-4 inline-flex items-center justify-center w-14 h-14 bg-slate-50 rounded-2xl text-slate-300">
                <Settings className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-500">No Block Selected</p>
              <p className="text-xs text-slate-400 mt-2 px-6">Select a block on the canvas to edit its unique properties and styles.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default App;
