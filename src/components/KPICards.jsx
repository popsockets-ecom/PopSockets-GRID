import React from 'react';
import { DollarSign, ShoppingCart, TrendingUp, MapPin } from 'lucide-react';
import { fmtDollar, fmtNumber } from '../utils/formatters.js';
import { STATE_ABBR_TO_NAME } from '../services/geoDataService.js';
import { Spinner } from './design-system/Loading/Spinner.jsx';

function KPICard({ label, value, icon: Icon, color, description, loading }) {
  const colorMap = {
    purple: { bg: 'from-purple-600/20 to-purple-600/5', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    emerald: { bg: 'from-emerald-600/20 to-emerald-600/5', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
    blue: { bg: 'from-blue-600/20 to-blue-600/5', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    amber: { bg: 'from-amber-600/20 to-amber-600/5', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'bg-gradient-to-r from-amber-500 to-amber-600' },
  };
  const scheme = colorMap[color] || colorMap.purple;

  return (
    <div className={`relative bg-gradient-to-br ${scheme.bg} rounded-xl border ${scheme.border} p-5 overflow-hidden`}>
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${scheme.glow}`} />
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`text-xs font-semibold uppercase tracking-wide ${scheme.text} mb-2`}>{label}</div>
          {loading ? (
            <div className="py-2"><Spinner size="sm" color="purple" /></div>
          ) : (
            <>
              <div className="text-2xl font-bold text-white leading-none">{value}</div>
              {description && <div className="text-xs text-slate-400 mt-1.5">{description}</div>}
            </>
          )}
        </div>
        <div className={`p-2 rounded-lg bg-slate-800/50 ${scheme.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export function KPICards({ totals, topState, loading }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <KPICard
        label="Total Revenue"
        value={fmtDollar(totals?.total_revenue)}
        icon={DollarSign}
        color="purple"
        description={`Across ${fmtNumber(totals?.total_states || 0)} states`}
        loading={loading}
      />
      <KPICard
        label="Total Orders"
        value={fmtNumber(totals?.total_orders)}
        icon={ShoppingCart}
        color="emerald"
        description={`${fmtNumber(totals?.total_cities || 0)} cities`}
        loading={loading}
      />
      <KPICard
        label="Avg Order Value"
        value={fmtDollar(totals?.avg_order_value)}
        icon={TrendingUp}
        color="blue"
        loading={loading}
      />
      <KPICard
        label="Top State"
        value={topState ? (STATE_ABBR_TO_NAME[topState.state] || topState.state) : '--'}
        icon={MapPin}
        color="amber"
        description={topState ? fmtDollar(topState.revenue) : ''}
        loading={loading}
      />
    </div>
  );
}

export default KPICards;
