import React from 'react';
import { Terminal, List, LayoutDashboard, ChevronRight, FolderOpen, X } from 'lucide-react';
import { View } from '../types';
import { CHAPTERS } from '../data';

interface SidebarProps {
  currentView: View;
  currentChapterId?: string;
  onChangeView: (view: View, chapterId?: string) => void;
  isOpen: boolean;
  onClose: () => void;
  completedExercises: Set<string>;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, currentChapterId, onChangeView, isOpen, onClose, completedExercises }) => {
  return (
    <>
        {/* Backdrop for mobile */}
        <div 
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
                isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={onClose}
        />

        {/* Sidebar Container */}
        <div className={`
            fixed md:fixed top-0 left-0 h-full w-64 bg-slate-950/95 backdrop-blur-xl border-r border-slate-800 
            z-50 shadow-2xl transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}>
        <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)] border border-blue-400/30">
                <Terminal size={20} className="text-white" />
                </div>
                <div>
                <h1 className="font-bold text-slate-100 text-lg leading-tight tracking-tight">SysAdmin 101</h1>
                <p className="text-xs text-blue-400 font-mono">Module R1.04</p>
                </div>
            </div>
            <button onClick={onClose} className="md:hidden text-slate-500 hover:text-white">
                <X size={20} />
            </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-8 overflow-y-auto scrollbar-thin h-[calc(100vh-140px)]">
            <div className="space-y-2">
                <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Principal</div>
                <button
                    onClick={() => onChangeView(View.DASHBOARD)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm border ${
                    currentView === View.DASHBOARD 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                        : 'border-transparent hover:bg-slate-900 hover:text-slate-200'
                    }`}
                >
                    <LayoutDashboard size={18} />
                    <span className="font-medium">Tableau de bord</span>
                </button>
            </div>

            <div className="space-y-2">
                <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Chapitres</div>
                {CHAPTERS.map(chapter => {
                    const isActive = currentView === View.CHAPTER && currentChapterId === chapter.id;
                    const completedCount = chapter.exercises.filter(ex => completedExercises.has(ex.id)).length;
                    const total = chapter.exercises.length;
                    const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

                    return (
                        <button
                        key={chapter.id}
                        onClick={() => onChangeView(View.CHAPTER, chapter.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 text-sm group border ${
                        isActive
                            ? 'bg-slate-800 text-white border-slate-700 shadow-inner' 
                            : 'border-transparent hover:bg-slate-900 hover:text-slate-200'
                        }`}
                    >
                        <div className="flex items-center gap-3 truncate">
                            <FolderOpen size={18} className={`shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                            <span className={`font-medium truncate ${isActive ? 'text-blue-100' : ''}`}>{chapter.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {percent > 0 && (
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                    percent === 100 
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                                }`}>
                                    {percent}%
                                </span>
                            )}
                            {isActive && <ChevronRight size={14} className="text-blue-500 shrink-0" />}
                        </div>
                    </button>
                    );
                })}
            </div>

            <div className="space-y-2">
                <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Ressources</div>
                <button
                    onClick={() => onChangeView(View.CHEATSHEET)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm border ${
                    currentView === View.CHEATSHEET 
                        ? 'bg-slate-800 text-white border-slate-700' 
                        : 'border-transparent hover:bg-slate-900 hover:text-slate-200'
                    }`}
                >
                    <List size={18} />
                    <span className="font-medium">Aide-mémoire</span>
                </button>
            </div>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50 absolute bottom-0 w-full">
            <div className="flex items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="text-[10px] text-slate-500 font-mono">
                Système en ligne
                </div>
            </div>
        </div>
        </div>
    </>
  );
};

export default Sidebar;