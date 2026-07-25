import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface ChartConfig {
  type: string;
  xAxisKey: string;
  yAxisKey: string;
  yAxisForecastKey?: string;
  yAxisSimulationKey?: string;
}

interface ChartRendererProps {
  config: ChartConfig;
  data: any[];
  benchmarkData?: any[];
}

const COLORS = ['#c0ff00', '#93ce40', '#76af24', '#ffffff', '#a855f7', '#6366f1'];

const ChartRenderer = ({ config, data, benchmarkData }: ChartRendererProps) => {
  if (!data || data.length === 0) return null;

  // Clean data so that values mapped to yAxisKey and yAxisForecastKey are actually numbers
  const cleanData = data.map((d, index) => {
    const cleaned = { ...d };
    if (d[config.yAxisKey] !== undefined) {
      cleaned[config.yAxisKey] = Number(d[config.yAxisKey]) || 0;
    }
    if (config.yAxisForecastKey && d[config.yAxisForecastKey] !== undefined) {
      cleaned[config.yAxisForecastKey] = Number(d[config.yAxisForecastKey]) || 0;
    }
    if (config.yAxisSimulationKey && d[config.yAxisSimulationKey] !== undefined) {
      cleaned[config.yAxisSimulationKey] = Number(d[config.yAxisSimulationKey]) || 0;
    }

    // Merge benchmark data if available
    if (benchmarkData && benchmarkData[index]) {
       const benchVal = benchmarkData[index][config.yAxisKey];
       cleaned['Benchmark'] = Number(benchVal) || 0;
    }

    return cleaned;
  });

  const renderChartType = () => {
    switch (config.type.toLowerCase()) {
      case 'bar':
        return (
          <BarChart data={cleanData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey={config.xAxisKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
            <Legend />
            <Bar dataKey={config.yAxisKey} fill="#c0ff00" radius={[6, 6, 0, 0]} />
            {config.yAxisForecastKey && (
              <Bar dataKey={config.yAxisForecastKey} fill="#c0ff00" fillOpacity={0.4} radius={[6, 6, 0, 0]} name="Forecast" />
            )}
            {config.yAxisSimulationKey && (
              <Bar dataKey={config.yAxisSimulationKey} fill="#a855f7" radius={[6, 6, 0, 0]} name="Simulated Scenario" />
            )}
            {benchmarkData && benchmarkData.length > 0 && (
              <Line type="monotone" dataKey="Benchmark" stroke="#ffffff" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} name="Industry Benchmark" />
            )}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={cleanData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey={config.xAxisKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
            <Legend />
            <Line type="monotone" dataKey={config.yAxisKey} stroke="#c0ff00" strokeWidth={3} dot={{ r: 4, fill: '#0a0a0a' }} activeDot={{ r: 8, fill: '#c0ff00' }} />
            {config.yAxisForecastKey && (
              <Line type="monotone" dataKey={config.yAxisForecastKey} stroke="#93ce40" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#0a0a0a' }} activeDot={{ r: 8 }} name="Forecast" />
            )}
            {config.yAxisSimulationKey && (
              <Line type="monotone" dataKey={config.yAxisSimulationKey} stroke="#a855f7" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#0a0a0a' }} activeDot={{ r: 8 }} name="Simulated Scenario" />
            )}
            {benchmarkData && benchmarkData.length > 0 && (
              <Line type="monotone" dataKey="Benchmark" stroke="#ffffff" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: '#0a0a0a' }} activeDot={{ r: 8 }} name="Industry Benchmark" />
            )}
          </LineChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
            <Legend />
            <Pie
              data={cleanData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
              outerRadius={90}
              fill="#c0ff00"
              dataKey={config.yAxisKey}
              nameKey={config.xAxisKey}
              stroke="#0a0a0a"
              strokeWidth={2}
            >
              {cleanData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      default:
        return (
          <BarChart data={cleanData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey={config.xAxisKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
            <Legend />
            <Bar dataKey={config.yAxisKey} fill="#c0ff00" radius={[6, 6, 0, 0]} />
            {config.yAxisForecastKey && (
              <Bar dataKey={config.yAxisForecastKey} fill="#c0ff00" fillOpacity={0.4} radius={[6, 6, 0, 0]} name="Forecast" />
            )}
            {config.yAxisSimulationKey && (
              <Bar dataKey={config.yAxisSimulationKey} fill="#a855f7" radius={[6, 6, 0, 0]} name="Simulated Scenario" />
            )}
            {benchmarkData && benchmarkData.length > 0 && (
              <Line type="monotone" dataKey="Benchmark" stroke="#ffffff" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} name="Industry Benchmark" />
            )}
          </BarChart>
        );
    }
  };

  return (
    <div className="w-full h-full min-h-[250px] pt-4">
      <ResponsiveContainer width="100%" height="100%">
        {renderChartType()}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartRenderer;
