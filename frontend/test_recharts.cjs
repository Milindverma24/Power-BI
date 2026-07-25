const recharts = require('recharts');

const components = ['BarChart', 'Bar', 'LineChart', 'Line', 'PieChart', 'Pie', 'XAxis', 'YAxis', 'CartesianGrid', 'Tooltip', 'Legend', 'ResponsiveContainer', 'Cell'];

const missing = components.filter(c => !recharts[c]);
console.log("Missing Recharts:", missing);
