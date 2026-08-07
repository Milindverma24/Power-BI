import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, User, Database, Loader2, Pin } from 'lucide-react';
import ChartRenderer from '../components/ChartRenderer';

interface DataSource {
  id: string;
  name: string;
  status: string;
}

interface ChartConfig {
  type: string;
  xAxisKey: string;
  yAxisKey: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  chartConfig?: ChartConfig;
  data?: any[];
  sqlQuery?: string;
}

const DataChat = () => {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const res = await axios.get('/api/v1/data-sources');
        const readySources = res.data.filter((s: DataSource) => s.status === 'READY');
        setSources(readySources);
        if (readySources.length > 0) {
          setSelectedSource(readySources[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch data sources", err);
      }
    };
    fetchSources();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedSource) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await axios.post('/api/v1/chat', {
        dataSourceId: selectedSource,
        message: userMessage
      });
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: res.data.answer,
        chartConfig: res.data.chartConfig,
        data: res.data.data,
        sqlQuery: res.data.sqlQuery
      }]);
    } catch (err: any) {
      console.error("Chat error", err);
      const errorMsg = err.response?.data || "Sorry, I encountered an error answering your question.";
      setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${errorMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const pinToDashboard = async (msg: Message) => {
    if (!msg.chartConfig || !msg.sqlQuery) return;
    
    const title = prompt("Enter a title for this dashboard widget:");
    if (!title) return;

    try {
      await axios.post('/api/v1/dashboard/widgets', {
        dataSourceId: selectedSource,
        title,
        sqlQuery: msg.sqlQuery,
        chartConfig: msg.chartConfig
      });
      alert("Chart pinned to dashboard successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to pin chart to dashboard.");
    }
  };

  if (sources.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted p-8">
        Please upload a dataset in the "Data Sources" tab before starting a chat!
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-3xl font-bold text-main flex items-center gap-3">
          <Bot className="text-accent-indigo" /> Chat with Data
        </h1>
        <div className="flex gap-2 overflow-x-auto p-1.5 bg-surface rounded-2xl border border-border-theme">
          {sources.map(s => (
            <button
              key={s.id}
              onClick={() => {
                if (selectedSource !== s.id) {
                  setSelectedSource(s.id);
                  setMessages([]);
                }
              }}
              className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                selectedSource === s.id
                  ? 'bg-accent-indigo text-white shadow-[0_0_15px_rgba(79,70,229,0.2)]'
                  : 'text-muted hover:text-main hover:bg-white/[0.05]'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-muted space-y-4">
              <div className="w-16 h-16 bg-primary-900/20 rounded-full flex items-center justify-center">
                <Database size={32} className="text-accent-primary" />
              </div>
              <p>Ask me anything about your dataset using RAG!</p>
              <p className="text-sm opacity-60 text-center max-w-sm">
                Try asking: "What was the highest revenue?", or "Who bought Electronics?"
              </p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-accent-indigo flex items-center justify-center shrink-0 mt-1">
                  <Bot size={16} className="text-main" />
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-accent-indigo text-white rounded-br-none' 
                  : 'bg-surface-hover text-main rounded-bl-none border border-border-theme'
              }`}>
                <div className="prose prose-invert max-w-none">
                  {msg.content}
                </div>
                {msg.chartConfig && msg.data && (
                  <div className="mt-4 relative group">
                    <ChartRenderer config={msg.chartConfig} data={msg.data} />
                    <button 
                      onClick={() => pinToDashboard(msg)}
                      className="absolute top-2 right-2 p-2 bg-surface-hover text-main rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-hover hover:text-main"
                      title="Pin to Dashboard"
                    >
                      <Pin size={16} />
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center shrink-0 mt-1">
                  <User size={16} className="text-main" />
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-accent-indigo flex items-center justify-center shrink-0 mt-1">
                <Bot size={16} className="text-main" />
              </div>
              <div className="bg-surface-hover rounded-2xl p-4 rounded-bl-none border border-border-theme flex items-center gap-2 text-muted">
                <Loader2 size={16} className="animate-spin" /> Analyzing dataset context...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border-theme bg-surface/50">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your data..."
              className="w-full bg-surface-hover border border-border-theme text-main rounded-xl pl-4 pr-12 py-4 outline-none focus:border-accent-indigo transition-colors"
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || loading}
              className="absolute right-2 p-2 bg-accent-indigo text-white rounded-2xl disabled:opacity-50 hover:bg-accent-indigo transition-colors"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DataChat;
