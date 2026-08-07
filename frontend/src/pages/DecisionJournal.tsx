import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';

interface Decision {
  id: string;
  title: string;
  rationale: string;
  expectedOutcome: string;
  actualOutcome: string;
  evaluationDate: string;
  status: 'PENDING_EVALUATION' | 'SUCCESS' | 'FAILED';
  createdAt: string;
}

const DecisionJournal = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch from /api/v1/decisions
    // For demo purposes, we're using mock data to showcase the UI
    setTimeout(() => {
      setDecisions([
        {
          id: '1',
          title: 'Increase Q3 Advertising Budget by 20%',
          rationale: 'Customer acquisition cost was trending down, indicating high ad efficiency.',
          expectedOutcome: 'Increase revenue by 8% over the quarter.',
          actualOutcome: 'AI Evaluation: Revenue increased by 9.2%, outperforming expectations.',
          evaluationDate: '2026-07-01T00:00:00Z',
          status: 'SUCCESS',
          createdAt: '2026-04-01T00:00:00Z'
        },
        {
          id: '2',
          title: 'Switch to new logistics provider',
          rationale: 'Current provider had 12% late delivery rate in March.',
          expectedOutcome: 'Reduce late deliveries to under 5%.',
          actualOutcome: 'AI Evaluation: Late deliveries reduced to 4.8%.',
          evaluationDate: '2026-06-15T00:00:00Z',
          status: 'SUCCESS',
          createdAt: '2026-05-10T00:00:00Z'
        },
        {
          id: '3',
          title: 'Launch premium tier subscription',
          rationale: 'Competitor analysis suggests a gap in the premium market segment.',
          expectedOutcome: 'Convert 10% of existing user base to premium within 30 days.',
          actualOutcome: 'Pending AI Evaluation...',
          evaluationDate: '2026-08-01T00:00:00Z',
          status: 'PENDING_EVALUATION',
          createdAt: '2026-07-20T00:00:00Z'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle className="text-emerald-500" size={24} />;
      case 'FAILED': return <AlertCircle className="text-rose-500" size={24} />;
      default: return <Clock className="text-amber-500" size={24} />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-accent-emerald/10 border-emerald-500/30';
      case 'FAILED': return 'bg-rose-500/10 border-rose-500/30';
      default: return 'bg-accent-amber/10 border-amber-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="text-accent-indigo" size={32} />
        <h1 className="text-3xl font-bold text-main">Decision Journal</h1>
      </div>
      
      <p className="text-muted mb-8 max-w-3xl text-lg">
        Every major business decision is recorded here. Our AI automatically tracks your KPIs and evaluates the outcome of your decisions on the specified evaluation date, helping you build a culture of accountability and continuous learning.
      </p>

      <div className="grid gap-6">
        {decisions.map((decision) => (
          <div key={decision.id} className={`glass rounded-2xl p-6 border ${getStatusBg(decision.status)} transition-all hover:shadow-[0_4px_20px_rgba(79,70,229,0.15)]`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-main mb-1">{decision.title}</h3>
                <p className="text-sm text-muted">Made on {new Date(decision.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(decision.status)}
                <span className="font-semibold text-main">
                  {decision.status === 'PENDING_EVALUATION' ? 'Pending AI Evaluation' : decision.status}
                </span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-accent-indigo uppercase tracking-wider mb-1">Rationale</h4>
                  <p className="text-main">{decision.rationale}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-accent-amber uppercase tracking-wider mb-1">Expected Outcome</h4>
                  <p className="text-main">{decision.expectedOutcome}</p>
                </div>
              </div>
              
              <div className="bg-surface/50 rounded-xl p-4 border border-border-theme flex flex-col justify-center">
                <h4 className="text-sm font-semibold text-accent-emerald uppercase tracking-wider mb-2 flex items-center gap-2">
                  <TrendingUp size={16} /> AI Evaluation Result
                </h4>
                <p className="text-main text-lg leading-relaxed">
                  {decision.actualOutcome}
                </p>
                <p className="text-xs text-muted mt-4">Evaluated on: {new Date(decision.evaluationDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DecisionJournal;
