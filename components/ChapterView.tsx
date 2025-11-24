import React, { useState, useEffect } from 'react';
import { Chapter, TerminalOutput, FileSystemNode, Exercise } from '../types';
import Terminal from './Terminal';
import FileSystemVisualizer from './FileSystemVisualizer';
import PermissionVisualizer from './PermissionVisualizer';
import CodeEditor from './CodeEditor';
import { BookOpen, CheckSquare, ChevronRight, CheckCircle, HelpCircle, Terminal as TerminalIcon, Layout, Code, Eye, EyeOff, Monitor, Book } from 'lucide-react';
import { getNode, resolvePath, executeCommand } from '../utils/fileSystem';

interface ChapterViewProps {
  chapter: Chapter;
}

type Tab = 'COURSE' | 'VISUALS' | 'EXERCISES' | 'IDE';
type MobileTab = 'CONTENT' | 'TERMINAL';

// Helper component for interactive hints
const ExerciseHint: React.FC<{ hint: string, compact?: boolean }> = ({ hint, compact }) => {
  const [show, setShow] = useState(false);

  if (compact) {
    return (
      <div className="mt-2">
        <button
          onClick={() => setShow(!show)}
          className="text-[10px] text-slate-500 hover:text-blue-400 flex items-center gap-1 transition-colors focus:outline-none"
        >
          <HelpCircle size={10} />
          {show ? 'Masquer l\'indice' : 'Voir l\'indice'}
        </button>
        {show && <p className="text-xs text-slate-400 mt-1 italic pl-2 border-l-2 border-slate-700">{hint}</p>}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => setShow(!show)}
        className="text-xs font-medium text-slate-400 hover:text-blue-400 flex items-center gap-1.5 focus:outline-none transition-colors bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1 rounded"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
        {show ? 'Masquer l\'indice' : 'Afficher l\'indice'}
      </button>
      {show && (
        <div className="mt-3 p-3 bg-slate-800/50 text-yellow-200/80 text-sm rounded-lg border border-yellow-900/30 flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <HelpCircle size={16} className="mt-0.5 flex-shrink-0 text-yellow-500/70" />
          <span>{hint}</span>
        </div>
      )}
    </div>
  );
};

