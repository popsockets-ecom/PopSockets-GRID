import React from 'react';
import { DollarSign, ShoppingCart, TrendingUp, MapPin } from 'lucide-react';
import { fmtDollar, fmtNumber } from '../utils/formatters.js';
import { STATE_ABBR_TO_NAME } from '../services/geoDataService.js';
import { Spinner } from './design-system/Loading/Spinner.jsx';

// Matches PATH's StatCard pattern exactly:
// bg-slate-800, border-slate-700, colored glow line at top, colored label text
const COLOR_SCHEMES = {
  purple: { label: 'text-purple-400', glow: 'from-purple-500 to-purple-600' },
  green:  { label: 'text-green-400',  glow: 'from-green-500 to-green-600' },
  cyan:   { label: 'text-cyan-400',   glow: 'from-cyan-500 to-cyan-600' },
  orange: { label: 'text-orange-400', glow: 'from-orange-500 to-orange-600' },
};

function KPICard({ label, value, icon: Icon, color, description, loading }) {
  const scheme = COLOR_SCHEMES[color] || COLOR_SCHEMES.purple;

  return (
    <div className="relative bg-slate-800 rounded-xl border border-slate-700 p-5 overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${scheme.glow}`} />
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`text-xs font-semibold uppercase tracking-wide ${scheme.label} mb-2`}>{label}</div>
          {loading ? (
            <div className="py-2"><Spinner size="sm" color="purple" /></div>
          ) : (
            <>
              <div className="text-2xl font-bold text-white leading-none">{value}</div>
              {description && <div className="text-xs text-slate-400 mt-1.5">{description}</div>}
            </>
          )}
        </div>
        <div className={`p-2 rounded-lg bg-slate-700/50 ${scheme.label}`}>
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
        color="green"
        description={`${fmtNumber(totals?.total_cities || 0)} cities`}
        loading={loading}
      />
      <KPICard
        label="Avg Order Value"
        value={fmtDollar(totals?.avg_order_value)}
        icon={TrendingUp}
        color="cyan"
        loading={loading}
      />
      <KPICard
        label="Top State"
        value={topState ? (STATE_ABBR_TO_NAME[topState.state] || topState.state) : '--'}
        icon={MapPin}
        color="orange"
        description={topState ? fmtDollar(topState.revenue) : ''}
        loading={loading}
      />
    </div>
  );
}

export default KPICards;
