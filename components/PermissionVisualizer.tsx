import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

const PermissionVisualizer: React.FC = () => {
  const [permissions, setPermissions] = useState([
    { name: 'Owner', r: true, w: true, x: true },
    { name: 'Group', r: true, w: false, x: true },
    { name: 'Others', r: true, w: false, x: true },
  ]);

  const toggle = (index: number, type: 'r' | 'w' | 'x') => {
    const newPerms = [...permissions];
    newPerms[index][type] = !newPerms[index][type];
    setPermissions(newPerms);
  };

  const calculateOctal = () => {
    return permissions.map(p => (p.r ? 4 : 0) + (p.w ? 2 : 0) + (p.x ? 1 : 0)).join('');
  };

  const calculateSymbolic = () => {
    return permissions.map(p => `${p.r ? 'r' : '-'}${p.w ? 'w' : '-'}${p.x ? 'x' : '-'}`).join('');
  };

  const getValue = (type: 'r' | 'w' | 'x') => {
      if (type === 'r') return 4;
      if (type === 'w') return 2;
      return 1;
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden mb-6 w-full min-h-[380px]">
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-bold text-purple-400 flex items-center gap-2 text-sm">
            <ShieldCheck size={16} />
            Calculateur chmod
        </h3>
      </div>
      
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-6 sm:mb-8">
            <div className="text-center p-3 sm:p-4 bg-slate-950 rounded-xl border border-slate-800 min-w-[100px] flex-1 sm:flex-none">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Octal</div>
                <div className="text-3xl font-mono font-bold text-purple-400">{calculateOctal()}</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-slate-950 rounded-xl border border-slate-800 min-w-[140px] flex-1 sm:flex-none">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Symbolique</div>
                <div className="text-3xl font-mono font-bold text-slate-300">-{calculateSymbolic()}</div>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {permissions.map((group, i) => {
            const groupSum = (group.r ? 4 : 0) + (group.w ? 2 : 0) + (group.x ? 1 : 0);
            
            return (
              <div key={group.name} className="bg-slate-950 p-3 sm:p-4 rounded-lg border border-slate-800 flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-3 px-1">
                    <span className="font-bold text-slate-400 text-xs uppercase tracking-wide">{group.name}</span>
                    <span className="font-mono text-purple-400 font-bold bg-purple-900/20 px-2 py-0.5 rounded text-xs border border-purple-500/20">
                        = {groupSum}
                    </span>
                </div>
                
                <div className="flex justify-center gap-2">
                  {(['r', 'w', 'x'] as const).map((type) => {
                    const val = getValue(type);
                    const isActive = group[type];
                    
                    return (
                      <div key={type} className="flex flex-col items-center gap-1.5">
                        <button
                          onClick={() => toggle(i, type)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono text-sm font-bold transition-all shadow-sm ${
                            isActive 
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                              : 'bg-slate-800 text-slate-600 border border-slate-700 hover:bg-slate-750'
                          }`}
                        >
                          {type}
                        </button>
                        <span className={`text-[10px] font-mono font-bold transition-colors ${isActive ? 'text-purple-400' : 'text-slate-700'}`}>
                            {val}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 sm:mt-8 bg-slate-950 rounded-lg p-3 text-center border border-slate-800 border-dashed overflow-x-auto">
            <code className="text-slate-400 font-mono text-sm whitespace-nowrap">
                chmod <span className="text-purple-400 font-bold">{calculateOctal()}</span> nom_fichier
            </code>
        </div>
      </div>
    </div>
  );
};

export default PermissionVisualizer;