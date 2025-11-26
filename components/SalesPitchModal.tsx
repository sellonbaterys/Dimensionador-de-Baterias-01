import React from 'react';
import { X, Zap } from 'lucide-react';

interface SalesPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SalesPitchModal: React.FC<SalesPitchModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60]">
      <div className="bg-slate-900 border border-green-500 p-8 rounded-2xl max-w-md text-center relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-white"><X/></button>
        <Zap className="mx-auto text-green-500 mb-4" size={40}/>
        <h2 className="text-2xl font-bold text-white mb-2">Baterias são o Futuro</h2>
        <p className="text-slate-400 mb-6">Venda segurança e não apenas economia.</p>
        <button onClick={onClose} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold">Ver Projeto</button>
      </div>
    </div>
  );
};
export default SalesPitchModal;