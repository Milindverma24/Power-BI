import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, Presentation, Loader2, Sparkles, CalendarClock, Bot, LayoutDashboard, ChevronRight } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  type: string;
  reportDate: string;
  aiGenerated: boolean;
  scheduled: boolean;
  scheduleDetails?: string;
  executiveNarrative?: string;
  contentsJson?: string;
}

const Reports = () => {
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [scheduledReports, setScheduledReports] = useState<Report[]>([]);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [recentRes, scheduledRes] = await Promise.all([
          axios.get('/api/v1/reports/recent', { headers }),
          axios.get('/api/v1/reports/scheduled', { headers })
        ]);
        
        setRecentReports(recentRes.data);
        setScheduledReports(scheduledRes.data);
        if (recentRes.data.length > 0) {
          setActiveReport(recentRes.data[0]);
        }
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post('/api/v1/reports/generate', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh reports after generation
      const headers = { Authorization: `Bearer ${token}` };
      const [recentRes, scheduledRes] = await Promise.all([
        axios.get('/api/v1/reports/recent', { headers }),
        axios.get('/api/v1/reports/scheduled', { headers })
      ]);
      setRecentReports(recentRes.data);
      setScheduledReports(scheduledRes.data);
      if (recentRes.data.length > 0) {
        setActiveReport(recentRes.data[0]);
      }
    } catch (err) {
      console.error('Failed to generate report', err);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format: string) => {
    try {
      if (format === 'story/pptx') {
         alert('Downloading PowerPoint presentation (Mock)...');
         return;
      }
      
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/v1/reports/${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `neuralbi_report.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download report", err);
      alert("Failed to download report");
    }
  };

  const parseContents = (jsonStr?: string) => {
    if (!jsonStr) return [];
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted">
        <Loader2 size={32} className="animate-spin text-accent-indigo" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-main mb-2">Reports</h1>
          <p className="text-sm text-muted font-mono">PDF &bull; Excel &bull; PowerPoint &bull; AI Narrative summaries</p>
        </div>
        <button 
          onClick={handleGenerateReport}
          className="bg-accent-indigo hover:bg-indigo-600 text-white font-medium py-2.5 px-6 rounded-xl transition flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
        >
          <Sparkles size={18} />
          AI Generate Report
        </button>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden pb-8">
        {/* Sidebar */}
        <div className="w-80 shrink-0 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-6">
          <div>
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Recent Reports</h3>
            <div className="flex flex-col gap-3">
              {recentReports.map(report => (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report)}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    activeReport?.id === report.id
                      ? 'bg-surface border-accent-indigo shadow-[0_4px_20px_rgba(59,130,246,0.1)]'
                      : 'bg-surface/50 border-border-theme hover:border-muted/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-main truncate pr-2">{report.title}</h4>
                    {report.aiGenerated && (
                      <span className="bg-accent-indigo/10 text-accent-indigo text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">AI</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted font-mono">
                    <span className="bg-surface-hover px-2 py-0.5 rounded">{report.type}</span>
                    <span>{new Date(report.reportDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Scheduled</h3>
            <div className="flex flex-col gap-3">
              {scheduledReports.map(report => (
                <div key={report.id} className="bg-surface/50 p-4 rounded-2xl border border-border-theme">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-main truncate pr-2">{report.title}</h4>
                    <div className="w-8 h-4 bg-emerald-500 rounded-full relative shrink-0">
                      <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted font-mono">
                    <CalendarClock size={12} />
                    {report.scheduleDetails}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-surface border border-border-theme rounded-[2rem] p-8 overflow-y-auto custom-scrollbar">
          {activeReport ? (
            <>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-display font-bold text-main mb-3">{activeReport.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-muted font-mono">
                    <span className="flex items-center gap-1"><CalendarClock size={14} /> {new Date(activeReport.reportDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>{parseContents(activeReport.contentsJson).length * 2} pages</span>
                    <span>{activeReport.type}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDownload('pdf')} className="text-accent-red border border-accent-red/20 hover:bg-accent-red/10 px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2">
                    <Download size={16} /> PDF
                  </button>
                  <button onClick={() => handleDownload('story/pptx')} className="text-accent-amber border border-accent-amber/20 hover:bg-accent-amber/10 px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2">
                    <Download size={16} /> PowerPoint
                  </button>
                  <button onClick={() => handleDownload('excel')} className="text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/10 px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2">
                    <Download size={16} /> Excel
                  </button>
                </div>
              </div>

              {activeReport.executiveNarrative && (
                <div className="mb-10 bg-gradient-to-r from-accent-purple/10 to-accent-indigo/5 border border-accent-purple/20 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent-purple to-accent-indigo" />
                  <div className="flex items-center gap-2 text-accent-purple font-bold text-sm mb-3">
                    <Sparkles size={16} /> AI Executive Narrative
                  </div>
                  <p className="text-main leading-relaxed text-lg font-serif italic">
                    {activeReport.executiveNarrative}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-muted mb-4">Report Contents</h3>
                <div className="flex flex-col gap-2">
                  {parseContents(activeReport.contentsJson).map((section: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center py-4 border-b border-border-theme last:border-0 hover:bg-surface-hover px-4 -mx-4 rounded-xl transition">
                      <div className="flex items-center gap-6">
                        <span className="text-muted font-mono text-sm opacity-50">{(idx + 1).toString().padStart(2, '0')}</span>
                        <span className="text-main font-medium text-lg">{section.title}</span>
                      </div>
                      <div className="flex items-center gap-4 text-muted font-mono text-sm">
                        <span>{section.pages}</span>
                        <span className="text-emerald-500">&#10003;</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-muted">
              Select a report to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
