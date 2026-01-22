
import React, { useState } from 'react';
import { Block, BlockType } from '../types';
import { 
  Type, 
  Code as CodeIcon, 
  Heading as HeadingIcon, 
  ImageIcon, 
  Maximize2,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Columns as ColumnsIcon,
  ChevronDown,
  ChevronRight,
  Database,
  Palette,
  Settings as SettingsIcon,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd
} from 'lucide-react';

interface InspectorProps {
  block: Block;
  onUpdate: (attrs: Partial<Block['attributes']>) => void;
}

const Inspector: React.FC<InspectorProps> = ({ block, onUpdate }) => {
  const [isSchemaExpanded, setIsSchemaExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'styles'>('settings');

  const renderGeneral = () => (
    <div className="mb-6">
       <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            {block.type === BlockType.HEADING && <HeadingIcon className="w-5 h-5" />}
            {block.type === BlockType.PARAGRAPH && <Type className="w-5 h-5" />}
            {block.type === BlockType.CODE && <CodeIcon className="w-5 h-5" />}
            {block.type === BlockType.IMAGE && <ImageIcon className="w-5 h-5" />}
            {block.type === BlockType.SPACER && <Maximize2 className="w-5 h-5" />}
            {block.type === BlockType.COLUMNS && <ColumnsIcon className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-800 capitalize leading-tight">{block.type}</p>
            <p className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter mt-0.5">ID: {block.id.slice(0, 8)}</p>
          </div>
       </div>
    </div>
  );

  const renderStyleSettings = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
      <div>
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Colors</label>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">Background</span>
            <input 
              type="color" 
              value={block.attributes.backgroundColor || '#ffffff'} 
              onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer border-none p-0"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">Text Color</span>
            <input 
              type="color" 
              value={block.attributes.textColor || '#000000'} 
              onChange={(e) => onUpdate({ textColor: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer border-none p-0"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Padding</label>
          <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{block.attributes.padding || 0}px</span>
        </div>
        <input 
          type="range" min="0" max="64" step="4"
          value={block.attributes.padding || 0}
          onChange={(e) => onUpdate({ padding: parseInt(e.target.value) })}
          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Border Radius</label>
          <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{block.attributes.borderRadius || 0}px</span>
        </div>
        <input 
          type="range" min="0" max="32" step="4"
          value={block.attributes.borderRadius || 0}
          onChange={(e) => onUpdate({ borderRadius: parseInt(e.target.value) })}
          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>
    </div>
  );

  const renderColumnsSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-bold text-slate-600 block mb-3">Layout Ratio</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'equal', label: 'Equal', icon: '1:1' },
            { id: '70-30', label: '70 / 30', icon: '2:1' },
            { id: '30-70', label: '30 / 70', icon: '1:2' },
            { id: '25-50-25', label: '25/50/25', icon: '1:2:1' }
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => onUpdate({ layout: r.id as any })}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                block.attributes.layout === r.id 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-600 block mb-3">Vertical Alignment</label>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          {[
            { id: 'start', icon: <AlignVerticalJustifyStart className="w-4 h-4" /> },
            { id: 'center', icon: <AlignVerticalJustifyCenter className="w-4 h-4" /> },
            { id: 'end', icon: <AlignVerticalJustifyEnd className="w-4 h-4" /> }
          ].map((a) => (
            <button
              key={a.id}
              onClick={() => onUpdate({ verticalAlign: a.id as any })}
              className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all ${
                block.attributes.verticalAlign === a.id 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {a.icon}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-xs font-bold text-slate-600">Column Gap</label>
          <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{block.attributes.gap}px</span>
        </div>
        <input 
          type="range" min="0" max="100" step="4"
          value={block.attributes.gap || 20}
          onChange={(e) => onUpdate({ gap: parseInt(e.target.value) })}
          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tabs */}
      <div className="flex border-b border-slate-100 p-1 bg-slate-100/50 m-4 rounded-xl">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <SettingsIcon className="w-3.5 h-3.5" /> Config
        </button>
        <button
          onClick={() => setActiveTab('styles')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'styles' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Palette className="w-3.5 h-3.5" /> Style
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {renderGeneral()}
        
        {activeTab === 'settings' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-2 duration-200">
            {block.type === BlockType.COLUMNS && renderColumnsSettings()}
            
            {block.type === BlockType.HEADING && (
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-3">Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((l) => (
                    <button
                      key={l}
                      onClick={() => onUpdate({ level: l as any })}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        block.attributes.level === l 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      H{l}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {block.type === BlockType.IMAGE && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">Image URL</label>
                  <input 
                    type="text" value={block.attributes.url || ''}
                    onChange={(e) => onUpdate({ url: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            {block.type === BlockType.SPACER && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold text-slate-600">Height</label>
                  <span className="text-[10px] font-mono font-bold text-blue-600">{block.attributes.height}px</span>
                </div>
                <input 
                  type="range" min="10" max="400" step="10"
                  value={block.attributes.height || 40}
                  onChange={(e) => onUpdate({ height: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            )}
          </div>
        ) : (
          renderStyleSettings()
        )}
      </div>

      {/* JSON Schema Section */}
      <div className="border-t border-slate-200 bg-slate-50 flex flex-col max-h-[300px]">
        <button 
          onClick={() => setIsSchemaExpanded(!isSchemaExpanded)}
          className="flex items-center justify-between w-full px-5 py-4 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2 text-slate-500">
            <Database className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Metadata Schema</span>
          </div>
          {isSchemaExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>

        {isSchemaExpanded && (
          <div className="flex-1 overflow-auto bg-[#0d1117] p-5 font-mono text-[10px] leading-relaxed shadow-inner">
            <pre className="text-blue-300">
              {JSON.stringify(block, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inspector;
