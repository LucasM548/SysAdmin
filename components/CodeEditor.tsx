import React, { useState, useEffect } from 'react';
import { Play, Save, FileCode, Eraser } from 'lucide-react';
import { FileSystemNode, TerminalOutput } from '../types';
import { executeCommand, saveFile } from '../utils/fileSystem';

interface CodeEditorProps {
  fs: FileSystemNode;
  setFs: (fs: FileSystemNode) => void;
  cwd: string;
  onRun: (cmd: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ fs, setFs, cwd, onRun }) => {
  const [code, setCode] = useState('#!/bin/bash\n\n# Write your script here\n');
  const [filename, setFilename] = useState('myscript.sh');
  const [saveStatus, setSaveStatus] = useState<'unsaved' | 'saved'>('unsaved');

  useEffect(() => {
      setSaveStatus('unsaved');
  }, [code, filename]);

  const handleSave = () => {
    // Use saveFile helper to directly write content to FS
    // Force executable permissions (-rwxr-xr-x) for scripts in the lab to avoid "Permission denied"
    const success = saveFile(filename, code, cwd, fs, setFs, '-rwxr-xr-x');
    
    if (success) {
        setSaveStatus('saved');
    } else {
        alert('Error saving file. Check filename and directory.');
    }
  };

  const handleRun = () => {
    if (saveStatus === 'unsaved') {
        handleSave();
    }
    onRun(`./${filename}`);
  };

  return (
    // Removed border-slate-700 from main div to blend better with tab content
    <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-lg flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="bg-slate-900 p-2 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <FileCode size={14} className="text-amber-500" />
                <input 
                    type="text" 
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="bg-transparent text-slate-300 text-xs font-mono focus:outline-none w-28"
                />
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-wider ${saveStatus === 'saved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                {saveStatus === 'saved' ? 'Sauvegardé' : 'Non enregistré'}
            </span>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setCode('#!/bin/bash\n\n')}
                className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded transition-colors"
                title="Effacer"
            >
                <Eraser size={16} />
            </button>
            <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-700 hover:border-slate-600 transition-colors text-xs font-bold"
            >
                <Save size={14} />
                Save
            </button>
            <button 
                onClick={handleRun}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors text-xs font-bold shadow-lg shadow-green-900/20"
            >
                <Play size={14} />
                Run
            </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative group">
        <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full bg-slate-950 text-slate-300 font-mono text-sm p-4 resize-none focus:outline-none leading-relaxed selection:bg-slate-700"
            spellCheck="false"
        />
      </div>
    </div>
  );
};

export default CodeEditor;