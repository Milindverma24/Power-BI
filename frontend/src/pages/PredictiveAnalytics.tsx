import { useState, useEffect } from 'react';
import axios from 'axios';
import ChartRenderer from '../components/ChartRenderer';
import { LineChart, Loader2, Play, Sparkles, TrendingUp } from 'lucide-react';

const PredictiveAnalytics = () => {
  const [widgets, setWidgets] = useState<any[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<any | null>(null);
  const [forecastData, setForecastData] = useState<any[] | null>(null);
  const [isForecasting, setIsForecasting] = useState(false);
  const [simulationQuery, setSimulationQuery] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/v1/dashboard/widgets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWidgets(res.data);
      } catch (err) {
        console.error("Failed to load widgets", err);
      }
    };
    fetchWidgets();
  }, []);

  const handleForecast = async () => {
    if (!selectedWidget) return;
    setIsForecasting(true);
    try {
      const token = localStorage.getItem('token');
      const config = JSON.parse(selectedWidget.chartConfig);
      const res = await axios.post(`/api/v1/predict/forecast/${selectedWidget.id}`, {
        xAxisKey: config.xAxisKey,
        yAxisKey: config.yAxisKey
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForecastData(res.data);
    } catch (err) {
      alert("Failed to generate forecast");
    } finally {
      setIsForecasting(false);
    }
  };

  const handleSimulate = async () => {
    if (!selectedWidget || !simulationQuery.trim()) return;
    setIsSimulating(true);
    try {
      const token = localStorage.getItem('token');
      const config = JSON.parse(selectedWidget.chartConfig);
      const res = await axios.post(`/api/v1/predict/simulate/${selectedWidget.id}`, {
        yAxisKey: config.yAxisKey,
        instruction: simulationQuery
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle setting simulated data to a chart
      setForecastData(res.data);
    } catch (err) {
      alert("Failed to simulate scenario");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp className="text-accent-indigo" size={32} />
        <h1 className="text-3xl font-bold text-main">Predictive Analytics</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass rounded-2xl p-6 border border-border-theme flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-main mb-2">Select Metric to Analyze</label>
            <div className="flex gap-2 overflow-x-auto p-1.5 bg-surface rounded-2xl border border-border-theme">
              {widgets.map(w => (
                <button
                  key={w.id}
                  onClick={() => setSelectedWidget(w)}
                  className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    selectedWidget?.id === w.id
                      ? 'bg-accent-indigo text-white shadow-[0_0_15px_rgba(79,70,229,0.2)]'
                      : 'text-muted hover:text-main hover:bg-white/[0.05]'
                  }`}
                >
                  {w.title}
                </button>
              ))}
              {widgets.length === 0 && <span className="text-muted text-sm py-2 px-2">No metrics available</span>}
            </div>
          </div>

          <div className="pt-6 border-t border-border-theme">
            <h3 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
              <LineChart size={18} className="text-accent-indigo"/> AI Forecast
            </h3>
            <p className="text-sm text-muted mb-4">Extrapolate future trends based on historical data using mathematical modeling.</p>
            <button 
              onClick={handleForecast}
              disabled={!selectedWidget || isForecasting}
              className="w-full bg-accent-indigo hover:bg-accent-indigo disabled:opacity-50 text-main font-medium py-3 rounded-xl transition flex justify-center items-center gap-2"
            >
              {isForecasting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              Generate Forecast
            </button>
          </div>

          <div className="pt-6 border-t border-border-theme">
            <h3 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
              <Play size={18} className="text-accent-emerald"/> Scenario Simulator
            </h3>
            <p className="text-sm text-muted mb-4">Ask 'What-if' questions to see how metrics might change under new conditions.</p>
            <input 
              type="text" 
              placeholder="e.g., Increase marketing spend by 20%" 
              value={simulationQuery}
              onChange={(e) => setSimulationQuery(e.target.value)}
              className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main focus:outline-none focus:border-indigo-500 mb-4 text-sm"
            />
            <button 
              onClick={handleSimulate}
              disabled={!selectedWidget || !simulationQuery.trim() || isSimulating}
              className="w-full bg-surface-hover hover:bg-surface-hover border border-border-theme disabled:opacity-50 text-main font-medium py-3 rounded-xl transition flex justify-center items-center gap-2"
            >
              {isSimulating ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
              Run Simulation
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-border-theme min-h-[400px] flex flex-col">
          <h2 className="text-xl font-semibold text-main mb-6">Analysis Results</h2>
          {forecastData ? (
            <div className="flex-1 w-full h-[400px]">
              <ChartRenderer 
                config={{
                  ...JSON.parse(selectedWidget.chartConfig),
                  type: 'line', // Force line chart for predictive visualization
                  yAxisForecastKey: `${JSON.parse(selectedWidget.chartConfig).yAxisKey}_forecast`,
                  yAxisSimulationKey: isSimulating || simulationQuery ? `${JSON.parse(selectedWidget.chartConfig).yAxisKey}_simulated` : undefined
                }} 
                data={forecastData} 
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted">
              <TrendingUp size={48} className="mb-4 text-slate-600" />
              <p>Select a metric and run an analysis to see results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
