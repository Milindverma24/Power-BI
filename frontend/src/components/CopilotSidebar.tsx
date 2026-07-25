import { useState } from 'react';
import axios from 'axios';
import { Bot, Send, Sparkles, Loader2, X } from 'lucide-react';

interface CopilotSidebarProps {
  onApplyFilter: (sqlModifier: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const CopilotSidebar = ({ onApplyFilter, isOpen, onClose }: CopilotSidebarProps) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: 'Hi! I am your AI Copilot. Ask me to change the dashboard view, like "Show top 10 products" or "Filter by last quarter".' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = query.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:8080/api/v1/copilot/filter', { query: userMessage });
      // Controller returns: { "sqlModifier": "...", "message": "..." }
      
      let parsed = res.data;
      if (typeof res.data === 'string') {
        parsed = JSON.parse(res.data);
      }

      setMessages(prev => [...prev, { role: 'ai', content: parsed.message || 'Applied filters successfully.' }]);
      if (parsed.sqlModifier) {
        onApplyFilter(parsed.sqlModifier);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error processing that request.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 border-l border-border-theme bg-surface/80 backdrop-blur-xl h-full flex flex-col fixed right-0 top-0 z-40 shadow-[0_4px_20px_rgba(79,70,229,0.15)] transition-transform duration-300">
      <div className="p-4 border-b border-border-theme flex items-center justify-between bg-surface-hover/50">
        <div className="flex items-center gap-2 text-accent-indigo font-semibold">
          <Sparkles size={18} />
          <span>AI Copilot</span>
        </div>
        <button onClick={onClose} className="text-muted hover:text-main transition">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 max-w-[90%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-accent-indigo' : 'bg-surface-hover'}`}>
              {m.role === 'user' ? <span className="text-sm">U</span> : <Bot size={16} className="text-accent-indigo" />}
            </div>
            <div className={`p-3 rounded-xl text-sm ${m.role === 'user' ? 'bg-accent-indigo text-main rounded-tr-none' : 'bg-surface-hover text-main rounded-tl-none border border-border-theme'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[90%]">
            <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center shrink-0">
              <Loader2 size={16} className="text-accent-indigo animate-spin" />
            </div>
            <div className="p-3 rounded-xl text-sm bg-surface-hover text-muted rounded-tl-none border border-border-theme flex items-center gap-2">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border-theme bg-surface">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Copilot to filter..."
            className="w-full bg-surface-hover border border-border-theme rounded-full py-3 pl-4 pr-12 text-sm text-main focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent-indigo hover:bg-accent-indigo rounded-full text-main disabled:opacity-50 transition"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CopilotSidebar;
