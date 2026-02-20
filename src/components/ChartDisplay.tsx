import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { GeneratedChart } from '../types';

interface ChartDisplayProps {
  chart: GeneratedChart;
}

export const ChartDisplay: React.FC<ChartDisplayProps> = ({ chart }) => {
  const { plan, data, insight, plotConfig } = chart;

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="p-4 bg-slate-800/50 rounded border border-slate-700">
        <p className="text-slate-400">No data available for this chart</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700">
      <div>
        <h3 className="text-lg font-semibold text-cyan-400">{plan.title}</h3>
        <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
      </div>

      <div className="bg-slate-900/50 rounded p-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          {plan.type === 'bar' && plotConfig.xAxisKey && plotConfig.yAxisKey ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey={plotConfig.xAxisKey} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '4px',
                  color: '#e2e8f0',
                }}
              />
              <Bar dataKey={plotConfig.yAxisKey} fill="#06b6d4" />
            </BarChart>
          ) : plan.type === 'scatter' && plotConfig.xAxisKey && plotConfig.yAxisKey ? (
            <ScatterChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey={plotConfig.xAxisKey} stroke="#94a3b8" />
              <YAxis dataKey={plotConfig.yAxisKey} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '4px',
                  color: '#e2e8f0',
                }}
              />
              <Scatter dataKey={plotConfig.yAxisKey} fill="#06b6d4" />
            </ScatterChart>
          ) : plan.type === 'line' && plotConfig.xAxisKey && plotConfig.yAxisKey ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey={plotConfig.xAxisKey} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '4px',
                  color: '#e2e8f0',
                }}
              />
              <Line
                type="monotone"
                dataKey={plotConfig.yAxisKey}
                stroke="#06b6d4"
                dot={false}
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '4px',
                  color: '#e2e8f0',
                }}
              />
              <Bar dataKey="count" fill="#06b6d4" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
        <p className="text-sm text-slate-300">
          <span className="text-cyan-400 font-medium">Insight:</span> {insight}
        </p>
      </div>
    </div>
  );
};
