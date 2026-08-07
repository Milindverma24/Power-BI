import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { GitMerge, Loader2, Play, Search, ChevronRight, ChevronDown, Network } from 'lucide-react';

interface RootCauseNode {
  id: string;
  label: string;
  metric?: string;
  description: string;
  children?: RootCauseNode[];
}

const TreeNode = ({ node, level = 0 }: { node: RootCauseNode; level?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col">
      <div 
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        className={`flex items-start gap-2 p-3 rounded-xl border border-border-theme hover:border-indigo-500/30 transition-colors bg-surface/50 mt-2 ${hasChildren ? 'cursor-pointer hover:bg-surface-hover' : ''} ${level === 0 ? 'border-indigo-500/50 bg-accent-indigo/10' : ''}`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        <button 
          className={`mt-0.5 p-1 rounded-xl text-muted transition ${!hasChildren ? 'invisible' : ''}`}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-4">
            <h4 className={`font-semibold ${level === 0 ? 'text-accent-indigo text-lg' : 'text-main'}`}>{node.label}</h4>
            {node.metric && (
              <span className="text-xs font-mono bg-surface-hover text-accent-indigo px-2 py-1 rounded-xl border border-border-theme">
                {node.metric}
              </span>
            )}
          </div>
          <p className="text-sm text-muted mt-1">{node.description}</p>
        </div>
      </div>
      
      {isExpanded && hasChildren && (
        <div className="flex flex-col relative before:absolute before:left-[11px] before:top-0 before:bottom-4 before:w-[2px] before:bg-surface-hover/50 ml-[12px]">
          {node.children!.map((child) => (
            <div key={child.id} className="relative">
              <div className="absolute left-0 top-6 w-4 h-[2px] bg-surface-hover/50" />
              <TreeNode node={child} level={level + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RootCauseExplorer = () => {
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState('');
  const [query, setQuery] = useState('');
  const [treeData, setTreeData] = useState<RootCauseNode | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const location = useLocation();
  const hasAutoRun = useRef(false);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const dsRes = await axios.get('/api/v1/data-sources');
        setDataSources(dsRes.data);
        if (dsRes.data.length > 0) {
          setSelectedDataSource(dsRes.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load data sources", err);
      }
    };
    fetchSources();
  }, []);

  const runAnalysis = async (sourceId: string, q: string) => {
    setIsAnalyzing(true);
    setError('');
    setTreeData(null);

    try {
      const res = await axios.post(`/api/v1/root-cause/explore/${sourceId}`, {
        query: q
      });
      setTreeData(res.data);
    } catch (err) {
      setError("Failed to generate root cause analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (location.state?.autoQuery && selectedDataSource && !hasAutoRun.current) {
      setQuery(location.state.autoQuery);
      hasAutoRun.current = true;
      runAnalysis(selectedDataSource, location.state.autoQuery);
    }
  }, [location.state, selectedDataSource]);

  const handleExplore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDataSource || !query.trim()) return;
    runAnalysis(selectedDataSource, query.trim());
  };

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <Network className="text-accent-indigo" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-main">Root Cause Explorer</h1>
          <p className="text-muted mt-1">Investigate anomalies by drilling down through multi-dimensional data trees.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        {/* Left Panel: Inputs */}
        <div className="glass rounded-2xl p-6 border border-border-theme flex flex-col gap-6 lg:h-full">
          <form onSubmit={handleExplore} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium text-main mb-2">Dataset</label>
              <div className="flex gap-2 overflow-x-auto p-1.5 bg-surface rounded-2xl border border-border-theme">
                {dataSources.map(ds => (
                  <button
                    key={ds.id}
                    type="button"
                    onClick={() => setSelectedDataSource(ds.id)}
                    className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      selectedDataSource === ds.id
                        ? 'bg-accent-indigo text-white shadow-[0_0_15px_rgba(79,70,229,0.2)]'
                        : 'text-muted hover:text-main hover:bg-white/[0.05]'
                    }`}
                  >
                    {ds.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-main mb-2">What happened?</label>
              <textarea 
                placeholder="e.g., Why did profit fall in Q3? or Why did churn increase last month?"
                rows={4}
                className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main focus:outline-none focus:border-indigo-500 custom-scrollbar resize-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              disabled={isAnalyzing || !query.trim()}
              className="w-full bg-accent-indigo hover:bg-accent-indigo disabled:opacity-50 text-main font-medium py-3 rounded-xl transition flex justify-center items-center gap-2"
            >
              {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              Start Investigation
            </button>
          </form>

          {error && (
            <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red p-4 rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Right Panel: Tree View */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-border-theme flex flex-col overflow-hidden">
          <h2 className="text-xl font-semibold text-main mb-6 flex items-center gap-2">
            <GitMerge size={20} className="text-accent-indigo" /> Investigation Tree
          </h2>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full text-muted gap-4">
                <Loader2 size={32} className="animate-spin text-accent-indigo" />
                <p>AI is crunching the dataset to find the root cause...</p>
              </div>
            ) : treeData ? (
              <div className="pb-8">
                <TreeNode node={treeData} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted opacity-70">
                <Network size={64} className="mb-4 text-slate-700" />
                <p>Submit a query to generate an investigation tree.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RootCauseExplorer;
