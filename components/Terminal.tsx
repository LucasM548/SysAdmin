import React, { useState, useEffect, useRef } from 'react';
import { TerminalOutput, FileSystemNode } from '../types';
import { executeCommand } from '../utils/fileSystem';

interface TerminalProps {
  fs: FileSystemNode;
  setFs: (fs: FileSystemNode) => void;
  history: TerminalOutput[];
  setHistory: (history: TerminalOutput[]) => void;
  cwd: string;
  setCwd: (cwd: string) => void;
  onCommandExecuted?: (cmd: string, output: TerminalOutput) => void;
  externalCommand?: string | null; // Support for commands coming from IDE
}

const Terminal: React.FC<TerminalProps> = ({ 
  fs, setFs, history, setHistory, cwd, setCwd, onCommandExecuted 
}) => {
  const [input, setInput] = useState('');
  // Store just the command strings for Up/Down navigation
  const [localCommandHistory, setLocalCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null); // null = currently typing new line

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Focus input on click
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const cmd = input.trim();
      
      // Reset history navigation index
      setHistoryIndex(null);

      if (!cmd) {
         setHistory([...history, { id: Date.now().toString(), type: 'command', content: cmd, cwd }]);
         setInput('');
         return;
      }

      // Save to local history for Arrow Up/Down navigation
      setLocalCommandHistory(prev => [...prev, cmd]);

      // Add command to display history
      const cmdEntry: TerminalOutput = { id: Date.now().toString(), type: 'command', content: cmd, cwd };
      
      // Execute
      const result = executeCommand(cmd, cwd, fs, setFs);
      
      if (result.content === '__CLEAR__') {
        setHistory([]);
      } else {
        const newHistory = [...history, cmdEntry];
        if (result.content || result.type === 'error') {
            newHistory.push(result);
        }
        setHistory(newHistory);
      }

      if (result.cwd) {
        setCwd(result.cwd);
      }

      if (onCommandExecuted) {
        onCommandExecuted(cmd, result);
      }

      setInput('');
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (localCommandHistory.length === 0) return;

        const newIndex = historyIndex === null 
            ? localCommandHistory.length - 1 
            : Math.max(0, historyIndex - 1);
        
        setHistoryIndex(newIndex);
        setInput(localCommandHistory[newIndex]);
        
        // Timeout needed to move cursor to end of input after state update
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.selectionStart = inputRef.current.selectionEnd = inputRef.current.value.length;
            }
        }, 0);

    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        
        if (historyIndex === null) return; // Already at the bottom/new line

        const newIndex = historyIndex + 1;
        
        if (newIndex >= localCommandHistory.length) {
            setHistoryIndex(null);
            setInput('');
        } else {
            setHistoryIndex(newIndex);
            setInput(localCommandHistory[newIndex]);
        }
    }
  };

  return (
    <div 
      className="bg-slate-950 h-full flex flex-col font-mono text-sm overflow-hidden"
      onClick={handleContainerClick}
    >
      <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800 shrink-0">
        <span className="text-slate-500 text-xs">etudiant@sysadmin-101:{cwd}</span>
        <div className="flex gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700 hover:bg-red-500 transition-colors"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700 hover:bg-yellow-500 transition-colors"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700 hover:bg-green-500 transition-colors"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin">
        <div className="text-slate-600 mb-4 text-xs">
            Bienvenue dans le Terminal SysAdmin 101 v2.1.0<br/>
            Tapez 'help' pour voir les commandes disponibles.
        </div>

        {history.map((entry) => (
          <div key={entry.id} className="break-all animate-in fade-in duration-100">
            {entry.type === 'command' && (
              <div className="flex gap-2 text-slate-300 mt-3 mb-1">
                <span className="text-green-500 font-bold">➜</span>
                <span className="text-blue-400">{entry.cwd}</span>
                <span className="text-slate-100">{entry.content}</span>
              </div>
            )}
            {entry.type === 'output' && (
              <div className="text-slate-400 whitespace-pre-wrap ml-4 leading-relaxed">{entry.content}</div>
            )}
            {entry.type === 'error' && (
              <div className="text-red-400 ml-4">{entry.content}</div>
            )}
          </div>
        ))}

        <div className="flex gap-2 items-center text-slate-300 mt-2">
          <span className="text-green-500 font-bold">➜</span>
          <span className="text-blue-400">{cwd}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none flex-1 text-slate-100 placeholder-slate-700"
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Terminal;