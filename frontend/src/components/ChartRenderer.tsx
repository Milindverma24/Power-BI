import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

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

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#14b8a6'];

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
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
            <XAxis dataKey={config.xAxisKey} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#101828', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', fontFamily: 'JetBrains Mono', fontSize: '13px' }} itemStyle={{ color: '#f8fafc' }} />
            <Legend wrapperStyle={{ fontFamily: 'DM Sans', fontSize: '13px' }} />
            <Bar dataKey={config.yAxisKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
            {config.yAxisForecastKey && (
              <Bar dataKey={config.yAxisForecastKey} fill="#3b82f6" fillOpacity={0.4} radius={[4, 4, 0, 0]} name="Forecast" />
            )}
            {config.yAxisSimulationKey && (
              <Bar dataKey={config.yAxisSimulationKey} fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Simulated Scenario" />
            )}
            {benchmarkData && benchmarkData.length > 0 && (
              <Line type="monotone" dataKey="Benchmark" stroke="#ffffff" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} name="Industry Benchmark" />
            )}
          </BarChart>
        );
      case 'line':
        return (
          <AreaChart data={cleanData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
            <XAxis dataKey={config.xAxisKey} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#101828', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', fontFamily: 'JetBrains Mono', fontSize: '13px' }} itemStyle={{ color: '#f8fafc' }} />
            <Legend wrapperStyle={{ fontFamily: 'DM Sans', fontSize: '13px' }} />
            <Area type="monotone" dataKey={config.yAxisKey} stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorY)" activeDot={{ r: 6, fill: '#3b82f6', stroke: '#101828', strokeWidth: 2 }} />
            {config.yAxisForecastKey && (
              <Line type="monotone" dataKey={config.yAxisForecastKey} stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} name="Forecast" />
            )}
            {config.yAxisSimulationKey && (
              <Line type="monotone" dataKey={config.yAxisSimulationKey} stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} name="Simulated Scenario" />
            )}
            {benchmarkData && benchmarkData.length > 0 && (
              <Line type="monotone" dataKey="Benchmark" stroke="#ffffff" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} name="Industry Benchmark" />
            )}
          </AreaChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Tooltip contentStyle={{ backgroundColor: '#101828', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', fontFamily: 'JetBrains Mono', fontSize: '13px' }} itemStyle={{ color: '#f8fafc' }} />
            <Legend wrapperStyle={{ fontFamily: 'DM Sans', fontSize: '13px' }} />
            <Pie
              data={cleanData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey={config.yAxisKey}
              nameKey={config.xAxisKey}
              stroke="none"
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
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
            <XAxis dataKey={config.xAxisKey} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#101828', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', fontFamily: 'JetBrains Mono', fontSize: '13px' }} itemStyle={{ color: '#f8fafc' }} />
            <Legend wrapperStyle={{ fontFamily: 'DM Sans', fontSize: '13px' }} />
            <Bar dataKey={config.yAxisKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
            {config.yAxisForecastKey && (
              <Bar dataKey={config.yAxisForecastKey} fill="#3b82f6" fillOpacity={0.4} radius={[4, 4, 0, 0]} name="Forecast" />
            )}
            {config.yAxisSimulationKey && (
              <Bar dataKey={config.yAxisSimulationKey} fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Simulated Scenario" />
            )}
            {benchmarkData && benchmarkData.length > 0 && (
              <Line type="monotone" dataKey="Benchmark" stroke="#ffffff" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} name="Industry Benchmark" />
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
