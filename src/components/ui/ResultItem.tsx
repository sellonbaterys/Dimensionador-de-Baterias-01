import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ResultItemProps {
  icon: LucideIcon;
  title: string;
  value: string;
  description: string;
  highlight?: boolean;
}

const ResultItem: React.FC<ResultItemProps> = ({ icon: Icon, title, value, description, highlight }) => (
    <div className={`flex flex-col p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl h-full justify-between ${highlight ? 'border-green-500/30 bg-gradient-to-br from-green-900/20 to-slate-900/40 shadow-[0_0_20px_rgba(74,222,128,0.05)]' : 'border-white/5 bg-slate-900/40 hover:bg-slate-800/60'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${highlight ? 'bg-green-500 text-slate-900 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-slate-800 text-slate-400 border border-white/5'}`}>
          <Icon className="w-6 h-6" />
        </div>
        {highlight && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <p className={`text-2xl lg:text-3xl font-black tracking-tight mb-2 ${highlight ? 'text-white' : 'text-slate-200'}`}>{value}</p>
        <p className={`text-xs font-medium border-t pt-3 ${highlight ? 'text-green-400 border-green-500/20' : 'text-slate-500 border-white/5'}`}>{description}</p>
      </div>
    </div>
);
export default ResultItem;