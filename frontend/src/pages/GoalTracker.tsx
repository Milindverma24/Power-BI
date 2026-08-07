import { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Loader2, Plus, TrendingUp, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

const GoalTracker = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [widgets, setWidgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    widgetId: '',
    startValue: 0,
    targetValue: 0,
    targetDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const goalsRes = await axios.get('/api/v1/goals');
      setGoals(goalsRes.data);
      
      const widgetsRes = await axios.get('/api/v1/dashboard/widgets');
      setWidgets(widgetsRes.data);
    } catch (err) {
      console.error("Failed to load goals data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/goals', {
        ...newGoal,
        targetDate: new Date(newGoal.targetDate).toISOString()
      });
      setIsCreating(false);
      fetchData();
    } catch (err) {
      alert("Failed to create goal");
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'On Track') return 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20';
    if (status === 'At Risk') return 'text-accent-amber bg-accent-amber/10 border-accent-amber/20';
    return 'text-accent-red bg-accent-red/10 border-accent-red/20';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'On Track') return <CheckCircle size={16} />;
    if (status === 'At Risk') return <AlertTriangle size={16} />;
    return <TrendingUp size={16} className="transform rotate-180" />;
  };

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Target className="text-accent-indigo" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-main">Business Goal Tracker</h1>
            <p className="text-muted mt-1">Set targets on metrics and let AI track your velocity to success.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-accent-indigo hover:bg-accent-indigo text-main font-medium px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-[0_4px_20px_rgba(79,70,229,0.15)] shadow-accent-indigo/20"
        >
          <Plus size={18} /> New Goal
        </button>
      </div>

      {isCreating && (
        <div className="glass rounded-2xl p-6 border border-border-theme mb-8 animate-fade-in">
          <h2 className="text-xl font-semibold text-main mb-4">Create New Goal</h2>
          <form onSubmit={handleCreateGoal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-main mb-1">Goal Title</label>
              <input required type="text" className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-main mb-1">Target Dashboard Metric (Widget)</label>
              <div className="flex gap-2 overflow-x-auto p-1.5 bg-surface rounded-2xl border border-border-theme">
                {widgets.length === 0 && <span className="text-muted text-sm py-2 px-2">No widgets available</span>}
                {widgets.map(w => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setNewGoal({...newGoal, widgetId: w.id})}
                    className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      newGoal.widgetId === w.id
                        ? 'bg-accent-indigo text-white shadow-[0_0_15px_rgba(79,70,229,0.2)]'
                        : 'text-muted hover:text-main hover:bg-white/[0.05]'
                    }`}
                  >
                    {w.title}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-main mb-1">Description / Strategy</label>
              <input required type="text" className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main" value={newGoal.description} onChange={e => setNewGoal({...newGoal, description: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-main mb-1">Starting Value</label>
              <input required type="number" className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main" value={newGoal.startValue} onChange={e => setNewGoal({...newGoal, startValue: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm text-main mb-1">Target Value</label>
              <input required type="number" className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main" value={newGoal.targetValue} onChange={e => setNewGoal({...newGoal, targetValue: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm text-main mb-1">Target Date</label>
              <input required type="datetime-local" className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main" value={newGoal.targetDate} onChange={e => setNewGoal({...newGoal, targetDate: e.target.value})} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-muted hover:text-main transition">Cancel</button>
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-main font-medium px-6 py-2 rounded-xl transition">Save Goal</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted gap-4">
          <Loader2 size={32} className="animate-spin text-accent-indigo" />
          <p>Analyzing goals and calculating velocities...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted gap-4">
          <Target size={64} className="opacity-50" />
          <p className="text-lg">No active goals found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pb-8 custom-scrollbar">
          {goals.map(goal => {
            const insights = goal.insights || {};
            const progress = Math.min(100, Math.max(0, ((insights.currentValue - goal.startValue) / (goal.targetValue - goal.startValue)) * 100));
            
            return (
              <div key={goal.id} className="glass rounded-2xl p-6 border border-border-theme flex flex-col gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 border ${getStatusColor(insights.progressStatus)}`}>
                    {getStatusIcon(insights.progressStatus)}
                    {insights.progressStatus || 'Unknown'}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-main mb-1 pr-32">{goal.title}</h2>
                  <p className="text-sm text-muted">{goal.description}</p>
                </div>

                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted">Progress</span>
                      <span className="text-main font-medium">{insights.currentValue?.toLocaleString()} / {goal.targetValue?.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-3 border border-border-theme overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-accent-indigo">
                    {progress.toFixed(1)}%
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border-theme">
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar size={12}/> Target Date</div>
                    <div className="text-main text-sm">{new Date(goal.targetDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingUp size={12}/> AI Estimated</div>
                    <div className="text-accent-amber text-sm font-medium">{insights.estimatedCompletion}</div>
                  </div>
                </div>

                {insights.recommendations && (
                  <div className="bg-accent-indigo/10 border border-accent-indigo/20 rounded-xl p-4 mt-2">
                    <h3 className="text-xs font-bold text-accent-indigo uppercase tracking-wider mb-3">AI Recommendations to Accelerate</h3>
                    <ul className="text-sm text-indigo-100/80 space-y-2 list-disc pl-4">
                      {insights.recommendations.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoalTracker;
