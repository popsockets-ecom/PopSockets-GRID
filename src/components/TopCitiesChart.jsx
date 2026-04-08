import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Building2 } from 'lucide-react';
import { fmtDollar, fmtNumber } from '../utils/formatters.js';
import { Spinner } from './design-system/Loading/Spinner.jsx';

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 shadow-xl">
      <div className="text-xs font-semibold text-white">{d.label}</div>
      <div className="text-sm font-bold text-purple-300 mt-0.5">{fmtDollar(d.revenue)}</div>
      <div className="text-[10px] text-slate-400">{fmtNumber(d.order_count)} orders</div>
    </div>
  );
}

export function TopCitiesChart({ data = [], loading }) {
  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      label: `${d.city}, ${d.state}`,
    }));
  }, [data]);

  const maxRev = useMemo(() => Math.max(...chartData.map(d => d.revenue), 1), [chartData]);

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-700/50 flex items-center gap-2">
        <Building2 className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-white">Top 50 Cities by Revenue</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="md" color="purple" /></div>
      ) : chartData.length === 0 ? (
        <div className="text-sm text-slate-500 italic text-center py-12">No data for this period</div>
      ) : (
        <div className="px-4 py-3">
          <ResponsiveContainer width="100%" height={chartData.length * 26 + 20}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 60, bottom: 4, left: 0 }}
              barCategoryGap={2}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                width={140}
                tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'system-ui' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.08)' }} />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={18}>
                {chartData.map((entry, i) => {
                  const intensity = 0.4 + (entry.revenue / maxRev) * 0.6;
                  return (
                    <Cell
                      key={i}
                      fill={`rgba(139, 92, 246, ${intensity})`}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default TopCitiesChart;
