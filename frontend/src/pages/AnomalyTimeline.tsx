import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertTriangle, ShieldAlert, GitCommit, Search, Activity, CalendarDays, ArrowRight } from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: string;
  anomalyDate: string;
  createdAt: string;
  dataSource: {
    name: string;
    id: string;
  };
}

const AnomalyTimeline = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState('');
  const navigate = useNavigate();

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/v1/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(res.data);
    } catch (err) {
      console.error('Failed to load alerts', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDataSources = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/v1/data-sources', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDataSources(res.data);
      if (res.data.length > 0) {
        setSelectedDataSource(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load data sources', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchDataSources();
  }, []);

  const handleScan = async () => {
    if (!selectedDataSource) return;
    setIsScanning(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8080/api/v1/alerts/scan/${selectedDataSource}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchAlerts();
    } catch (err) {
      console.error('Failed to trigger scan', err);
      alert('Failed to trigger scan');
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'HIGH') return <ShieldAlert className="text-red-500" size={24} />;
    if (severity === 'MEDIUM') return <AlertTriangle className="text-amber-500" size={24} />;
    return <Activity className="text-blue-500" size={24} />;
  };

  const getSeverityBadge = (severity: string) => {
    if (severity === 'HIGH') return 'bg-accent-red/10 text-red-500 border-accent-red/20';
    if (severity === 'MEDIUM') return 'bg-accent-amber/10 text-amber-500 border-accent-amber/20';
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-main mb-2 flex items-center gap-3">
            <Activity className="text-accent-indigo" size={32} />
            Smart Alerts & Anomaly Timeline
          </h1>
          <p className="text-muted max-w-2xl">
            The AI continuously monitors your data sources for sudden drops, spikes, or unusual patterns. Every unusual event is documented below in a Git-style timeline.
          </p>
        </div>

        <div className="w-full">
          <div className="flex gap-2 overflow-x-auto p-1.5 bg-surface rounded-2xl border border-border-theme mb-4">
            {dataSources.map(ds => (
              <button
                key={ds.id}
                onClick={() => setSelectedDataSource(ds.id)}
                className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  selectedDataSource === ds.id
                    ? 'bg-accent-indigo text-white shadow-[0_0_15px_rgba(79,70,229,0.2)]'
                    : 'text-muted hover:text-main hover:bg-white/[0.05]'
                }`}
              >
                {ds.name}
              </button>
            ))}
          </div>
          <button
            onClick={handleScan}
            disabled={isScanning || !selectedDataSource}
            className="w-full bg-accent-indigo hover:bg-accent-indigo text-white font-semibold py-3 px-4 rounded-xl transition flex justify-center items-center gap-2 disabled:opacity-50 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
          >
            <Search size={18} className={isScanning ? 'animate-spin' : ''} />
            {isScanning ? 'Scanning...' : 'Scan for Anomalies'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-indigo"></div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl border border-border-theme flex flex-col items-center">
          <ShieldAlert size={48} className="text-muted mb-4" />
          <h3 className="text-xl font-medium text-main mb-2">No Anomalies Detected</h3>
          <p className="text-muted max-w-md mx-auto">
            Your data looks healthy. Run a scan to let the AI check for any hidden anomalies.
          </p>
        </div>
      ) : (
        <div className="relative pl-8 border-l border-border-theme space-y-8 pb-12">
          {alerts.map((alert) => (
            <div key={alert.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-[45px] top-6 bg-surface border-2 border-border-theme rounded-full p-1.5 z-10">
                <GitCommit className="text-accent-indigo" size={16} />
              </div>

              <div 
                onClick={() => navigate('/dashboard/root-cause', { state: { autoQuery: alert.title } })}
                className="glass rounded-2xl border border-border-theme p-6 hover:border-accent-indigo transition-all cursor-pointer hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(79,70,229,0.1)] group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-main mb-1">{alert.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={14} />
                          Anomaly Date: {alert.anomalyDate || 'Unknown'}
                        </span>
                        <span>•</span>
                        <span>Source: {alert.dataSource?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity} SEVERITY
                  </div>
                </div>

                <div className="bg-surface/50 rounded-xl p-5 border border-border-theme mt-4">
                  <div className="text-xs font-bold text-accent-primary uppercase tracking-wider mb-2">AI Root Cause Analysis</div>
                  <p className="text-main leading-relaxed">
                    {alert.description}
                  </p>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-[10px] text-muted">
                    Detected on: {new Date(alert.createdAt).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-accent-indigo opacity-0 group-hover:opacity-100 transition-opacity">
                    Investigate Root Cause <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="absolute -left-[35px] bottom-0 bg-surface text-muted text-xs py-1 px-2 border border-border-theme rounded">
            End of History
          </div>
        </div>
      )}
    </div>
  );
};

export default AnomalyTimeline;
