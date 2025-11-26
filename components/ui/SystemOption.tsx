import React from 'react';
import { Check, LucideIcon } from 'lucide-react';

interface SystemOptionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

const SystemOption: React.FC<SystemOptionProps> = ({ icon: Icon, title, description, isSelected, onClick }) => (
    <div className="flex flex-col items-center group cursor-pointer" onClick={onClick}>
      <div className={`relative w-full aspect-[4/3] rounded-[2rem] border transition-all flex flex-col items-center justify-center overflow-hidden ${isSelected ? 'border-green-400 bg-green-500/10 shadow-[0_0_50px_rgba(74,222,128,0.2)] scale-105' : 'border-white/10 bg-slate-900/40 hover:border-green-500/30'}`}>
        {isSelected && <div className="absolute top-6 right-6 bg-green-500 text-black p-1.5 rounded-full"><Check size={16} /></div>}
        <div className={`relative z-10 p-6 rounded-2xl ${isSelected ? 'bg-green-500 text-black' : 'bg-white/5 text-slate-400 group-hover:text-green-400'}`}>
          <Icon className="w-12 h-12" />
        </div>
        <h4 className="relative z-10 text-2xl font-bold mt-6 text-white">{title}</h4>
      </div>
      <div className="mt-6 px-4 text-center max-w-xs">
        <p className={`text-sm ${isSelected ? 'text-green-300' : 'text-slate-500'}`}>{description}</p>
      </div>
    </div>
);
export default SystemOption;