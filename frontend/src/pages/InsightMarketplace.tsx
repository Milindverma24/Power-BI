import { useState, useEffect } from 'react';
import axios from 'axios';
import { Store, ThumbsUp, Copy, Plus, Sparkles, Search, MessageSquare } from 'lucide-react';

interface Prompt {
  id: string;
  title: string;
  description: string;
  promptText: string;
  category: string;
  authorName: string;
  upvotes: number;
}

const InsightMarketplace = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [category, setCategory] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  
  const [newPrompt, setNewPrompt] = useState({
    title: '',
    description: '',
    promptText: '',
    category: 'Sales'
  });

  const categories = ['All', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations'];

  useEffect(() => {
    fetchPrompts();
  }, [category]);

  const fetchPrompts = async () => {
    try {
      const url = category && category !== 'All' 
        ? `http://localhost:8080/api/v1/marketplace/prompts?category=${category}`
        : 'http://localhost:8080/api/v1/marketplace/prompts';
      const res = await axios.get(url);
      setPrompts(res.data);
    } catch (err) {
      console.error("Failed to load marketplace prompts", err);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/v1/marketplace/prompts', newPrompt);
      setIsSharing(false);
      setNewPrompt({ title: '', description: '', promptText: '', category: 'Sales' });
      fetchPrompts();
    } catch (err) {
      alert("Failed to share prompt");
    }
  };

  const handleUpvote = async (id: string) => {
    try {
      await axios.post(`http://localhost:8080/api/v1/marketplace/prompts/${id}/upvote`);
      fetchPrompts();
    } catch (err) {
      console.error("Failed to upvote", err);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Store className="text-accent-indigo" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-main">Insight Marketplace</h1>
            <p className="text-muted mt-1">Discover and share the best AI prompts for generating powerful dashboards.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsSharing(true)}
          className="bg-accent-indigo hover:bg-accent-indigo text-main font-medium px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-[0_4px_20px_rgba(79,70,229,0.15)] shadow-accent-indigo/20"
        >
          <Plus size={18} /> Share Prompt
        </button>
      </div>

      {isSharing && (
        <div className="glass rounded-2xl p-6 border border-border-theme mb-8 animate-fade-in">
          <h2 className="text-xl font-semibold text-main mb-4">Share an AI Prompt</h2>
          <form onSubmit={handleShare} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-main mb-1">Title</label>
                <input required type="text" className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main" value={newPrompt.title} onChange={e => setNewPrompt({...newPrompt, title: e.target.value})} placeholder="e.g., Ultimate Sales KPI Generator" />
              </div>
              <div>
                <label className="block text-sm text-main mb-1">Category</label>
                <select className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main" value={newPrompt.category} onChange={e => setNewPrompt({...newPrompt, category: e.target.value})}>
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-main mb-1">Description</label>
              <input required type="text" className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main" value={newPrompt.description} onChange={e => setNewPrompt({...newPrompt, description: e.target.value})} placeholder="What does this prompt do?" />
            </div>
            <div>
              <label className="block text-sm text-main mb-1">The Exact AI Prompt</label>
              <textarea required className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main h-24" value={newPrompt.promptText} onChange={e => setNewPrompt({...newPrompt, promptText: e.target.value})} placeholder="Type the exact prompt you used in the 'Auto-Generate Dashboard' tool..." />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsSharing(false)} className="px-4 py-2 text-muted hover:text-main transition">Cancel</button>
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-main font-medium px-6 py-2 rounded-xl transition">Publish Prompt</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto p-1.5 bg-surface rounded-2xl border border-border-theme">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c === 'All' ? '' : c)}
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              (category === c || (!category && c === 'All'))
                ? 'bg-accent-indigo text-white shadow-[0_0_15px_rgba(79,70,229,0.2)]' 
                : 'text-muted hover:text-main hover:bg-white/[0.05]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-8 custom-scrollbar">
        {prompts.map(p => (
          <div key={p.id} className="glass rounded-2xl p-6 border border-border-theme flex flex-col hover:border-indigo-500/30 transition group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-accent-indigo uppercase tracking-wider bg-accent-indigo/10 px-2 py-1 rounded-xl">{p.category}</span>
              <button 
                onClick={() => handleUpvote(p.id)}
                className="flex items-center gap-1 text-muted hover:text-accent-emerald transition"
              >
                <ThumbsUp size={14} /> {p.upvotes}
              </button>
            </div>
            <h3 className="text-lg font-bold text-main mb-1">{p.title}</h3>
            <p className="text-sm text-muted mb-4 flex-1">{p.description}</p>
            
            <div className="bg-surface rounded-xl p-3 mb-4 relative group/code border border-border-theme">
              <div className="text-xs text-muted mb-1 flex items-center gap-1"><MessageSquare size={12}/> Prompt</div>
              <p className="text-sm text-main line-clamp-3 italic">"{p.promptText}"</p>
              <button 
                onClick={() => handleCopy(p.promptText)}
                className="absolute top-2 right-2 p-1.5 bg-surface-hover text-muted rounded-xl opacity-0 group-hover/code:opacity-100 hover:text-main hover:bg-surface-hover transition"
                title="Copy Prompt"
              >
                <Copy size={14} />
              </button>
            </div>

            <div className="flex justify-between items-center text-xs text-muted border-t border-border-theme pt-4">
              <span>By {p.authorName}</span>
              <button 
                onClick={() => handleCopy(p.promptText)}
                className="flex items-center gap-1 text-accent-indigo hover:text-accent-indigo font-medium"
              >
                <Copy size={14} /> Use Prompt
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightMarketplace;
