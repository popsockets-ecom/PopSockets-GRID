import React from 'react';
import { DollarSign, ShoppingCart, MapPin } from 'lucide-react';
import { fmtDollar, fmtNumber } from '../utils/formatters.js';
import { STATE_ABBR_TO_NAME } from '../services/geoDataService.js';
import { Spinner } from './design-system/Loading/Spinner.jsx';
import { InfoTip } from './InfoTip.jsx';

const COLOR_SCHEMES = {
  purple: { label: 'text-purple-400', glow: 'from-purple-500 to-purple-600' },
  green:  { label: 'text-green-400',  glow: 'from-green-500 to-green-600' },
  cyan:   { label: 'text-cyan-400',   glow: 'from-cyan-500 to-cyan-600' },
  orange: { label: 'text-orange-400', glow: 'from-orange-500 to-orange-600' },
};

function KPICard({ label, value, icon: Icon, color, loading, tooltip }) {
  const scheme = COLOR_SCHEMES[color] || COLOR_SCHEMES.purple;

  return (
    <div className="relative bg-slate-800 rounded-xl border border-slate-700 px-5 py-4 overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${scheme.glow}`} />
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className={`text-xs font-semibold uppercase tracking-wide ${scheme.label} mb-1.5`}>
            {label}
            {tooltip && <InfoTip text={tooltip} label={label} color={color} />}
          </div>
          {loading ? (
            <div className="py-1"><Spinner size="sm" color="purple" /></div>
          ) : (
            <div className="text-2xl font-bold text-white leading-none">{value}</div>
          )}
        </div>
        <div className={`p-2 rounded-lg bg-slate-700/50 ${scheme.label}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export function KPICards({ totals, topState, loading, selectedState, stateData, cityData, drillLoading }) {
  const isStateView = Boolean(selectedState);
  const selectedRow = isStateView
    ? stateData?.find((r) => r.state === selectedState)
    : null;
  const topCity = isStateView ? cityData?.[0] : null;

  const revenueValue = isStateView ? selectedRow?.revenue : totals?.total_revenue;
  const ordersValue = isStateView ? selectedRow?.order_count : totals?.total_orders;

  const stateName = selectedState ? (STATE_ABBR_TO_NAME[selectedState] || selectedState) : '';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <KPICard
        label={isStateView ? `${stateName} Revenue` : 'Total Revenue'}
        value={fmtDollar(revenueValue)}
        icon={DollarSign}
        color="purple"
        loading={loading}
        tooltip={
          isStateView
            ? `Total net product revenue from US DTC orders shipped to ${stateName} for the selected date range.`
            : 'Total net product revenue from US DTC orders shipped to valid US addresses for the selected date range.'
        }
      />
      <KPICard
        label={isStateView ? `${stateName} Orders` : 'Total Orders'}
        value={fmtNumber(ordersValue)}
        icon={ShoppingCart}
        color="green"
        loading={loading}
        tooltip={
          isStateView
            ? `Count of unique US DTC orders shipped to ${stateName}. Each order number is counted once regardless of line items.`
            : 'Count of unique US DTC orders shipped to US addresses. Each order number is counted once regardless of line items.'
        }
      />
      {isStateView ? (
        <KPICard
          label="Top City"
          value={topCity ? topCity.city : '--'}
          icon={MapPin}
          color="orange"
          loading={drillLoading}
          tooltip={`The city in ${stateName} with the highest total revenue for the selected date range.`}
        />
      ) : (
        <KPICard
          label="Top State"
          value={topState ? (STATE_ABBR_TO_NAME[topState.state] || topState.state) : '--'}
          icon={MapPin}
          color="orange"
          loading={loading}
          tooltip="The state with the highest total revenue for the selected date range."
        />
      )}
    </div>
  );
}

export default KPICards;
