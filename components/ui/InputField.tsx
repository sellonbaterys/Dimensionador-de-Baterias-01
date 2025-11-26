import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  Icon: LucideIcon;
  description?: string;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, type, value, onChange, Icon, description, className, ...props }) => (
    <div className="group w-full">
      <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2.5 flex items-center gap-2 group-focus-within:text-green-400">
        <Icon className="w-4 h-4" />{label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          className={`w-full bg-slate-900/40 border border-white/10 text-white rounded-xl py-4 pl-5 pr-4 focus:ring-1 focus:ring-green-500 outline-none text-lg font-medium ${className}`}
          {...props}
        />
        <div className="absolute inset-0 rounded-xl bg-green-500/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity"></div>
      </div>
      {description && <p className="mt-2 text-xs text-slate-500 ml-1">{description}</p>}
    </div>
);
export default InputField;