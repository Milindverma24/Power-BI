import React from 'react';
import { Activity } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : size === 'lg' ? 24 : 32;
  const textSize = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : size === 'lg' ? 'text-2xl' : 'text-3xl';
  const boxSize = size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : size === 'lg' ? 'w-12 h-12' : 'w-16 h-16';
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${boxSize} rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20`}>
        <Activity size={iconSize} className="text-white" strokeWidth={2.5} />
      </div>
      <div className="flex flex-col justify-center">
        <span className={`font-display font-bold tracking-tight text-white ${textSize} leading-none`}>NeuralBI</span>
      </div>
    </div>
  );
};

export default Logo;
