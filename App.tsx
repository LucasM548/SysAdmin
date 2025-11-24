import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AiTutor from './components/AiTutor';
import ChapterView from './components/ChapterView';
import { CHAPTERS, CHEAT_SHEET } from './data';
import { View } from './types';
import { Search, ArrowRight, FolderOpen, List, Terminal, Menu, Trash2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [currentChapterId, setCurrentChapterId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Persistence: Load completed exercises from localStorage
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(() => {
    try {
        const saved = localStorage.getItem('sysadmin101_progress');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
        return new Set();
    }
  });

  const handleExerciseComplete = (exerciseId: string) => {
    setCompletedExercises(prev => {
        const newSet = new Set(prev);
        if (!newSet.has(exerciseId)) {
            newSet.add(exerciseId);
            localStorage.setItem('sysadmin101_progress', JSON.stringify(Array.from(newSet)));
        }
        return newSet;
    });
  };

  const handleResetProgress = () => {
    if (confirm("Voulez-vous vraiment réinitialiser toute votre progression ?")) {
        setCompletedExercises(new Set());
        localStorage.removeItem('sysadmin101_progress');
    }
  };

  const handleViewChange = (view: View, chapterId?: string) => {
      setCurrentView(view);
      setCurrentChapterId(chapterId);
      setIsSidebarOpen(false); // Close sidebar on selection (mobile UX)
  };

  const filteredCheatsheet = CHEAT_SHEET.filter(cmd =>
    cmd.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900/80 via-indigo-900/80 to-slate-900/80 border border-blue-500/20 rounded-3xl p-6 md:p-8 text-white shadow-2xl shadow-blue-900/10 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>
        <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-md border border-blue-400/20 px-3 py-1 rounded-full text-xs font-bold mb-6 text-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                v2.2 • Progression Sauvegardée
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">
              Maîtrisez l'Administration <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Système Linux</span>
            </h2>
            <p className="text-slate-300 max-w-2xl text-base md:text-lg mb-8 leading-relaxed font-light">
            Bienvenue dans le module R1.04. Cette plateforme interactive intègre un terminal Linux simulé directement dans votre navigateur. 
            Votre progression est automatiquement sauvegardée.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
            <button 
                onClick={() => handleViewChange(View.CHAPTER, CHAPTERS[0].id)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group border border-blue-500/50"
            >
                Commencer Chapitre 1
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
                onClick={() => handleViewChange(View.TUTOR)}
                className="bg-slate-800/50 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors backdrop-blur-sm border border-slate-700 hover:border-slate-600"
            >
                Demander au Tuteur IA
            </button>
            </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div>
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-200 flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                    <FolderOpen className="text-blue-400" size={20} />
                </div>
                Chapitres Disponibles
            </h3>
            {completedExercises.size > 0 && (
                <button 
                    onClick={handleResetProgress}
                    className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                    <Trash2 size={12} />
                    Réinitialiser progression
                </button>
            )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CHAPTERS.map((chapter, idx) => {
                const totalEx = chapter.exercises.length;
                const completedCount = chapter.exercises.filter(ex => completedExercises.has(ex.id)).length;
                const percent = totalEx === 0 ? 0 : Math.round((completedCount / totalEx) * 100);

                return (
                <div 
                    key={chapter.id}
                    onClick={() => handleViewChange(View.CHAPTER, chapter.id)}
                    className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="relative z-10 flex-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-colors border ${
                                percent === 100 
                                ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/30' 
                                : 'bg-slate-800 text-slate-400 border-slate-700 group-hover:border-blue-500/30 group-hover:bg-blue-900/30 group-hover:text-blue-400'
                            }`}>
                                {idx + 1}
                            </div>
                            <span className="text-xs font-medium bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">
                                {chapter.lessons.length} Leçons
                            </span>
                        </div>
                        <h4 className="font-bold text-slate-100 text-lg mb-2 group-hover:text-blue-400 transition-colors">{chapter.title}</h4>
                        <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">{chapter.description}</p>
                    </div>

                    <div className="relative z-10 mt-auto">
                        <div className="flex justify-between items-end mb-2">
                             <span className="text-xs text-slate-500 font-medium">{completedCount}/{totalEx} Exercices</span>
                             <span className={`text-xs font-bold ${percent === 100 ? 'text-emerald-400' : 'text-blue-400'}`}>{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-800">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                    percent === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-cyan-400'
                                }`} 
                                style={{width: `${percent}%`}}
                            ></div>
                        </div>
                    </div>
                </div>
            )})}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return renderDashboard();
      
      case View.CHAPTER:
        const chapter = CHAPTERS.find(c => c.id === currentChapterId);
        if (!chapter) return renderDashboard();
        return (
            <ChapterView 
                chapter={chapter} 
                completedExercises={completedExercises}
                onCompleteExercise={handleExerciseComplete}
            />
        );
      
      case View.CHEATSHEET:
        return (
          <div className="animate-in slide-in-from-right-4 duration-500 h-full flex flex-col pb-20 md:pb-0">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-800 border border-slate-700 text-purple-400 rounded-xl shadow-lg shadow-purple-900/10">
                        <List size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-100">Aide-mémoire</h2>
                        <p className="text-slate-400 text-sm">Référence rapide des commandes Bash</p>
                    </div>
                </div>
                <div className="relative group w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Rechercher une commande..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 w-full md:w-72 transition-all"
                    />
                </div>
             </div>
            <div className="bg-slate-900/50 rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex-1 flex flex-col backdrop-blur-sm">
              <div className="overflow-y-auto flex-1 scrollbar-thin">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 md:px-6 py-4 font-semibold text-slate-300 w-32 md:w-48">Commande</th>
                      <th className="px-4 md:px-6 py-4 font-semibold text-slate-300">Description</th>
                      <th className="hidden md:table-cell px-6 py-4 font-semibold text-slate-300 w-1/3">Exemple</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredCheatsheet.map((cmd, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 md:px-6 py-4 align-top md:align-middle">
                          <code className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded font-mono font-bold text-sm border border-purple-500/20 block w-fit">
                            {cmd.command}
                          </code>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-slate-400 text-sm">
                            {cmd.description}
                            <div className="md:hidden mt-2">
                                <code className="text-cyan-300 text-xs font-mono bg-slate-950 px-2 py-1 rounded inline-block border border-slate-800">
                                    {cmd.example}
                                </code>
                            </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4">
                          <code className="text-cyan-300 text-sm font-mono bg-slate-950 px-3 py-1.5 rounded block w-fit border border-slate-800">
                            {cmd.example}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case View.TUTOR:
        return (
            <div className="animate-in slide-in-from-right-4 duration-500 h-full flex flex-col pb-20 md:pb-0">
                <div className="mb-6 shrink-0">
                    <h2 className="text-3xl font-bold text-slate-100">Tuteur Linux IA</h2>
                    <p className="text-slate-400 flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Propulsé par Google Gemini
                    </p>
                </div>
                <AiTutor />
            </div>
        );
      
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans selection:bg-blue-500/30 bg-slate-950">
      <Sidebar 
        currentView={currentView} 
        currentChapterId={currentChapterId} 
        onChangeView={handleViewChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col h-full w-full md:ml-64 relative z-10 transition-all duration-300">
          {/* Mobile Header */}
          <div className="md:hidden h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 shrink-0 sticky top-0 z-20">
              <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-600 rounded-lg">
                    <Terminal size={16} className="text-white" />
                  </div>
                  <span className="font-bold text-slate-100">SysAdmin 101</span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                  <Menu size={24} />
              </button>
          </div>

          <main className="flex-1 p-4 md:p-6 overflow-hidden h-full">
            {renderContent()}
          </main>
      </div>
    </div>
  );
}