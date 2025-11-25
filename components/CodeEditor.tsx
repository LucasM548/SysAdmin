import React, { useState, useEffect } from 'react';
import { Play, Save, FileCode, Eraser, CheckCircle, AlertCircle } from 'lucide-react';
import { FileSystemNode, TerminalOutput } from '../types';
import { executeCommand, saveFile } from '../utils/fileSystem';

interface CodeEditorProps {
  fs: FileSystemNode;
  setFs: (fs: FileSystemNode) => void;
  cwd: string;
  onRun: (cmd: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ fs, setFs, cwd, onRun }) => {
  // Load initial state from localStorage if available
  const [code, setCode] = useState(() => localStorage.getItem('editor_code') || '#!/bin/bash\n\n# Write your script here\n');
  const [filename, setFilename] = useState(() => localStorage.getItem('editor_filename') || 'myscript.sh');
  const [saveStatus, setSaveStatus] = useState<'unsaved' | 'saved'>('unsaved');

  useEffect(() => {
      setSaveStatus('unsaved');
  }, [code, filename]);

  // Persist code and filename whenever they change
  useEffect(() => {
      localStorage.setItem('editor_code', code);
  }, [code]);

  useEffect(() => {
      localStorage.setItem('editor_filename', filename);
  }, [filename]);

  const handleSave = () => {
    // Use saveFile helper to directly write content to FS
    // We save as executable (-rwxr-xr-x) by default now, as requested.
    const success = saveFile(filename, code, cwd, fs, setFs, '-rwxr-xr-x');
    
    if (success) {
        setSaveStatus('saved');
        return true;
    } else {
        alert('Error saving file. Check filename and directory permissions.');
        return false;
    }
  };

  const handleRun = () => {
    // Always save before running
    const saved = handleSave();
    if (saved) {
        onRun(`./${filename}`);
    }
  };

  const handleClear = () => {
      // No confirmation needed
      setCode('#!/bin/bash\n\n');
  };

  return (
    // Removed border-slate-700 from main div to blend better with tab content
    <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-lg flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="bg-slate-900 p-2 border-b border-slate-800 overflow-x-auto scrollbar-thin">
        <div className="flex items-center justify-between min-w-[310px] gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 bg-slate-950 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-800">
                    <FileCode size={14} className="text-amber-500 shrink-0" />
                    <input 
                        type="text" 
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        className="bg-transparent text-slate-300 text-xs font-mono focus:outline-none w-24 sm:w-28"
                    />
                </div>
                {/* Status: Text on Desktop, Icon on Mobile */}
                <div className={`flex items-center gap-1.5 ${saveStatus === 'saved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {saveStatus === 'saved' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    <span className="text-[10px] uppercase font-bold tracking-wider hidden sm:inline">
                        {saveStatus === 'saved' ? 'Sauvegardé' : 'Modifié'}
                    </span>
                </div>
            </div>
            
            <div className="flex gap-2 shrink-0">
                <button 
                    onClick={handleClear}
                    className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded transition-colors"
                    title="Effacer"
                >
                    <Eraser size={16} />
                </button>
                <button 
                    onClick={() => handleSave()}
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-700 hover:border-slate-600 transition-colors text-xs font-bold"
                >
                    <Save size={14} />
                    <span className="hidden xs:inline">Save</span>
                </button>
                <button 
                    onClick={handleRun}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors text-xs font-bold shadow-lg shadow-green-900/20"
                >
                    <Play size={14} />
                    <span>Run</span>
                </button>
            </div>
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