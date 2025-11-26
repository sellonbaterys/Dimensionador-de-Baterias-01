import React from 'react';
import { Check } from 'lucide-react';
import { SystemType } from '../../types';

interface StepIndicatorProps {
  step: number;
  title: string;
  currentStep: number;
  systemType: SystemType | null;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ step, title, currentStep, systemType }) => {
    let isStepActive = currentStep === step;
    let isStepCompleted = currentStep > step;
    let visualStep = step;

    if (systemType === 'ONG') {
      if (step === 4) return null;
      if (step === 5) visualStep = 4;
      if (step === 6) visualStep = 5;
    }
    if (systemType === 'OFF') {
      if (step === 4) return null;
      if (step === 5) visualStep = 4;
      if (step === 6) visualStep = 5;
    }

    return (
      <div className="flex flex-col items-center relative z-10 w-24">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 ${isStepActive ? 'border-green-400 bg-green-900/20 text-green-400' : isStepCompleted ? 'border-green-600 bg-green-600 text-white' : 'border-slate-700 bg-slate-800 text-slate-500'}`}>
          {isStepCompleted ? <Check size={18} /> : <span className="font-semibold">{visualStep}</span>}
        </div>
        <span className="text-xs text-center font-medium text-slate-600">{title}</span>
      </div>
    );
};
export default StepIndicator;