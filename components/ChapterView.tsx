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
  completedExercises: Set<string>;
  onCompleteExercise: (id: string) => void;
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

const ChapterView: React.FC<ChapterViewProps> = ({ chapter, completedExercises, onCompleteExercise }) => {
  const [activeTab, setActiveTab] = useState<Tab>('COURSE');
  const [mobileView, setMobileView] = useState<MobileTab>('CONTENT');

  // Terminal State
  const [fs, setFs] = useState<FileSystemNode>(chapter.initialFileSystem);
  const [history, setHistory] = useState<TerminalOutput[]>([]);
  const [cwd, setCwd] = useState<string>('/home/etudiant');
  const [externalCommand, setExternalCommand] = useState<string | null>(null);

  // Ref to store the last executed command context for validation
  const lastCommandRef = React.useRef<{ cmd: string, output: TerminalOutput | null }>({ cmd: '', output: null });

  // Calc progress for current chapter
  const currentChapterCompleted = chapter.exercises.filter(ex => completedExercises.has(ex.id)).length;
  const currentChapterTotal = chapter.exercises.length;
  const progressPercent = currentChapterTotal === 0 ? 0 : (currentChapterCompleted / currentChapterTotal) * 100;

  // Reset state when chapter changes (except completion which is passed as prop)
  useEffect(() => {
    setFs(JSON.parse(JSON.stringify(chapter.initialFileSystem)));
    setHistory([]);
    setCwd('/home/etudiant');
    setActiveTab('COURSE');
    setMobileView('CONTENT');
    lastCommandRef.current = { cmd: '', output: null };
  }, [chapter.id]);

  // Clear external command after processing
  useEffect(() => {
    if (externalCommand) {
      const timer = setTimeout(() => setExternalCommand(null), 100);
      return () => clearTimeout(timer);
    }
  }, [externalCommand]);

  const checkExerciseCompletion = (ex: Exercise, cmd: string = '', output: TerminalOutput | null = null) => {
    // Split by || to support multiple valid scenarios (OR logic)
    const scenarios = ex.validationValue.split('||');

    // Check if ANY scenario is valid
    const isComplete = scenarios.some(scenario => {
      const parts = scenario.split('|');
      // Store values as arrays to support multiple checks of same type (e.g. multiple files)
      const checks: Record<string, string[]> = {};

      // Parse validation format: "cmd:value|file:value|output:value"
      parts.forEach(part => {
        const firstColon = part.indexOf(':');
        if (firstColon !== -1) {
          const key = part.substring(0, firstColon);
          const value = part.substring(firstColon + 1);
          if (!checks[key]) {
            checks[key] = [];
          }
          checks[key].push(value);
        }
      });

      // 1. Check command keyword if specified (Simple includes)
      if (checks.cmd) {
        for (const cmdCheck of checks.cmd) {
          if (!cmd.toLowerCase().includes(cmdCheck.toLowerCase())) return false;
        }
      }

      // 2. Check exact command if specified
      if (checks.exactCmd) {
        for (const exactCmdCheck of checks.exactCmd) {
          if (cmd.trim() !== exactCmdCheck) return false;
        }
      }

      // 3. Check Regex command if specified
      if (checks.regexCmd) {
        for (const regexCmdCheck of checks.regexCmd) {
          try {
            const regex = new RegExp(regexCmdCheck);
            if (!regex.test(cmd.trim())) return false;
          } catch (e) {
            console.error("Invalid regex in exercise validation:", regexCmdCheck);
            return false;
          }
        }
      }

      // 4. Check output if specified
      if (checks.output) {
        for (const outputCheck of checks.output) {
          // FIXED: Allow validation even if output type is 'error', as long as content matches
          if (!output || !output.content.includes(outputCheck)) {
            return false;
          }
        }
      }

      // 5. Check file existence/properties if specified
      const fileChecks = [...(checks.file || []), ...(checks.dir || [])];
      for (const pathToCheck of fileChecks) {
        // Handle relative paths in validation by resolving against CWD if needed, 
        // but usually validation paths are absolute for reliability.
        // If it starts with /, it's absolute.
        const resolvedPath = pathToCheck.startsWith('/') ? pathToCheck : resolvePath(cwd, pathToCheck);

        const node = getNode(fs, resolvedPath);
        if (!node) return false;

        // Check type if specified explicitly OR implied by key (file vs dir)
        // If it came from 'dir' key, it MUST be a directory
        if (checks.dir && checks.dir.includes(pathToCheck)) {
          if (node.type !== 'directory') return false;
        }
        // If it came from 'file' key, it MUST be a file
        if (checks.file && checks.file.includes(pathToCheck)) {
          if (node.type !== 'file') return false;
        }

        // Check content if specified
        if (checks.content) {
          for (const contentCheck of checks.content) {
            if (node.type !== 'file' || !node.content) return false;

            // Support regex content check if value starts with regex:
            if (contentCheck.startsWith('regex:')) {
              try {
                const regexStr = contentCheck.substring(6);
                const regex = new RegExp(regexStr);
                if (!regex.test(node.content)) return false;
              } catch (e) {
                // Fallback to normal include if regex fails
                if (!node.content.includes(contentCheck)) return false;
              }
            } else {
              if (!node.content.includes(contentCheck)) return false;
            }
          }
        }

        // Check permissions if specified
        if (checks.perms) {
          for (const permsCheck of checks.perms) {
            if (node.permissions !== permsCheck) return false;
          }
        }
      }

      // 6. Check file is missing if specified
      if (checks.missing) {
        for (const missingCheck of checks.missing) {
          if (getNode(fs, missingCheck)) return false;
        }
      }

      // 7. Check current directory if specified
      if (checks.cwd) {
        for (const cwdCheck of checks.cwd) {
          // Allow checking if we are INSIDE a dir (startsWith) or exact match
          if (cwdCheck.endsWith('*')) {
            const baseCwd = cwdCheck.slice(0, -1);
            if (!cwd.startsWith(baseCwd)) return false;
          } else {
            if (cwd !== cwdCheck) return false;
          }
        }
      }

      // All checks in this scenario passed
      return true;
    });

    if (isComplete) {
      onCompleteExercise(ex.id);
    }
  };

  const handleCommandExecuted = (cmd: string, output: TerminalOutput) => {
    // Update ref with latest command context
    lastCommandRef.current = { cmd, output };

    // Find the first uncompleted exercise
    const firstUncompleted = chapter.exercises.find(ex => !completedExercises.has(ex.id));

    if (firstUncompleted) {
      checkExerciseCompletion(firstUncompleted, cmd, output);
    }
  };

  // Execute command from Editor
  const handleEditorRun = (cmd: string) => {
    // This simulates typing the command in the terminal
    setExternalCommand(cmd);
    // On mobile, switch to terminal view to see output
    if (window.innerWidth < 768) {
      setMobileView('TERMINAL');
    }
  };

  // Effect to check FS-based objectives whenever FS or CWD changes
  useEffect(() => {
    // Find the first uncompleted exercise
    const firstUncompleted = chapter.exercises.find(ex => !completedExercises.has(ex.id));

    if (firstUncompleted) {
      // Use the last executed command context for validation
      checkExerciseCompletion(firstUncompleted, lastCommandRef.current.cmd, lastCommandRef.current.output);
    }
  }, [fs, cwd, chapter.exercises, completedExercises, onCompleteExercise]);

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[600px] md:min-h-[700px] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-900 relative">

      {/* Mobile Toggle Header (Visible only on small screens) */}
      <div className="md:hidden bg-slate-950 border-b border-slate-800 flex p-1 shrink-0">
        <button
          onClick={() => setMobileView('CONTENT')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${mobileView === 'CONTENT' ? 'bg-slate-800 text-white' : 'text-slate-500'
            }`}
        >
          <Book size={16} />
          Contenu
        </button>
        <button
          onClick={() => setMobileView('TERMINAL')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${mobileView === 'TERMINAL' ? 'bg-slate-800 text-white' : 'text-slate-500'
            }`}
        >
          <Monitor size={16} />
          Terminal
        </button>
      </div>

      {/* Left Panel: Content (Course/Exos) - Hidden on mobile if Terminal view selected */}
      <div className={`w-full md:w-1/2 flex flex-col border-r border-slate-800 h-full ${mobileView === 'TERMINAL' ? 'hidden md:flex' : 'flex'}`}>
        {/* Tabs Header - VS Code Style */}
        <div className="flex border-b border-slate-800 bg-slate-950 overflow-x-auto scrollbar-hide shrink-0">
          <button
            onClick={() => setActiveTab('COURSE')}
            className={`px-4 md:px-6 py-3 text-xs font-bold flex items-center justify-center gap-2 border-t-2 transition-colors whitespace-nowrap ${activeTab === 'COURSE'
              ? 'border-blue-500 bg-slate-900 text-blue-400'
              : 'border-transparent bg-slate-950 text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
              }`}
          >
            <BookOpen size={14} />
            COURS
          </button>
          <button
            onClick={() => setActiveTab('VISUALS')}
            className={`px-4 md:px-6 py-3 text-xs font-bold flex items-center justify-center gap-2 border-t-2 transition-colors whitespace-nowrap ${activeTab === 'VISUALS'
              ? 'border-purple-500 bg-slate-900 text-purple-400'
              : 'border-transparent bg-slate-950 text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
              }`}
          >
            <Layout size={14} />
            {chapter.id === 'chap5' ? 'VISUEL/CALCULATEUR' : 'VISUEL'}
          </button>

          {/* Specialized IDE Tab for Chapter 6 AND 8 */}
          {(chapter.id === 'chap6' || chapter.id === 'chap8') && (
            <button
              onClick={() => setActiveTab('IDE')}
              className={`px-4 md:px-6 py-3 text-xs font-bold flex items-center justify-center gap-2 border-t-2 transition-colors whitespace-nowrap ${activeTab === 'IDE'
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
            className={`px-4 md:px-6 py-3 text-xs font-bold flex items-center justify-center gap-2 border-t-2 transition-colors whitespace-nowrap ${activeTab === 'EXERCISES'
              ? 'border-emerald-500 bg-slate-900 text-emerald-400'
              : 'border-transparent bg-slate-950 text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
              }`}
          >
            <CheckSquare size={14} />
            EXOS
            {currentChapterCompleted > 0 && (
              <span className="ml-2 bg-emerald-900/50 text-emerald-400 px-1.5 rounded text-[10px]">
                {currentChapterCompleted}/{currentChapterTotal}
              </span>
            )}
          </button>
        </div>

        {/* Global Progress Bar (Slim) */}
        <div className="h-1 w-full bg-slate-950 border-b border-slate-800 shrink-0">
          <div
            className={`h-full transition-all duration-500 ease-out ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900 scrollbar-thin pb-20 md:pb-6">
          {activeTab === 'COURSE' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="mb-6 pb-4 border-b border-slate-800">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-slate-100">{chapter.title}</h2>
                  {progressPercent === 100 && (
                    <div className="flex items-center gap-2 bg-emerald-900/30 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-500/30">
                      <CheckCircle size={14} />
                      Terminé
                    </div>
                  )}
                </div>

                {/* Progress Section */}
                <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 mb-6 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-400 flex items-center gap-2">
                      <CheckSquare size={16} className="text-blue-500" />
                      Progression des exercices
                    </span>
                    <span className="text-sm font-bold text-blue-400">{progressPercent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
                    <div
                      className={`h-full transition-all duration-500 ease-out ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {currentChapterCompleted} sur {currentChapterTotal} exercices validés.
                  </p>
                </div>

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
                        <span dangerouslySetInnerHTML={{ __html: point.replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono text-xs border border-slate-700">$1</code>') }}></span>
                      </li>
                    ))}
                  </ul>
                  {lesson.code && (
                    <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden group relative">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">BASH</span>
                      </div>
                      <div className="p-3 overflow-x-auto">
                        <pre className="text-sm font-mono text-blue-300 whitespace-pre">{lesson.code}</pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'VISUALS' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300 flex flex-col min-h-full">
              {chapter.id === 'chap5' && <PermissionVisualizer />}
              <div className="flex-1 min-h-[400px]">
                <FileSystemVisualizer root={fs} />
              </div>
            </div>
          )}

          {activeTab === 'IDE' && (
            <div className="flex flex-col h-full gap-4 animate-in zoom-in-95 duration-200">
              {/* Editor takes up 60% of available vertical space */}
              <div className="flex-1 min-h-[50%]">
                <CodeEditor
                  fs={fs}
                  setFs={setFs}
                  cwd={cwd}
                  onRun={handleEditorRun}
                />
              </div>

              {/* Exercises List Compact View - Takes remaining space */}
              <div className="flex-1 min-h-[30%] bg-slate-950 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 shrink-0 flex items-center justify-between">
                  <h3 className="font-bold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-2">
                    <CheckSquare size={14} className="text-emerald-500" />
                    Exercices à réaliser
                  </h3>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                    {currentChapterCompleted}/{currentChapterTotal}
                  </span>
                </div>
                <div className="p-3 overflow-y-auto scrollbar-thin space-y-3">
                  {chapter.exercises.map((exercise, index) => {
                    const isCompleted = completedExercises.has(exercise.id);
                    // Sort: incomplete first
                    if (isCompleted && chapter.exercises.some(e => !completedExercises.has(e.id))) return null;

                    return (
                      <div
                        key={exercise.id}
                        className={`p-3 rounded-lg border transition-all ${isCompleted
                          ? 'bg-emerald-900/10 border-emerald-500/20 opacity-60'
                          : 'bg-slate-900/50 border-slate-800'
                          }`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}>
                            {isCompleted ? <CheckCircle size={12} /> : index + 1}
                          </div>
                          <div className="flex-1">
                            <p className={`text-xs font-medium leading-relaxed ${isCompleted ? 'text-slate-500' : 'text-slate-300'}`}>
                              {exercise.question.split('`').map((part, i) =>
                                i % 2 === 1
                                  ? <code key={i} className="bg-slate-950 px-1 py-0.5 rounded text-blue-300 font-mono text-[10px] border border-slate-800 mx-0.5">{part}</code>
                                  : part
                              )}
                            </p>
                            {!isCompleted && <ExerciseHint hint={exercise.hint} compact={true} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Show message if all hidden (all done) */}
                  {currentChapterCompleted > 0 && currentChapterCompleted < currentChapterTotal && (
                    <div className="text-center py-2 text-[10px] text-slate-600 italic">
                      Exercices terminés masqués
                    </div>
                  )}
                  {currentChapterCompleted === currentChapterTotal && (
                    <div className="flex flex-col items-center justify-center py-4 text-emerald-500 gap-2">
                      <CheckCircle size={24} />
                      <span className="text-sm font-bold">Tous les exercices validés !</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'EXERCISES' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <CheckSquare className="text-emerald-500" />
                  Exercices Pratiques
                </h3>
                <span className="text-xs bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 font-medium">
                  {currentChapterCompleted} / {currentChapterTotal} complétés
                </span>
              </div>

              <div className="grid gap-4">
                {chapter.exercises.map((exercise, index) => {
                  const isCompleted = completedExercises.has(exercise.id);
                  // Basic logic to determine if this exercise is "locked"
                  // It is locked if it is NOT completed AND the previous one is NOT completed
                  // Exception: index 0 is never locked.
                  const isLocked = !isCompleted && index > 0 && !completedExercises.has(chapter.exercises[index - 1].id);

                  return (
                    <div
                      key={exercise.id}
                      className={`p-5 rounded-xl border transition-all duration-300 ${isCompleted
                        ? 'bg-emerald-900/10 border-emerald-500/30'
                        : isLocked
                          ? 'bg-slate-950/30 border-slate-800/50 opacity-50'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${isCompleted
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                          : 'bg-slate-800 text-slate-500'
                          }`}>
                          {isCompleted ? <CheckCircle size={18} /> : index + 1}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className={`text-sm font-medium leading-relaxed ${isCompleted ? 'text-slate-400' : 'text-slate-200'}`}>
                            {exercise.question.split('`').map((part, i) =>
                              i % 2 === 1
                                ? <code key={i} className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono text-xs border border-slate-700 mx-0.5">{part}</code>
                                : part
                            )}
                          </p>

                          {!isLocked && <ExerciseHint hint={exercise.hint} />}

                          {isCompleted && (
                            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded border border-emerald-500/20">
                              <CheckCircle size={12} /> Validé
                            </div>
                          )}

                          {isLocked && (
                            <div className="mt-2 text-xs text-slate-600 italic">
                              Terminez l'exercice précédent pour débloquer.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Terminal - Hidden on mobile if Content view selected */}
      <div className={`w-full md:w-1/2 bg-slate-950 flex flex-col h-full ${mobileView === 'CONTENT' ? 'hidden md:flex' : 'flex'}`}>
        {/* Terminal Header */}
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <TerminalIcon size={16} className="text-slate-400" />
            <span className="font-bold text-slate-300 text-sm">Terminal Linux</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 border border-slate-700">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] text-slate-400 font-mono">bash 5.1</span>
            </div>
          </div>
        </div>

        {/* Terminal Component */}
        <div className="flex-1 overflow-hidden relative">
          <Terminal
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
    </div>
  );
};

export default ChapterView;