import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader2 } from 'lucide-react';

interface CreateKpiModalProps {
  onClose: () => void;
  onKpiCreated: () => void;
}

const CreateKpiModal = ({ onClose, onKpiCreated }: CreateKpiModalProps) => {
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [dataSourceId, setDataSourceId] = useState('');
  const [name, setName] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [nlQuery, setNlQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDataSources();
  }, []);

  const fetchDataSources = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/data-sources', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDataSources(res.data);
      if (res.data.length > 0) {
        setDataSourceId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load data sources', err);
      setError('Failed to load data sources');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/v1/kpi', {
        dataSourceId,
        name,
        targetValue: parseFloat(targetValue),
        nlQuery
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onKpiCreated();
      onClose();
    } catch (err: any) {
      console.error('Failed to create KPI', err);
      setError(err.response?.data || 'Failed to create KPI');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border-theme p-6 rounded-2xl shadow-[0_4px_20px_rgba(79,70,229,0.15)] w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-main">Create New KPI</h2>
          <button onClick={onClose} className="text-muted hover:text-main transition">
            <X size={24} />
          </button>
        </div>

        {error && <div className="bg-accent-red/10 border border-accent-red/50 text-red-500 p-3 rounded-2xl mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-main mb-1">Data Source</label>
            <select
              value={dataSourceId}
              onChange={(e) => setDataSourceId(e.target.value)}
              className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main focus:ring-2 focus:ring-primary-500 outline-none"
              required
            >
              <option value="" disabled>Select a data source...</option>
              {dataSources.map((ds: any) => (
                <option key={ds.id} value={ds.id}>{ds.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-main mb-1">KPI Name (e.g. Total Revenue)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-main mb-1">Target Value</label>
            <input
              type="number"
              step="any"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-main mb-1">Calculation Prompt</label>
            <p className="text-xs text-muted mb-2">Tell the AI how to calculate this KPI from the dataset.</p>
            <textarea
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              placeholder="e.g. Calculate the sum of the revenue column."
              className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main focus:ring-2 focus:ring-primary-500 outline-none resize-none h-24"
              required
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading || !dataSourceId}
              className="bg-accent-indigo hover:bg-accent-indigo text-main font-medium py-2 px-6 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save KPI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateKpiModal;
