import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, X, Database, Terminal, ShieldCheck, Loader2 } from 'lucide-react';

interface ExplainabilityDrawerProps {
  widgetId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const ExplainabilityDrawer = ({ widgetId, isOpen, onClose }: ExplainabilityDrawerProps) => {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && widgetId) {
      const fetchExplanation = async () => {
        setIsLoading(true);
        setError('');
        try {
          const res = await axios.get(`http://localhost:8080/api/v1/explain/${widgetId}`);
          setReport(res.data);
        } catch (err) {
          setError('Failed to load chart explanation.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchExplanation();
    }
  }, [isOpen, widgetId]);

  if (!isOpen) return null;

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20';
    if (score >= 70) return 'text-accent-amber bg-accent-amber/10 border-accent-amber/20';
    return 'text-accent-red bg-accent-red/10 border-accent-red/20';
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[450px] bg-surface/95 backdrop-blur-2xl border-l border-border-theme shadow-[0_4px_20px_rgba(79,70,229,0.15)] z-50 flex flex-col transition-transform duration-300">
      <div className="p-6 border-b border-border-theme flex justify-between items-center bg-surface-hover/50">
        <h2 className="text-xl font-bold text-main flex items-center gap-2">
          <Sparkles className="text-accent-indigo" /> Explainability Center
        </h2>
        <button onClick={onClose} className="text-muted hover:text-main transition">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col gap-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted gap-4">
            <Loader2 size={32} className="animate-spin text-accent-indigo" />
            <p>AI is analyzing the chart and source queries...</p>
          </div>
        ) : error ? (
          <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red p-4 rounded-xl">
            {error}
          </div>
        ) : report ? (
          <>
            {/* Summary */}
            <div className="glass rounded-xl p-5 border border-border-theme">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">AI Analysis</h3>
              <p className="text-main leading-relaxed text-sm">{report.summary}</p>
            </div>

            {/* Confidence Score */}
            <div className="flex gap-4">
              <div className={`flex-1 rounded-xl p-5 border flex flex-col items-center justify-center gap-2 ${getConfidenceColor(report.confidenceScore)}`}>
                <ShieldCheck size={28} />
                <div className="text-3xl font-bold">{report.confidenceScore}%</div>
                <div className="text-xs uppercase tracking-wider font-semibold opacity-80">AI Confidence Score</div>
              </div>
            </div>

            {/* Assumptions */}
            <div className="glass rounded-xl p-5 border border-border-theme">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                <Database size={16} /> Assumptions Made
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-main">
                {report.assumptions?.map((assumption: string, i: number) => (
                  <li key={i}>{assumption}</li>
                ))}
              </ul>
            </div>

            {/* SQL Query */}
            <div className="glass rounded-xl p-5 border border-border-theme">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                <Terminal size={16} /> Source Query
              </h3>
              <pre className="bg-surface p-4 rounded-2xl overflow-x-auto text-xs text-accent-indigo font-mono border border-border-theme">
                {report.sqlQuery}
              </pre>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ExplainabilityDrawer;
