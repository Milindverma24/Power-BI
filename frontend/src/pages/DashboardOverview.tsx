import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ChartRenderer from '../components/ChartRenderer';
import CollaborationPanel from '../components/CollaborationPanel';
import CopilotSidebar from '../components/CopilotSidebar';
import ExplainabilityDrawer from '../components/ExplainabilityDrawer';
import TimelineSlider from '../components/TimelineSlider';
import { LayoutDashboard, Loader2, PinOff, Sparkles, X, MessageSquare, ShieldCheck, Send, History, Download, FileText, Bot, Info, Presentation, Lightbulb, Plus, BarChart2, MoreHorizontal, Trash2 } from 'lucide-react';

interface DashboardWidget {
  id: string;
  title: string;
  chartConfig: string;
}

interface WidgetData {
  widget: DashboardWidget;
  data: any[];
  config: any;
}

interface Dashboard {
  id: string;
  title: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED';
}

interface DashboardVersion {
  id: string;
  versionNumber: number;
  createdAt: string;
}

const DashboardOverview = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [activeDashboard, setActiveDashboard] = useState<Dashboard | null>(null);
  const [widgets, setWidgets] = useState<WidgetData[]>([]);
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [versions, setVersions] = useState<DashboardVersion[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState('');
  const [dashboardTheme, setDashboardTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Copilot State
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  
  // Explainability State
  const [explainTargetId, setExplainTargetId] = useState<string | null>(null);

  // Collaboration Panel
  const [collabTarget, setCollabTarget] = useState<{ id: string, type: 'WIDGET' | 'DASHBOARD' } | null>(null);

  // Recommendation State
  const [recommendation, setRecommendation] = useState<any>(null);
  const [isAddingRecommendation, setIsAddingRecommendation] = useState(false);

  // Benchmark State
  const [benchmarkMode, setBenchmarkMode] = useState(false);
  const [benchmarks, setBenchmarks] = useState<Record<string, any[]>>({});
  const [loadingBenchmarks, setLoadingBenchmarks] = useState(false);

  // KPIs State
  const [kpis, setKpis] = useState<any[]>([]);

  const loadWidgets = async (timestamp: string | null = null) => {
    try {
      const res = await axios.get('/api/v1/dashboard/widgets');
      const widgetList: DashboardWidget[] = res.data;
      
      const widgetPromises = widgetList.map(async (widget) => {
        try {
          const url = timestamp 
            ? `/api/v1/dashboard/widgets/${widget.id}/data?timestamp=${encodeURIComponent(timestamp)}`
            : `/api/v1/dashboard/widgets/${widget.id}/data`;
          const dataRes = await axios.get(url);
          return {
            widget,
            data: dataRes.data,
            config: JSON.parse(widget.chartConfig)
          };
        } catch (e) {
          console.warn("Failed to load data for widget, using mock data", widget.title);
          const config = JSON.parse(widget.chartConfig);
          const xKey = config.xAxisKey || 'x';
          const yKey = config.yAxisKey || 'y';
          // Generate 5 random mock data points using the exact keys expected by the chart
          const mockData = Array.from({length: 5}).map((_, i) => ({
            [xKey]: `Item ${i + 1}`,
            [yKey]: Math.floor(Math.random() * 1000) + 100
          }));
          return {
            widget,
            data: mockData,
            config
          };
        }
      });

      const resolvedWidgets = await Promise.all(widgetPromises);
      setWidgets(resolvedWidgets);
    } catch (err) {
      console.error("Failed to load widgets", err);
    }
  };

  const handleDeleteWidget = async (id: string) => {
    if (!confirm("Are you sure you want to remove this chart from the dashboard?")) return;
    try {
      await axios.delete(`/api/v1/dashboard/widgets/${id}`);
      setWidgets(prev => prev.filter(w => w.widget.id !== id));
    } catch (err) {
      alert("Failed to delete widget");
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const mockDashboard: Dashboard = { id: 'd1', title: 'Business Overview', status: 'DRAFT' };
        setDashboards([mockDashboard]);
        setActiveDashboard(mockDashboard);
        setVersions([{ id: 'v1', versionNumber: 1, createdAt: new Date().toISOString() }]);

        await loadWidgets();
        
        const token = localStorage.getItem('token');
        const kpiRes = await axios.get('/api/v1/kpi', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setKpis(kpiRes.data);

        const dsRes = await axios.get('/api/v1/data-sources');
        setDataSources(dsRes.data);
        if (dsRes.data.length > 0) {
          setSelectedDataSource(dsRes.data[0].id);
          // Fetch recommendation if we have a datasource and widgets
          fetchRecommendation(dsRes.data[0].id, []); // Pass empty titles first, will be updated when widgets load
        }
      } catch (err) {
        console.error("Failed to load dashboard or sources", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleGenerateDashboard = async () => {
    if (!selectedDataSource || !dashboardTheme.trim()) return;
    setIsGenerating(true);
    try {
      await axios.post(`/api/v1/dashboard/generate/${selectedDataSource}`, { theme: dashboardTheme });
      setIsModalOpen(false);
      setDashboardTheme('');
      await loadWidgets();
    } catch (err) {
      alert("Failed to generate dashboard");
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchRecommendation = async (dsId: string, currentTitles: string[]) => {
    try {
      const res = await axios.post(`/api/v1/dashboard/recommend/${dsId}`, currentTitles);
      setRecommendation(res.data);
    } catch (err) {
      console.log("No recommendation available");
    }
  };

  useEffect(() => {
    if (selectedDataSource && widgets.length > 0 && !recommendation) {
       const titles = widgets.map(w => w.widget.title);
       fetchRecommendation(selectedDataSource, titles);
    }
  }, [widgets, selectedDataSource]);

  const handleAddRecommendation = async () => {
    if (!recommendation || !selectedDataSource) return;
    setIsAddingRecommendation(true);
    try {
      await axios.post('/api/v1/dashboard/widgets', {
        dataSourceId: selectedDataSource,
        title: recommendation.title,
        sqlQuery: recommendation.sqlQuery,
        chartConfig: recommendation.chartConfig
      });
      setRecommendation(null);
      await loadWidgets();
    } catch (err) {
      alert("Failed to add recommended widget");
    } finally {
      setIsAddingRecommendation(false);
    }
  };

  const toggleBenchmarkMode = async () => {
    const newMode = !benchmarkMode;
    setBenchmarkMode(newMode);
    
    if (newMode && widgets.length > 0) {
      setLoadingBenchmarks(true);
      const newBenchmarks: Record<string, any[]> = {};
      try {
        const promises = widgets.map(async (w) => {
          const res = await axios.get(`/api/v1/benchmarks/widget/${w.widget.id}`);
          newBenchmarks[w.widget.id] = res.data;
        });
        await Promise.all(promises);
        setBenchmarks(newBenchmarks);
      } catch (err) {
        console.error("Failed to load benchmarks", err);
      } finally {
        setLoadingBenchmarks(false);
      }
    }
  };

  const handleDownloadReport = async (format: string) => {
    try {
      if (format === 'story/pptx') {
         alert('Downloading PowerPoint presentation (Mock)...');
         return;
      }
      
      const res = await axios.get(`/api/v1/reports/download?dashboardId=${activeDashboard?.id}&format=${format}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard_report.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download report", err);
      alert("Failed to download report");
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'DRAFT': return <span className="bg-surface-hover text-main text-xs px-2 py-1 rounded-xl font-medium">DRAFT</span>;
      case 'PENDING_REVIEW': return <span className="bg-amber-500/20 text-accent-amber text-xs px-2 py-1 rounded-xl font-medium">PENDING REVIEW</span>;
      case 'APPROVED': return <span className="bg-emerald-500/20 text-accent-emerald text-xs px-2 py-1 rounded-xl font-medium flex items-center gap-1"><ShieldCheck size={12}/> APPROVED</span>;
      default: return null;
    }
  };

  const updateStatus = (newStatus: 'PENDING_REVIEW' | 'APPROVED') => {
    if (activeDashboard) {
      setActiveDashboard({ ...activeDashboard, status: newStatus });
      if (newStatus === 'APPROVED') {
         setVersions([{ id: Math.random().toString(), versionNumber: versions.length + 1, createdAt: new Date().toISOString() }, ...versions]);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto relative overflow-hidden h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-main">{activeDashboard?.title}</h1>
          </div>
          <p className="text-muted text-sm flex items-center gap-4">

            <button 
              onClick={() => setCollabTarget({ id: activeDashboard?.id || '', type: 'DASHBOARD' })}
              className="flex items-center gap-1 hover:text-accent-indigo transition"
            >
              <MessageSquare size={14}/> Dashboard Discussion
            </button>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Action Outline Buttons */}
          <button
            onClick={toggleBenchmarkMode}
            className={`font-medium py-2 px-4 rounded-xl transition flex items-center gap-2 text-sm border ${benchmarkMode ? 'bg-accent-indigo text-white border-accent-indigo' : 'bg-transparent text-muted border-border-theme hover:text-main hover:bg-surface-hover'}`}
          >
            {loadingBenchmarks ? <Loader2 size={16} className="animate-spin" /> : <BarChart2 size={16} />}
            Benchmarks
          </button>
          <Link 
            to="/dashboard/story"
            className="font-medium py-2 px-4 rounded-xl transition flex items-center gap-2 text-sm text-muted bg-transparent border border-border-theme hover:text-main hover:bg-surface-hover"
          >
            <Presentation size={16} />
            Data Story
          </Link>
          <button
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
            className="font-medium py-2 px-4 rounded-xl transition flex items-center gap-2 text-sm text-muted bg-transparent border border-border-theme hover:text-main hover:bg-surface-hover"
          >
            <Bot size={16} className="text-accent-indigo" /> 
            AI Summary
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="font-medium py-2 px-4 rounded-xl transition flex items-center gap-2 text-sm text-muted bg-transparent border border-border-theme hover:text-main hover:bg-surface-hover"
          >
            <Sparkles size={16} /> 
            Auto-Generate
          </button>

          {/* Governance & Export (Ellipsis Menu) */}
          <div className="relative group">
            <button className="bg-surface hover:bg-surface-hover text-main hover:text-main py-2 px-3 rounded-xl transition border border-border-theme flex items-center justify-center h-full">
              <MoreHorizontal size={18} />
            </button>
            <div className="absolute right-0 mt-2 w-56 bg-surface border border-border-theme rounded-xl shadow-[0_4px_20px_rgba(79,70,229,0.15)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 flex flex-col overflow-hidden py-1">
              {/* Export Options */}
              <div className="px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wider">Export</div>
              <button onClick={() => handleDownloadReport('pdf')} className="text-left px-4 py-2 text-sm text-main hover:bg-white/[0.05] hover:text-main flex items-center gap-2">
                <FileText size={14} /> PDF Report
              </button>
              <button onClick={() => handleDownloadReport('excel')} className="text-left px-4 py-2 text-sm text-main hover:bg-white/[0.05] hover:text-main flex items-center gap-2">
                <FileText size={14} /> Excel Export
              </button>
              <button onClick={() => handleDownloadReport('narrative')} className="text-left px-4 py-2 text-sm text-accent-primary hover:bg-white/[0.05] flex items-center gap-2">
                <Sparkles size={14} /> AI Narrative PDF
              </button>
              <button onClick={() => handleDownloadReport('story/pptx')} className="text-left px-4 py-2 text-sm text-accent-amber hover:bg-white/[0.05] flex items-center gap-2">
                <Presentation size={14} /> PowerPoint (.pptx)
              </button>
              
              {/* Approval Options */}
              <div className="px-3 pt-3 pb-2 mt-1 text-xs font-semibold text-muted uppercase tracking-wider border-t border-border-theme">Workflow</div>
              {activeDashboard?.status === 'DRAFT' && (
                <button onClick={() => updateStatus('PENDING_REVIEW')} className="text-left px-4 py-2 text-sm text-main hover:bg-white/[0.05] hover:text-main flex items-center gap-2">
                  <Send size={14} /> Request Review
                </button>
              )}
              {activeDashboard?.status === 'PENDING_REVIEW' && (
                <button onClick={() => updateStatus('APPROVED')} className="text-left px-4 py-2 text-sm text-accent-emerald hover:bg-white/[0.05] flex items-center gap-2">
                  <ShieldCheck size={14} /> Approve & Publish
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden pb-8">
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-6">
          
          {/* KPI Cards Row */}
          {kpis.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
              {kpis.slice(0, 4).map((kpi) => {
                const target = kpi.targetValue || 1;
                const percent = Math.min(Math.round((kpi.actualValue / target) * 100), 100);
                let colorClass = "text-emerald-500 bg-emerald-500";
                if (kpi.healthStatus === 'YELLOW') colorClass = "text-amber-500 bg-amber-500";
                if (kpi.healthStatus === 'RED') colorClass = "text-red-500 bg-red-500";

                return (
                  <div key={kpi.id} className="bg-surface rounded-2xl border border-border-theme p-5 flex flex-col justify-between h-[140px] relative overflow-hidden group hover:border-accent-indigo/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium text-muted truncate pr-4">{kpi.name}</h3>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${colorClass.split(' ')[1]} shadow-[0_0_8px_currentColor]`} />
                    </div>
                    <div>
                      <div className="text-3xl font-display font-bold text-main mb-1">
                        {new Intl.NumberFormat('en-IN', { notation: "compact", maximumFractionDigits: 1 }).format(kpi.actualValue)}
                      </div>
                      <div className="text-xs text-muted font-mono">
                        target {new Intl.NumberFormat('en-IN', { notation: "compact", maximumFractionDigits: 1 }).format(target)}
                      </div>
                    </div>
                    {/* Progress Bar Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-hover">
                      <div className={`h-full ${colorClass.split(' ')[1]}`} style={{ width: `${percent}%` }} />
                    </div>
                    <div className={`absolute bottom-3 right-5 text-xs font-mono font-bold ${colorClass.split(' ')[0]}`}>
                      {percent}% of target
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {widgets.length === 0 ? (
            <div className="bento-card border-dashed flex flex-col items-center justify-center p-16 mt-8">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
                <PinOff size={32} className="text-muted" />
              </div>
              <h2 className="text-xl text-main font-semibold mb-2">Your dashboard is empty</h2>
              <p className="text-muted max-w-md text-center">
                Go to the "Chat with Data" tab, ask the AI to generate a chart, and click the pin icon to add it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-[350px]">
              {widgets.map((w, i) => (
                <div key={w.widget.id} className={`bento-card group flex flex-col ${i === 0 ? 'xl:col-span-2' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold tracking-tight text-main">{w.widget.title}</h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDeleteWidget(w.widget.id)}
                        className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-hover p-1.5 rounded-2xl"
                        title="Delete widget"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        onClick={() => setExplainTargetId(w.widget.id)}
                        className="text-muted hover:text-accent-indigo opacity-0 group-hover:opacity-100 transition-opacity bg-surface-hover p-1.5 rounded-2xl"
                        title="Explain this chart"
                      >
                        <Info size={16} />
                      </button>
                      <button 
                        onClick={() => setCollabTarget({ id: w.widget.id, type: 'WIDGET' })}
                        className="text-muted hover:text-accent-indigo opacity-0 group-hover:opacity-100 transition-opacity bg-surface-hover p-1.5 rounded-2xl"
                        title="Collaborate on this widget"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 -mx-2 overflow-hidden flex flex-col">
                    <ChartRenderer config={w.config} data={w.data} benchmarkData={benchmarkMode ? benchmarks[w.widget.id] : undefined} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggested For You Sidebar */}
        {recommendation && (
          <div className="w-80 shrink-0 hidden xl:block animate-fade-in">
            <div className="bento-card border-accent-indigo/30 bg-accent-indigo/5 sticky top-0 shadow-[0_0_30px_rgba(79,70,229,0.05)]">
              <div className="flex items-center gap-2 text-accent-indigo font-bold mb-4 uppercase tracking-wider text-xs">
                <Lightbulb size={16} /> Suggested For You
              </div>
              <h3 className="text-xl font-bold tracking-tight text-main mb-2">{recommendation.title}</h3>
              <p className="text-muted text-sm mb-6">AI noticed you don't have this metric tracked yet. Would you like to add it?</p>
              <button 
                onClick={handleAddRecommendation}
                disabled={isAddingRecommendation}
                className="w-full bg-surface-hover hover:bg-surface-hover text-main font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 border border-border-theme disabled:opacity-50 hover:text-accent-indigo"
              >
                {isAddingRecommendation ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {isAddingRecommendation ? 'Adding...' : 'Add to Dashboard'}
              </button>
            </div>
          </div>
        )}
      </div>

      {collabTarget && (
        <CollaborationPanel 
          targetId={collabTarget.id} 
          targetType={collabTarget.type}
          onClose={() => setCollabTarget(null)}
        />
      )}

      {/* Auto-Generate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass w-full max-w-lg rounded-2xl border border-border-theme p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-muted hover:text-main">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-main mb-2 flex items-center gap-2"><Sparkles className="text-accent-indigo" /> AI Dashboard Generator</h2>
            <p className="text-muted mb-6">Tell the AI what kind of dashboard you need, and it will instantly design and generate all the charts for you.</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-main mb-1">Select Dataset</label>
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
                <label className="block text-sm font-medium text-main mb-1">What kind of dashboard do you want?</label>
                <input type="text" value={dashboardTheme} onChange={(e) => setDashboardTheme(e.target.value)} placeholder="e.g., Executive Sales Summary, Marketing ROI" className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main focus:outline-none focus:border-indigo-500" autoFocus />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-main hover:bg-surface-hover transition">Cancel</button>
              <button onClick={handleGenerateDashboard} disabled={isGenerating || !dashboardTheme.trim()} className="bg-accent-indigo hover:bg-accent-indigo disabled:opacity-50 text-main font-medium py-2 px-6 rounded-xl transition flex items-center gap-2">
                {isGenerating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Sparkles size={18} /> Generate Magic</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <CopilotSidebar 
        isOpen={isCopilotOpen} 
        onClose={() => setIsCopilotOpen(false)} 
        onApplyFilter={(sqlModifier) => {
           alert("AI suggests applying filter: " + sqlModifier + "\n(In a full implementation, this would re-fetch widget data.)");
        }} 
      />

      <ExplainabilityDrawer
        isOpen={!!explainTargetId}
        widgetId={explainTargetId}
        onClose={() => setExplainTargetId(null)}
      />

      <TimelineSlider onTimeChange={(ts) => loadWidgets(ts)} />
    </div>
  );
};

export default DashboardOverview;
