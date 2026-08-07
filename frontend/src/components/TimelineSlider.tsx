import { useState } from 'react';
import { History, Play, Pause } from 'lucide-react';

interface TimelineSliderProps {
  onTimeChange: (timestamp: string | null) => void;
}

const TimelineSlider = ({ onTimeChange }: TimelineSliderProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [value, setValue] = useState(100); // 0 to 100 representing past to present

  // A basic mock of dates for the slider
  const getLabel = (val: number) => {
    if (val === 100) return 'Present';
    const date = new Date();
    date.setDate(date.getDate() - (100 - val) * 2); // Each tick is 2 days ago
    return date.toISOString().split('T')[0];
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setValue(val);
    if (val === 100) {
      onTimeChange(null);
    } else {
      const date = new Date();
      date.setDate(date.getDate() - (100 - val) * 2);
      onTimeChange(date.toISOString());
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl z-40">
      <div className="glass bg-surface/90 border border-border-theme rounded-2xl p-4 shadow-[0_4px_20px_rgba(79,70,229,0.15)] flex items-center gap-4 backdrop-blur-xl">
        <div className="bg-accent-indigo/20 p-2 rounded-2xl text-accent-indigo shrink-0">
          <History size={20} />
        </div>
        
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="text-main hover:text-main hover:bg-surface-hover p-2 rounded-full transition shrink-0"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between text-xs font-semibold text-muted uppercase tracking-widest px-1">
            <span>Past</span>
            <span className="text-accent-indigo">{getLabel(value)}</span>
            <span>Present</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={value}
            onChange={handleSliderChange}
            className="w-full accent-indigo-500 h-2 bg-surface-hover rounded-2xl appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default TimelineSlider;
