import React from 'react';
import { X, Zap, Check, FileText, TrendingUp, ShieldCheck } from 'lucide-react';

interface SalesPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SalesPitchModal: React.FC<SalesPitchModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none"></div>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-20 transition-colors bg-white/5 p-2 rounded-full">
            <X size={20}/>
        </button>

        {/* Left Side: Value Prop (Desktop) */}
        <div className="hidden md:flex flex-col justify-between p-8 w-2/5 bg-slate-800/50 border-r border-white/5 relative">
            <div className="space-y-6 relative z-10">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
                    <Zap className="text-green-400" size={24}/>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white leading-tight">Potencialize suas Vendas</h3>
                    <p className="text-sm text-slate-400 mt-2">Entregue valor real ao seu cliente com dados precisos.</p>
                </div>
            </div>
            <div className="text-xs text-slate-500 mt-auto">
                EnergyExpert Pro ©
            </div>
        </div>

        {/* Right Side: Content */}
        <div className="p-8 md:w-3/5 flex flex-col relative z-10">
            <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black tracking-widest uppercase border border-amber-500/20 mb-3">
                    Recomendação Premium
                </span>
                <h2 className="text-2xl font-bold text-white mb-2">Baterias são o Futuro</h2>
                <p className="text-slate-400 text-sm">Não venda apenas módulos. Venda <span className="text-white font-medium">segurança energética</span> e independência.</p>
            </div>

            <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="bg-green-500/20 p-1.5 rounded-full text-green-400"><TrendingUp size={14}/></div>
                    <span className="text-sm text-slate-200">ROI e Payback detalhados</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="bg-blue-500/20 p-1.5 rounded-full text-blue-400"><FileText size={14}/></div>
                    <span className="text-sm text-slate-200">Proposta Comercial em PDF</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="bg-amber-500/20 p-1.5 rounded-full text-amber-400"><ShieldCheck size={14}/></div>
                    <span className="text-sm text-slate-200">Análise de Cargas Críticas</span>
                </div>
            </div>

            <button 
                onClick={onClose} 
                className="w-full bg-green-500 hover:bg-green-400 text-slate-900 py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all transform hover:-translate-y-1 active:scale-95"
            >
                Ver Projeto Completo
            </button>
        </div>
      </div>
    </div>
  );
};
export default SalesPitchModal;