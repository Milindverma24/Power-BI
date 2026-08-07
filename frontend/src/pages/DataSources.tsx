import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, FileSpreadsheet, CheckCircle2, Loader2, Database, BrainCircuit, TrendingUp, Globe, Table2, HardDrive, Trash2 } from 'lucide-react';

interface DatasetInsight {
  id: string;
  aiSummary: string;
  suggestedKpis: string;
  columnMetadata: string;
  dataQualityScore: number;
  cleaningRecommendations: string;
}

interface DataSource {
  id: string;
  name: string;
  type: string;
  status: string;
  insight: DatasetInsight | null;
  createdAt: string;
}

const DataSources = () => {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Form states
  const [dbUrl, setDbUrl] = useState('');
  const [dbUser, setDbUser] = useState('');
  const [dbPass, setDbPass] = useState('');
  const [dbQuery, setDbQuery] = useState('');
  
  const [restUrl, setRestUrl] = useState('');
  
  const [sheetId, setSheetId] = useState('');

  const fetchSources = async () => {
    try {
      const res = await axios.get('/api/v1/data-sources');
      setSources(res.data);
    } catch (err) {
      console.error("Failed to fetch data sources", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      await axios.post('/api/v1/data-sources/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchSources();
    } catch (err: any) {
      console.error("Upload failed", err);
      alert(`Failed to upload dataset.`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const importFromRest = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setActiveModal(null);
    try {
      await axios.post('/api/v1/data-sources/import/rest', { url: restUrl });
      await fetchSources();
    } catch (err) {
      alert("Failed to import from REST API");
    } finally {
      setUploading(false);
    }
  };

  const importFromSheets = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setActiveModal(null);
    try {
      await axios.post('/api/v1/data-sources/import/sheets', { sheetId });
      await fetchSources();
    } catch (err) {
      alert("Failed to import from Google Sheets");
    } finally {
      setUploading(false);
    }
  };

  const importFromDb = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setActiveModal(null);
    try {
      await axios.post('/api/v1/data-sources/import/database', {
        url: dbUrl,
        username: dbUser,
        password: dbPass,
        query: dbQuery
      });
      await fetchSources();
    } catch (err) {
      alert("Failed to import from Database");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this dataset? This will also remove any dashboards and insights associated with it.")) return;
    try {
      await axios.delete(`/api/v1/data-sources/${id}`);
      await fetchSources();
    } catch (err) {
      alert("Failed to delete dataset");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-main mb-2 flex items-center gap-3">
            <Database className="text-accent-primary" /> Data Sources
          </h1>
          <p className="text-muted">Import your datasets via file upload or external connections.</p>
        </div>
      </div>

      {/* Connection Types */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        {/* Upload Box */}
        <div 
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`glass rounded-2xl p-6 text-center border-2 border-dashed ${uploading ? 'border-accent-indigo/50 cursor-wait' : 'border-border-theme hover:border-primary-400 hover:bg-primary-900/10 cursor-pointer'} transition-all flex flex-col items-center justify-center min-h-[160px]`}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv,.xlsx,.xls,.json" className="hidden" />
          {uploading ? (
            <Loader2 className="w-10 h-10 text-accent-primary animate-spin mb-2" />
          ) : (
            <>
              <UploadCloud className="w-10 h-10 text-accent-primary mb-2" />
              <h3 className="font-medium text-main">Upload File</h3>
              <p className="text-xs text-muted mt-1">CSV, Excel, JSON</p>
            </>
          )}
        </div>

        {/* REST Box */}
        <div onClick={() => setActiveModal('rest')} className="glass rounded-2xl p-6 text-center border border-border-theme hover:border-indigo-400 hover:bg-indigo-900/10 cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px]">
          <Globe className="w-10 h-10 text-accent-indigo mb-2" />
          <h3 className="font-medium text-main">REST API</h3>
          <p className="text-xs text-muted mt-1">Fetch JSON payload</p>
        </div>

        {/* Sheets Box */}
        <div onClick={() => setActiveModal('sheets')} className="glass rounded-2xl p-6 text-center border border-border-theme hover:border-emerald-400 hover:bg-emerald-900/10 cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px]">
          <Table2 className="w-10 h-10 text-accent-emerald mb-2" />
          <h3 className="font-medium text-main">Google Sheets</h3>
          <p className="text-xs text-muted mt-1">Import via public ID</p>
        </div>

        {/* DB Box */}
        <div onClick={() => setActiveModal('db')} className="glass rounded-2xl p-6 text-center border border-border-theme hover:border-orange-400 hover:bg-orange-900/10 cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px]">
          <HardDrive className="w-10 h-10 text-orange-400 mb-2" />
          <h3 className="font-medium text-main">Database</h3>
          <p className="text-xs text-muted mt-1">SQL Query Import</p>
        </div>
      </div>

      {/* Datasets Grid */}
      <h2 className="text-xl font-semibold text-main mb-6">Your Datasets</h2>
      
      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-accent-indigo" /></div>
      ) : sources.length === 0 ? (
        <div className="text-center p-8 text-muted glass rounded-2xl">No datasets imported yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {sources.map((source) => (
            <div key={source.id} className="glass rounded-2xl p-6 relative overflow-hidden group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 rounded-xl text-accent-emerald">
                    <FileSpreadsheet size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-main">{source.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted mt-1">
                      <span className="px-2 py-0.5 bg-surface-hover rounded-xl text-xs">{source.type}</span>
                      <span>•</span>
                      <span>{new Date(source.createdAt).toLocaleDateString()}</span>
                      {source.status === 'READY' && (
                        <span className="flex items-center gap-1 text-accent-emerald ml-2">
                          <CheckCircle2 size={14} /> Ready
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(source.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors" title="Delete Dataset">
                  <Trash2 size={18} />
                </button>
              </div>

              {source.insight && (
                <div className="mt-6 bg-surface/50 rounded-xl p-5 border border-accent-primary/20">
                  <div className="flex items-center gap-2 mb-3 text-accent-primary font-medium">
                    <BrainCircuit size={18} />
                    AI Dataset Understanding
                  </div>
                  <p className="text-main text-sm leading-relaxed mb-5">
                    {source.insight.aiSummary}
                  </p>
                  
                  <div className="flex items-start gap-2 text-accent-purple font-medium mb-2">
                    <TrendingUp size={18} className="mt-0.5" />
                    Suggested KPIs
                  </div>
                  <div className="text-main text-sm whitespace-pre-line pl-6 border-l-2 border-purple-500/30">
                    {source.insight.suggestedKpis}
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-border-theme">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-accent-indigo font-medium">
                        <CheckCircle2 size={18} />
                        AI Data Quality Score
                      </div>
                      <div className={`text-2xl font-bold ${source.insight.dataQualityScore >= 80 ? 'text-accent-emerald' : source.insight.dataQualityScore >= 60 ? 'text-accent-amber' : 'text-accent-red'}`}>
                         {source.insight.dataQualityScore}%
                      </div>
                    </div>
                    {source.insight.cleaningRecommendations && source.insight.cleaningRecommendations.toLowerCase() !== 'no cleaning recommendations.' && (
                      <div className="bg-accent-indigo/10 border border-accent-indigo/20 rounded-xl p-4 mb-4">
                        <div className="text-xs font-bold text-accent-indigo uppercase tracking-wider mb-2">Cleaning Recommendations</div>
                        <div className="text-main text-sm whitespace-pre-line">
                          {source.insight.cleaningRecommendations}
                        </div>
                      </div>
                    )}
                    <span className="text-xs font-mono text-muted">DETECTED COLUMNS: {source.insight.columnMetadata}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {activeModal === 'rest' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass p-8 rounded-2xl w-full max-w-md animate-slide-up">
            <h2 className="text-2xl font-bold text-main mb-4">REST API Import</h2>
            <form onSubmit={importFromRest} className="space-y-4">
              <div>
                <label className="block text-sm text-main mb-1">API URL (GET request)</label>
                <input type="url" required value={restUrl} onChange={e => setRestUrl(e.target.value)} className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main" placeholder="https://api.example.com/data" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setActiveModal(null)} className="flex-1 bg-surface-hover text-main py-3 rounded-xl hover:bg-surface-hover">Cancel</button>
                <button type="submit" className="flex-1 bg-accent-indigo text-white py-3 rounded-xl hover:bg-accent-indigo">Import</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'sheets' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass p-8 rounded-2xl w-full max-w-md animate-slide-up">
            <h2 className="text-2xl font-bold text-main mb-4">Google Sheets Import</h2>
            <form onSubmit={importFromSheets} className="space-y-4">
              <div>
                <label className="block text-sm text-main mb-1">Public Sheet ID</label>
                <input type="text" required value={sheetId} onChange={e => setSheetId(e.target.value)} className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main" placeholder="1BxiMVs0XRYFg..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setActiveModal(null)} className="flex-1 bg-surface-hover text-main py-3 rounded-xl hover:bg-surface-hover">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-500 text-main py-3 rounded-xl hover:bg-emerald-600">Import</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'db' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass p-8 rounded-2xl w-full max-w-md animate-slide-up">
            <h2 className="text-2xl font-bold text-main mb-4">Database Import</h2>
            <form onSubmit={importFromDb} className="space-y-4">
              <div>
                <label className="block text-sm text-main mb-1">JDBC URL</label>
                <input type="text" required value={dbUrl} onChange={e => setDbUrl(e.target.value)} className="w-full bg-surface border border-border-theme rounded-xl p-2 text-main" placeholder="jdbc:postgresql://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-main mb-1">Username</label>
                  <input type="text" required value={dbUser} onChange={e => setDbUser(e.target.value)} className="w-full bg-surface border border-border-theme rounded-xl p-2 text-main" />
                </div>
                <div>
                  <label className="block text-sm text-main mb-1">Password</label>
                  <input type="password" required value={dbPass} onChange={e => setDbPass(e.target.value)} className="w-full bg-surface border border-border-theme rounded-xl p-2 text-main" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-main mb-1">SQL Query</label>
                <textarea required value={dbQuery} onChange={e => setDbQuery(e.target.value)} className="w-full bg-surface border border-border-theme rounded-xl p-2 text-main h-24" placeholder="SELECT * FROM sales" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setActiveModal(null)} className="flex-1 bg-surface-hover text-main py-3 rounded-xl hover:bg-surface-hover">Cancel</button>
                <button type="submit" className="flex-1 bg-orange-500 text-main py-3 rounded-xl hover:bg-orange-600">Import</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSources;
