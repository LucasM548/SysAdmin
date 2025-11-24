import React, { useState } from 'react';
import { FileSystemNode } from '../types';
import { Folder, FileText, ChevronRight, ChevronDown, Lock, HardDrive, FileCode } from 'lucide-react';

interface FileSystemVisualizerProps {
  root: FileSystemNode;
}

const FileNode: React.FC<{ 
    node: FileSystemNode; 
    depth?: number; 
    onSelect: (node: FileSystemNode) => void;
    selectedId?: string;
}> = ({ node, depth = 0, onSelect, selectedId }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isDir = node.type === 'directory';
  const hasChildren = isDir && node.children && Object.keys(node.children).length > 0;
  const isSelected = node.name === selectedId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDir) {
        setIsOpen(!isOpen);
    } else {
        onSelect(node);
    }
  };

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors ${
            isSelected 
                ? 'bg-blue-900/40 text-blue-300' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        } ${depth === 0 ? 'bg-slate-950 border border-slate-800 mb-1 text-slate-300' : ''}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        <span className="text-slate-500 shrink-0">
          {isDir ? (
            hasChildren ? (
              isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            ) : <div className="w-3.5" /> 
          ) : <div className="w-3.5" />}
        </span>
        
        {isDir ? (
            depth === 0 ? <HardDrive size={16} className="text-blue-500" /> : <Folder size={16} className="text-indigo-400" />
        ) : (
            <FileText size={16} className={node.name.endsWith('.sh') ? 'text-emerald-500' : 'text-slate-500'} />
        )}
        
        <span className={`text-sm font-mono truncate ${node.name.startsWith('.') ? 'text-slate-500' : ''}`}>
          {node.name === 'root' ? '/' : node.name}
        </span>

        {node.permissions.includes('--------') && <Lock size={12} className="text-red-500 ml-auto" />}
      </div>

      {isOpen && hasChildren && (
        <div className="border-l border-slate-800 ml-[15px]">
          {Object.entries(node.children || {}).map(([name, child]) => (
            <FileNode 
                key={name} 
                node={child} 
                depth={depth + 1} 
                onSelect={onSelect} 
                selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileSystemVisualizer: React.FC<FileSystemVisualizerProps> = ({ root }) => {
  const [selectedFile, setSelectedFile] = useState<FileSystemNode | null>(null);

  return (
    <div className="flex flex-col h-full gap-4">
        {/* Tree View */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-inner overflow-hidden flex flex-col flex-1">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-slate-300 flex items-center gap-2 text-sm">
                    <HardDrive size={16} className="text-blue-500" />
                    Système de Fichiers
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">Lecture Seule</span>
            </div>
            <div className="p-2 overflow-y-auto flex-1 scrollbar-thin">
                <FileNode 
                    node={root} 
                    onSelect={(node) => setSelectedFile(node)} 
                    selectedId={selectedFile?.name}
                />
            </div>
        </div>

        {/* File Content View */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col h-1/3">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2 shrink-0">
                <FileCode size={16} className="text-slate-500" />
                <span className="text-xs font-mono text-slate-400">
                    {selectedFile ? selectedFile.name : 'Sélectionnez un fichier'}
                </span>
                {selectedFile && (
                    <span className="ml-auto text-[10px] font-mono text-slate-600 bg-slate-900 px-1.5 rounded">
                        {selectedFile.permissions}
                    </span>
                )}
            </div>
            <div className="p-4 overflow-y-auto flex-1 scrollbar-thin">
                {selectedFile ? (
                    <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">
                        {selectedFile.content || <span className="text-slate-600 italic">Fichier vide</span>}
                    </pre>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-700 text-xs italic">
                        Aucun contenu à afficher
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default FileSystemVisualizer;