import { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, CheckSquare, Send, User as UserIcon, X, Check, Clock } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  author: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

interface ActionItem {
  id: string;
  title: string;
  assignedTo: { id: string; firstName: string; lastName: string } | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  createdAt: string;
}

interface Props {
  targetId: string;
  targetType: 'WIDGET' | 'DASHBOARD' | 'DECISION';
  onClose: () => void;
}

const CollaborationPanel = ({ targetId, targetType, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState<'comments' | 'actions'>('comments');
  const [comments, setComments] = useState<Comment[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [newInput, setNewInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch from actual API endpoints
    // For demo purposes, we set some mock data
    setTimeout(() => {
      setComments([
        {
          id: '1',
          content: 'I noticed a strange spike in revenue here on May 12th. @john can you look into the data source?',
          author: { id: 'u1', firstName: 'Alice', lastName: 'Smith' },
          createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hr ago
        }
      ]);
      setActions([
        {
          id: '1',
          title: 'Verify May 12th revenue data',
          assignedTo: { id: 'u2', firstName: 'John', lastName: 'Doe' },
          status: 'PENDING',
          createdAt: new Date(Date.now() - 3000000).toISOString()
        }
      ]);
      setLoading(false);
    }, 500);
  }, [targetId, targetType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInput.trim()) return;

    if (activeTab === 'comments') {
      const newComment: Comment = {
        id: Math.random().toString(),
        content: newInput,
        author: { id: 'me', firstName: 'You', lastName: '' },
        createdAt: new Date().toISOString()
      };
      setComments([newComment, ...comments]);
    } else {
      const newAction: ActionItem = {
        id: Math.random().toString(),
        title: newInput,
        assignedTo: null,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      setActions([newAction, ...actions]);
    }
    setNewInput('');
  };

  const toggleActionStatus = (actionId: string, currentStatus: string) => {
    setActions(actions.map(a => {
      if (a.id === actionId) {
        return { ...a, status: currentStatus === 'DONE' ? 'PENDING' : 'DONE' };
      }
      return a;
    }));
  };

  const formatMentions = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-accent-indigo font-medium bg-accent-indigo/10 px-1 rounded">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-96 glass border-l border-border-theme shadow-[0_4px_20px_rgba(79,70,229,0.15)] flex flex-col animate-slide-in-right z-40">
      <div className="p-4 border-b border-border-theme flex justify-between items-center bg-surface/50">
        <h2 className="text-lg font-bold text-main flex items-center gap-2">
          Collaboration
        </h2>
        <button onClick={onClose} className="text-muted hover:text-main transition">
          <X size={20} />
        </button>
      </div>

      <div className="flex border-b border-border-theme">
        <button
          className={`flex-1 py-3 text-sm font-medium flex justify-center items-center gap-2 transition-colors ${
            activeTab === 'comments' ? 'text-accent-indigo border-b-2 border-indigo-500 bg-accent-indigo/5' : 'text-muted hover:text-main hover:bg-surface-hover/50'
          }`}
          onClick={() => setActiveTab('comments')}
        >
          <MessageSquare size={16} /> Comments
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium flex justify-center items-center gap-2 transition-colors ${
            activeTab === 'actions' ? 'text-accent-indigo border-b-2 border-indigo-500 bg-accent-indigo/5' : 'text-muted hover:text-main hover:bg-surface-hover/50'
          }`}
          onClick={() => setActiveTab('actions')}
        >
          <CheckSquare size={16} /> Actions
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center p-8 text-accent-indigo">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : activeTab === 'comments' ? (
          comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="bg-surface-hover/40 rounded-xl p-3 border border-border-theme">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent-indigo/20 flex items-center justify-center text-accent-indigo">
                      <UserIcon size={12} />
                    </div>
                    <span className="text-sm font-medium text-main">
                      {comment.author.firstName} {comment.author.lastName}
                    </span>
                  </div>
                  <span className="text-xs text-muted">
                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-main leading-relaxed">
                  {formatMentions(comment.content)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-muted text-sm py-8">No comments yet. Start the conversation!</p>
          )
        ) : (
          actions.length > 0 ? (
            actions.map((action) => (
              <div key={action.id} className={`bg-surface-hover/40 rounded-xl p-3 border border-border-theme flex gap-3 transition-opacity ${action.status === 'DONE' ? 'opacity-60' : ''}`}>
                <button 
                  onClick={() => toggleActionStatus(action.id, action.status)}
                  className={`mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                    action.status === 'DONE' ? 'bg-emerald-500 border-emerald-500 text-main' : 'border-slate-500 text-transparent hover:border-indigo-400'
                  }`}
                >
                  <Check size={14} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm text-main ${action.status === 'DONE' ? 'line-through text-muted' : ''}`}>
                    {action.title}
                  </p>
                  {action.assignedTo && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-accent-indigo bg-accent-indigo/10 inline-flex px-1.5 py-0.5 rounded">
                      <UserIcon size={10} /> {action.assignedTo.firstName}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted text-sm py-8">No action items assigned.</p>
          )
        )}
      </div>

      <div className="p-4 border-t border-border-theme bg-surface/80">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newInput}
            onChange={(e) => setNewInput(e.target.value)}
            placeholder={activeTab === 'comments' ? "Type a comment (use @ to mention)..." : "Add an action item..."}
            className="flex-1 bg-surface-hover border border-border-theme rounded-2xl px-3 py-2 text-sm text-main focus:outline-none focus:border-indigo-500 placeholder-slate-400"
          />
          <button 
            type="submit"
            disabled={!newInput.trim()}
            className="bg-accent-indigo hover:bg-accent-indigo disabled:opacity-50 text-main p-2 rounded-2xl transition-colors flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CollaborationPanel;
