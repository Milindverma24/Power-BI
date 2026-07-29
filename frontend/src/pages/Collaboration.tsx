import { useState, useEffect } from 'react';
import { MessageSquare, GitCommit, BookOpen, Send, CheckCircle2, AlertTriangle, Link as LinkIcon, Plus } from 'lucide-react';
import axios from 'axios';

interface Comment {
  id: string;
  content: string;
  author: { firstName: string, lastName: string, email: string };
  createdAt: string;
}

interface DashboardVersion {
  id: string;
  versionNumber: number;
  changes: string;
  createdAt: string;
  createdBy?: { firstName: string, lastName: string };
}

interface Decision {
  id: string;
  title: string;
  rationale: string;
  decisionText?: string;
  expectedOutcome: string;
  status: string;
  createdAt: string;
}

const Collaboration = () => {
  const [activeTab, setActiveTab] = useState<'discussion' | 'versions' | 'decisions'>('discussion');
  const [discussions, setDiscussions] = useState<Comment[]>([]);
  const [versions, setVersions] = useState<DashboardVersion[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Decision Form
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [newDecisionTitle, setNewDecisionTitle] = useState('');
  const [newDecisionRationale, setNewDecisionRationale] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (activeTab === 'discussion') {
        // Fetch comments for a dummy target ID for now (dashboard)
        const res = await axios.get('/api/v1/collaboration/comments/DASHBOARD/00000000-0000-0000-0000-000000000000', { headers });
        setDiscussions(res.data);
      } else if (activeTab === 'versions') {
        const res = await axios.get('/api/v1/collaboration/versions', { headers });
        setVersions(res.data);
      } else if (activeTab === 'decisions') {
        const res = await axios.get('/api/v1/collaboration/decisions', { headers });
        setDecisions(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch collaboration data", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/v1/collaboration/comments', {
        targetType: 'DASHBOARD',
        targetId: '00000000-0000-0000-0000-000000000000',
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewMessage('');
      fetchData(); // refresh comments
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  const handleLogDecision = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/v1/collaboration/decisions', {
        title: newDecisionTitle,
        rationale: newDecisionRationale
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowDecisionForm(false);
      setNewDecisionTitle('');
      setNewDecisionRationale('');
      fetchData();
    } catch (e) {
      console.error("Failed to log decision", e);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col animate-fade-in">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-main mb-2">Collaboration Hub</h1>
          <p className="text-muted">Discuss data, track dashboard versions, and log decisions with AI outcome measurement.</p>
        </div>
        {activeTab === 'decisions' && !showDecisionForm && (
          <button 
            onClick={() => setShowDecisionForm(true)}
            className="bg-accent-indigo hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-xl transition flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> Log Decision
          </button>
        )}
      </div>

      <div className="flex gap-6 border-b border-border-theme mb-6">
        <button
          onClick={() => setActiveTab('discussion')}
          className={`pb-4 px-2 font-medium text-sm transition-all border-b-2 ${
            activeTab === 'discussion' ? 'border-accent-indigo text-accent-indigo' : 'border-transparent text-muted hover:text-main'
          }`}
        >
          <div className="flex items-center gap-2"><MessageSquare size={16} /> Team Discussion</div>
        </button>
        <button
          onClick={() => setActiveTab('versions')}
          className={`pb-4 px-2 font-medium text-sm transition-all border-b-2 ${
            activeTab === 'versions' ? 'border-accent-indigo text-accent-indigo' : 'border-transparent text-muted hover:text-main'
          }`}
        >
          <div className="flex items-center gap-2"><GitCommit size={16} /> Version History</div>
        </button>
        <button
          onClick={() => setActiveTab('decisions')}
          className={`pb-4 px-2 font-medium text-sm transition-all border-b-2 ${
            activeTab === 'decisions' ? 'border-accent-indigo text-accent-indigo' : 'border-transparent text-muted hover:text-main'
          }`}
        >
          <div className="flex items-center gap-2"><BookOpen size={16} /> Decision Journal</div>
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'discussion' && (
          <div className="flex-1 bg-surface border border-border-theme rounded-2xl flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {discussions.map(msg => (
                <div key={msg.id} className={`flex gap-4 ${msg.author.email.includes('system') ? 'bg-accent-indigo/5 p-4 rounded-2xl border border-accent-indigo/10' : ''}`}>
                  {msg.author.email.includes('system') ? (
                    <div className="w-10 h-10 rounded-full bg-accent-indigo flex items-center justify-center shrink-0">
                      <MessageSquare size={20} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface-hover border border-border-theme flex items-center justify-center shrink-0 font-bold text-main">
                      {msg.author.firstName[0]}
                    </div>
                  )}
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`font-bold ${msg.author.email.includes('system') ? 'text-accent-indigo' : 'text-main'}`}>
                        {msg.author.firstName} {msg.author.lastName}
                      </span>
                      <span className="text-xs text-muted font-mono">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-main leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {discussions.length === 0 && (
                <div className="text-center text-muted py-10 font-mono">No discussions yet. Start the conversation!</div>
              )}
            </div>
            <div className="p-4 border-t border-border-theme bg-surface/80">
              <div className="relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Mention someone or ask the AI to analyze..."
                  className="w-full bg-background border border-border-theme rounded-xl py-3 pl-4 pr-12 text-main focus:outline-none focus:border-accent-indigo"
                />
                <button 
                  onClick={handleSendMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent-indigo text-white rounded-lg hover:bg-indigo-600 transition"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'versions' && (
          <div className="flex-1 bg-surface border border-border-theme rounded-2xl p-6 overflow-y-auto custom-scrollbar">
            <div className="relative border-l-2 border-border-theme ml-4 space-y-8 pb-4">
              {versions.map((ver, idx) => (
                <div key={ver.id} className="relative pl-8">
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-surface ${idx === 0 ? 'bg-accent-indigo' : 'bg-muted'}`} />
                  <div className="bg-background border border-border-theme p-4 rounded-xl hover:border-accent-indigo/30 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-main font-mono text-lg">v{ver.versionNumber}</h4>
                        {idx === 0 && <span className="bg-emerald-500/10 text-emerald-500 text-xs font-bold px-2 py-0.5 rounded-full">CURRENT</span>}
                      </div>
                      <span className="text-xs text-muted font-mono">{new Date(ver.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-main mb-3">Snapshot: {ver.changes}</p>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span className="bg-surface-hover px-2 py-1 rounded">Published by {ver.createdBy?.firstName || 'System'}</span>
                    </div>
                  </div>
                </div>
              ))}
              {versions.length === 0 && (
                <div className="text-muted font-mono ml-8">No dashboard versions found.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'decisions' && (
          <div className="flex-1 flex flex-col gap-4">
            {showDecisionForm && (
              <div className="bg-surface border border-border-theme p-6 rounded-2xl">
                <h3 className="font-bold text-main mb-4">Log a New Decision</h3>
                <input 
                  type="text" 
                  placeholder="Decision Title" 
                  value={newDecisionTitle}
                  onChange={e => setNewDecisionTitle(e.target.value)}
                  className="w-full bg-background border border-border-theme rounded-lg px-4 py-2 text-main mb-3 focus:border-accent-indigo outline-none"
                />
                <textarea 
                  placeholder="Rationale and action taken..." 
                  value={newDecisionRationale}
                  onChange={e => setNewDecisionRationale(e.target.value)}
                  className="w-full bg-background border border-border-theme rounded-lg px-4 py-2 text-main mb-4 min-h-[100px] focus:border-accent-indigo outline-none custom-scrollbar"
                />
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowDecisionForm(false)} className="px-4 py-2 rounded-lg text-muted hover:text-main font-medium">Cancel</button>
                  <button onClick={handleLogDecision} className="px-4 py-2 rounded-lg bg-accent-indigo text-white font-medium hover:bg-indigo-600 transition">Save Decision</button>
                </div>
              </div>
            )}
            
            <div className="flex-1 bg-surface border border-border-theme rounded-2xl p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-4">
                {decisions.map(dec => (
                  <div key={dec.id} className="bg-background border border-border-theme p-5 rounded-xl hover:border-accent-indigo/30 transition flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted font-mono mb-2">
                        {new Date(dec.createdAt).toLocaleDateString()} &bull; Dashboard Context <LinkIcon size={12} className="inline ml-1 text-accent-indigo cursor-pointer" />
                      </div>
                      <h4 className="font-bold text-main text-lg mb-2">{dec.title}</h4>
                      <p className="text-muted text-sm">{dec.rationale || dec.decisionText}</p>
                    </div>
                    <div className={`w-full md:w-64 shrink-0 rounded-xl p-4 border flex flex-col justify-center ${
                      dec.status === 'SUCCESS' || dec.status.toLowerCase() === 'success'
                        ? 'bg-emerald-500/5 border-emerald-500/20' 
                        : dec.status.includes('PENDING') 
                          ? 'bg-surface border-border-theme' 
                          : 'bg-amber-500/5 border-amber-500/20'
                    }`}>
                      <div className="text-xs font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                        AI Measured Outcome
                        {dec.status.includes('SUCCESS') ? <CheckCircle2 size={14} className="text-emerald-500" /> : dec.status.includes('PENDING') ? <GitCommit size={14} /> : <AlertTriangle size={14} className="text-amber-500" />}
                      </div>
                      <div className={`font-mono font-bold text-lg ${dec.status.includes('SUCCESS') ? 'text-emerald-500' : dec.status.includes('PENDING') ? 'text-muted text-sm' : 'text-amber-500'}`}>
                        {dec.expectedOutcome}
                      </div>
                    </div>
                  </div>
                ))}
                {decisions.length === 0 && !showDecisionForm && (
                  <div className="text-center text-muted py-10 font-mono">No decisions logged yet.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collaboration;