const ChapterView: React.FC<ChapterViewProps> = ({ chapter }) => {
  const [activeTab, setActiveTab] = useState<Tab>('COURSE');
  const [mobileView, setMobileView] = useState<MobileTab>('CONTENT');
  
  // Terminal State
  const [fs, setFs] = useState<FileSystemNode>(chapter.initialFileSystem);
  const [history, setHistory] = useState<TerminalOutput[]>([]);
  const [cwd, setCwd] = useState<string>('/home/etudiant');
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  // Reset state when chapter changes
  useEffect(() => {
    setFs(JSON.parse(JSON.stringify(chapter.initialFileSystem)));
    setHistory([]);
    setCwd('/home/etudiant');
    setCompletedExercises(new Set());
    setActiveTab('COURSE');
    setMobileView('CONTENT');
  }, [chapter.id]);

  // Execute command from Editor
  const handleEditorRun = (cmd: string) => {
      // This simulates typing the command in the terminal
      setExternalCommand(cmd);
      // On mobile, switch to terminal view to see output
      if (window.innerWidth < 768) {
          setMobileView('TERMINAL');
      }
  };

  const [externalCommand, setExternalCommand] = useState<string | null>(null);

  // Clear external command after processing
  useEffect(() => {
      if (externalCommand) {
          const timer = setTimeout(() => setExternalCommand(null), 100);
          return () => clearTimeout(timer);
      }
  }, [externalCommand]);


  const handleCommandExecuted = (cmd: string, output: TerminalOutput) => {
    chapter.exercises.forEach(ex => {
        if (completedExercises.has(ex.id)) return;

        if (ex.validationType === 'command_success') {
            if (cmd.trim() === ex.validationValue && output.type !== 'error') {
                setCompletedExercises(prev => new Set(prev).add(ex.id));
            }
        }
    });
  };

  // Effect to check FS-based objectives whenever FS or CWD changes
  useEffect(() => {
      chapter.exercises.forEach(ex => {
          if (completedExercises.has(ex.id)) return;
          
          if (ex.validationType === 'file_exists' || ex.validationType === 'dir_exists') {
              if (getNode(fs, ex.validationValue)) {
                  setCompletedExercises(prev => new Set(prev).add(ex.id));
              }
          }
          
          if (ex.validationType === 'cwd_check') {
              if (cwd === ex.validationValue) {
                  setCompletedExercises(prev => new Set(prev).add(ex.id));
              }
          }

          if (ex.validationType === 'file_content') {
              const [path, contentMatch] = ex.validationValue.split(':');
              const node = getNode(fs, path);
              if (node && node.type === 'file' && node.content && node.content.includes(contentMatch)) {
                  setCompletedExercises(prev => new Set(prev).add(ex.id));
              }
          }
      });
  }, [fs, cwd, chapter.exercises, completedExercises]);


  return (
    <div className="flex flex-col md:flex-row h-full border border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-900 relative">
      
      {/* Mobile Toggle Header (Visible only on small screens) */}
      <div className="md:hidden bg-slate-950 border-b border-slate-800 flex p-1">
          <button 
            onClick={() => setMobileView('CONTENT')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${
                mobileView === 'CONTENT' ? 'bg-slate-800 text-white' : 'text-slate-500'
            }`}
          >
              <Book size={16} />
              Contenu
          </button>
          <button 
            onClick={() => setMobileView('TERMINAL')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${
                mobileView === 'TERMINAL' ? 'bg-slate-800 text-white' : 'text-slate-500'
            }`}
          >
              <Monitor size={16} />
              Terminal
          </button>
      </div>

      {/* Left Panel: Content (Course/Exos) - Hidden on mobile if Terminal view selected */}
      <div className={`w-full md:w-1/2 flex flex-col border-r border-slate-800 h-full ${mobileView === 'TERMINAL' ? 'hidden md:flex' : 'flex'}`}>
        {/* Tabs Header - VS Code Style */}
        <div className="flex border-b border-slate-800 bg-slate-950 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('COURSE')}
            className={`px-4 md:px-6 py-3 text-xs font-bold flex items-center justify-center gap-2 border-t-2 transition-colors whitespace-nowrap ${
              activeTab === 'COURSE' 
                ? 'border-blue-500 bg-slate-900 text-blue-400' 
                : 'border-transparent bg-slate-950 text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
            }`}
          >
            <BookOpen size={14} />
            COURS
          </button>
          <button
            onClick={() => setActiveTab('VISUALS')}
            className={`px-4 md:px-6 py-3 text-xs font-bold flex items-center justify-center gap-2 border-t-2 transition-colors whitespace-nowrap ${
              activeTab === 'VISUALS' 
                ? 'border-purple-500 bg-slate-900 text-purple-400' 
                : 'border-transparent bg-slate-950 text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
            }`}
          >
            <Layout size={14} />
            VISUEL
          </button>
          
          {/* Specialized IDE Tab for Chapter 6 */}
          {chapter.id === 'chap6' && (
              <button
                onClick={() => setActiveTab('IDE')}
                className={`px-4 md:px-6 py-3 text-xs font-bold flex items-center justify-center gap-2 border-t-2 transition-colors whitespace-nowrap ${
                  activeTab === 'IDE' 
                    ? 'border-amber-500 bg-slate-900 text-amber-400' 
                    : 'border-transparent bg-slate-950 text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
                }`}
              >
                <Code size={14} />
                LABO
              </button>
          )}

          <button
            onClick={() => setActiveTab('EXERCISES')}
            className={`px-4 md:px-6 py-3 text-xs font-bold flex items-center justify-center gap-2 border-t-2 transition-colors whitespace-nowrap ${
              activeTab === 'EXERCISES' 
                ? 'border-emerald-500 bg-slate-900 text-emerald-400' 
                : 'border-transparent bg-slate-950 text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
            }`}
          >
            <CheckSquare size={14} />
            EXOS
            {completedExercises.size > 0 && (
                <span className="ml-2 bg-emerald-900/50 text-emerald-400 px-1.5 rounded text-[10px]">
                    {completedExercises.size}/{chapter.exercises.length}
                </span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900 scrollbar-thin pb-20 md:pb-6">
          {activeTab === 'COURSE' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="mb-6 pb-4 border-b border-slate-800">
                    <h2 className="text-2xl font-bold text-slate-100 mb-2">{chapter.title}</h2>
                    <p className="text-slate-400 leading-relaxed">{chapter.description}</p>
                </div>
              {chapter.lessons.map((lesson, idx) => (
                <div key={idx} className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/20">
                        {idx + 1}
                    </span>
                    {lesson.title}
                  </h3>
                  <ul className="space-y-3 mb-5">
                    {lesson.content.map((point, i) => (
                      <li key={i} className="text-slate-400 text-sm leading-relaxed flex items-start gap-3">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0"></span>
                        <span dangerouslySetInnerHTML={{__html: point.replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono text-xs border border-slate-700">$1</code>')}}></span>
                      </li>
                    ))}
                  </ul>
                  {lesson.code && (
                    <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden group relative">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">BASH</span>
                        </div>
                        <div className="p-4 overflow-x-auto">
                            <pre className="text-xs font-mono text-blue-300 whitespace-pre-wrap">{lesson.code}</pre>
                        </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'VISUALS' && (
             <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-right-2 duration-300">
                {chapter.id === 'chap5' && <PermissionVisualizer />}
                <div className="flex-1 flex flex-col min-h-[400px]">
                    <FileSystemVisualizer root={fs} />
                </div>
             </div>
          )}

          {activeTab === 'IDE' && (
              <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-2 duration-300">
                  <div className="flex-1 min-h-0 flex flex-col mb-4">
                      <div className="mb-2 flex justify-between items-end">
                          <div>
                            <h3 className="font-bold text-slate-200">Éditeur de Script</h3>
                            <p className="text-slate-500 text-xs">Écrivez votre script et cliquez sur Run.</p>
                          </div>
                      </div>
                      <CodeEditor 
                        fs={fs}
                        setFs={setFs}
                        cwd={cwd}
                        onRun={handleEditorRun}
                      />
                  </div>
                  <div className="h-1/3 min-h-[200px] border-t border-slate-800 pt-4 overflow-y-auto">
                      <h3 className="font-bold text-amber-500 mb-3 px-1 text-sm uppercase tracking-wider">Tâches à réaliser</h3>
                      <div className="space-y-3">
                          {chapter.exercises.map((ex, idx) => {
                            const isCompleted = completedExercises.has(ex.id);
                            return (
                              <div 
                                key={ex.id} 
                                className={`p-3 rounded-lg border transition-all duration-300 ${
                                    isCompleted 
                                    ? 'bg-emerald-900/20 border-emerald-500/30 shadow-sm' 
                                    : 'bg-slate-950 border-slate-800'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                        isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'
                                    }`}>
                                        {isCompleted ? <CheckCircle size={12} /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm ${isCompleted ? 'text-emerald-400 font-medium' : 'text-slate-300'}`}>
                                            {ex.question}
                                        </p>
                                        {!isCompleted && (
                                            <ExerciseHint hint={ex.hint} compact={true} />
                                        )}
                                    </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'EXERCISES' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="bg-emerald-900/20 border border-emerald-500/20 p-4 rounded-xl mb-6">
                    <h3 className="font-bold text-emerald-400 mb-1 text-sm uppercase tracking-wider flex items-center gap-2">
                        <TerminalIcon size={16} />
                        Mode Interactif
                    </h3>
                    <p className="text-emerald-200/70 text-sm">
                        Utilisez le terminal pour compléter ces exercices.
                        <span className="md:hidden block mt-1 text-xs text-emerald-400/60">
                            (Cliquez sur "Terminal" en haut pour y accéder)
                        </span>
                    </p>
                </div>
              {chapter.exercises.map((ex, idx) => {
                const isCompleted = completedExercises.has(ex.id);
                return (
                  <div 
                    key={ex.id} 
                    className={`p-5 rounded-xl border transition-all duration-300 ${
                        isCompleted 
                        ? 'bg-emerald-900/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                        : 'bg-slate-950 border-slate-800 hover:border-blue-500/30 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                            isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}>
                            {isCompleted ? <CheckCircle size={14} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                        </div>
                        <div className="flex-1">
                            <p className={`font-medium ${isCompleted ? 'text-emerald-400' : 'text-slate-200'}`}>
                                {ex.question}
                            </p>
                            {!isCompleted && (
                                <ExerciseHint hint={ex.hint} />
                            )}
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Terminal (Hidden on mobile if Content view selected) */}
      <div className={`w-full md:w-1/2 bg-slate-950 relative border-l border-slate-800 h-full ${mobileView === 'CONTENT' ? 'hidden md:block' : 'block'}`}>
        {/* Background decoration for Terminal */}
        <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
            <div className="flex gap-2">
                <div className="w-32 h-32 rounded-full bg-blue-500 blur-[80px]"></div>
            </div>
        </div>
        
        {/* Terminal with support for external commands */}
        <TerminalWrapper 
            fs={fs}
            setFs={setFs}
            history={history}
            setHistory={setHistory}
            cwd={cwd}
            setCwd={setCwd}
            onCommandExecuted={handleCommandExecuted}
            externalCommand={externalCommand}
        />
      </div>
    </div>
  );
};

// Tiny wrapper to handle the effect of receiving a command from the editor
const TerminalWrapper: React.FC<any> = ({ externalCommand, ...props }) => {
    useEffect(() => {
        if (externalCommand) {
            const cmd = externalCommand;
            // Add to history
            const cmdEntry = { id: Date.now().toString(), type: 'command', content: cmd, cwd: props.cwd };
            
            // Execute
            const result = executeCommand(cmd, props.cwd, props.fs, props.setFs);
            
            const newHistory = [...props.history, cmdEntry];
            if (result.content || result.type === 'error') {
                newHistory.push(result);
            }
            props.setHistory(newHistory);
            
            if (result.cwd) {
                props.setCwd(result.cwd);
            }
            
            if (props.onCommandExecuted) {
                props.onCommandExecuted(cmd, result);
            }
        }
    }, [externalCommand]);

    return <Terminal {...props} />;
}

export default ChapterView;