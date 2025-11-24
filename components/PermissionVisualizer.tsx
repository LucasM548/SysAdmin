import React, { useState } from 'react';
import { Lock, Unlock, ShieldCheck } from 'lucide-react';

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

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden mb-6">
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-bold text-purple-400 flex items-center gap-2 text-sm">
            <ShieldCheck size={16} />
            Calculateur chmod
        </h3>
      </div>
      
      <div className="p-6">
        <div className="flex justify-center gap-8 mb-8">
            <div className="text-center p-4 bg-slate-950 rounded-xl border border-slate-800 min-w-[100px]">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Octal</div>
                <div className="text-3xl font-mono font-bold text-purple-400">{calculateOctal()}</div>
            </div>
            <div className="text-center p-4 bg-slate-950 rounded-xl border border-slate-800 min-w-[140px]">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Symbolique</div>
                <div className="text-3xl font-mono font-bold text-slate-300">-{calculateSymbolic()}</div>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {permissions.map((group, i) => (
            <div key={group.name} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-center font-bold text-slate-400 mb-3 text-xs uppercase tracking-wide">{group.name}</div>
              <div className="flex justify-center gap-2">
                {(['r', 'w', 'x'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => toggle(i, type)}
                    className={`w-8 h-8 rounded flex items-center justify-center font-mono text-sm font-bold transition-all shadow-sm ${
                      group[type] 
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-purple-900/20' 
                        : 'bg-slate-800 text-slate-600 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 bg-slate-950 rounded-lg p-3 text-center border border-slate-800 border-dashed">
            <code className="text-slate-400 font-mono text-sm">
                chmod <span className="text-purple-400">{calculateOctal()}</span> nom_fichier
            </code>
        </div>
      </div>
    </div>
  );
};

export default PermissionVisualizer;