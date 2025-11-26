import React from 'react';
import { Star } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-slate-900 p-6 rounded-xl text-white max-w-sm text-center">
        <Star className="mx-auto text-yellow-400 mb-4"/>
        <h2 className="text-xl font-bold">Versão Premium</h2>
        <p className="mb-4">Desbloqueie recursos avançados.</p>
        <button onClick={onClose} className="bg-slate-700 px-4 py-2 rounded">Fechar</button>
      </div>
    </div>
  );
};
export default PremiumModal;