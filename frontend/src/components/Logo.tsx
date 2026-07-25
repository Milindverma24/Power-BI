import React from 'react';
import { BrainCircuit, LineChart } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const iconSize = size === 'sm' ? 20 : size === 'md' ? 28 : size === 'lg' ? 40 : 56;
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-3 bg-surface-hover px-4 py-2 rounded-2xl border border-border-theme shadow-sm shadow-black/5">
        {/* AI - Intelligence Box */}
        <div className="flex items-center gap-1.5">
          <BrainCircuit size={iconSize} className="text-accent-indigo" strokeWidth={2} />
          <span className={`font-black tracking-tighter text-accent-indigo ${size === 'sm' ? 'text-base' : size === 'md' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-4xl'} leading-none`}>AI</span>
        </div>
        
        {/* Divider */}
        <div className={`w-[2px] bg-border-theme rounded-full ${size === 'sm' ? 'h-4' : size === 'md' ? 'h-5' : size === 'lg' ? 'h-7' : 'h-10'}`} />
        
        {/* BI - Business Box */}
        <div className="flex items-center gap-1.5">
          <LineChart size={iconSize} className="text-emerald-500" strokeWidth={2} />
          <span className={`font-black tracking-tighter text-emerald-500 ${size === 'sm' ? 'text-base' : size === 'md' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-4xl'} leading-none`}>BI</span>
        </div>
      </div>
    </div>
  );
};

export default Logo;
