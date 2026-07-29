import { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Activity, Plus, BrainCircuit } from 'lucide-react';
import CreateKpiModal from '../components/CreateKpiModal';

interface Kpi {
  id: string;
  name: string;
  targetValue: number;
  actualValue: number;
  healthStatus: string;
  aiExplanation: string;
  lastEvaluatedAt: string;
  dataSource: {
    name: string;
  };
}

const KpiDashboard = () => {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchKpis = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/kpi', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKpis(res.data);
    } catch (err) {
      console.error('Failed to load KPIs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKpis();
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'GREEN') return 'bg-accent-emerald/10 text-emerald-500 border-accent-emerald/20';
    if (status === 'YELLOW') return 'bg-accent-amber/10 text-amber-500 border-accent-amber/20';
    if (status === 'RED') return 'bg-accent-red/10 text-red-500 border-accent-red/20';
    return 'bg-slate-500/10 text-muted border-slate-500/20';
  };

  const formatNumber = (num: number) => {
    if (num == null) return 'N/A';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-main mb-2 flex items-center gap-3">
            <Activity className="text-accent-indigo" size={32} />
            KPI Health Monitor
          </h1>
          <p className="text-muted">Define targets and let AI monitor your key performance indicators continuously.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-accent-indigo hover:bg-accent-indigo text-white font-medium py-2.5 px-6 rounded-xl transition flex items-center gap-2 shadow-[0_4px_20px_rgba(79,70,229,0.15)] shadow-accent-indigo/20"
        >
          <Plus size={20} />
          Define KPI
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-indigo"></div>
        </div>
      ) : kpis.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl border border-border-theme flex flex-col items-center">
          <Target size={48} className="text-muted mb-4" />
          <h3 className="text-xl font-medium text-main mb-2">No KPIs Defined</h3>
          <p className="text-muted max-w-md mx-auto mb-6">
            You haven't set up any Key Performance Indicators yet. Define your business targets and our AI will monitor them.
          </p>
          <button onClick={() => setIsModalOpen(true)} className="bg-white/10 hover:bg-white/20 text-main py-2 px-6 rounded-xl transition">
            Create First KPI
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {kpis.map((kpi) => (
            <div key={kpi.id} className="glass rounded-2xl border border-border-theme p-6 flex flex-col hover:border-border-theme/50 transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-main mb-1">{kpi.name}</h3>
                  <p className="text-xs text-muted uppercase tracking-wider">Source: {kpi.dataSource?.name || 'Unknown'}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(kpi.healthStatus)}`}>
                  {kpi.healthStatus || 'PENDING'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface/50 rounded-xl p-4 border border-border-theme">
                  <div className="text-sm text-muted mb-1">Target</div>
                  <div className="text-2xl font-bold text-main">{formatNumber(kpi.targetValue)}</div>
                </div>
                <div className="bg-surface/50 rounded-xl p-4 border border-border-theme">
                  <div className="text-sm text-muted mb-1">Actual</div>
                  <div className="text-2xl font-bold text-main">{formatNumber(kpi.actualValue)}</div>
                </div>
              </div>
              
              <div className="mt-auto">
                <div className="flex items-start gap-3 bg-accent-indigo/10 rounded-xl p-4 border border-accent-indigo/20">
                  <BrainCircuit className="text-accent-indigo shrink-0 mt-0.5" size={20} />
                  <div>
                    <div className="text-xs font-bold text-accent-indigo uppercase tracking-wider mb-1">AI Health Analysis</div>
                    <p className="text-sm text-muted leading-relaxed">
                      {kpi.aiExplanation || 'Evaluating...'}
                    </p>
                  </div>
                </div>
                <div className="text-right mt-3">
                  <span className="text-[10px] text-muted">
                    Last updated: {kpi.lastEvaluatedAt ? new Date(kpi.lastEvaluatedAt).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateKpiModal
          onClose={() => setIsModalOpen(false)}
          onKpiCreated={() => {
            fetchKpis();
          }}
        />
      )}
    </div>
  );
};

export default KpiDashboard;
