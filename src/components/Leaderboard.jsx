import React, { useState } from 'react';
import { ChevronRight, ArrowLeft, Trophy, MapPin, Building2, Hash } from 'lucide-react';
import { fmtDollar, fmtNumber, fmtDollarExact } from '../utils/formatters.js';
import { STATE_ABBR_TO_NAME } from '../services/geoDataService.js';
import { Spinner } from './design-system/Loading/Spinner.jsx';
import { InfoTip } from './InfoTip.jsx';

const MEDALS = ['bg-amber-500/20 text-amber-400 border-amber-500/30', 'bg-slate-400/20 text-slate-300 border-slate-400/30', 'bg-orange-600/20 text-orange-400 border-orange-600/30'];

function RankBadge({ rank }) {
  const style = rank <= 3 ? MEDALS[rank - 1] : 'bg-slate-700/50 text-slate-500 border-slate-600/30';
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold border ${style}`}>
      {rank}
    </span>
  );
}

function LeaderboardRow({ rank, name, revenue, orders, maxRevenue, onClick, isSelected }) {
  const pct = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group ${
        isSelected
          ? 'bg-purple-600/20 border border-purple-500/30'
          : 'hover:bg-slate-700/50 border border-transparent'
      }`}
    >
      <RankBadge rank={rank} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-white truncate">{name}</span>
          <span className="text-sm font-bold text-purple-300 ml-2 flex-shrink-0">{fmtDollar(revenue)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-violet-400 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 flex-shrink-0">{fmtNumber(orders)} ord</span>
        </div>
      </div>
      {onClick && (
        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
      )}
    </button>
  );
}

export function Leaderboard({
  stateData = [],
  cityData = [],
  zipData = [],
  selectedState,
  onStateClick,
  onBack,
  loading,
  drillLevel,
}) {
  const [tab, setTab] = useState('cities');

  // State-level view
  if (drillLevel === 'us') {
    const maxRev = stateData[0]?.revenue || 1;
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">
              Top States by Revenue
              <InfoTip label="Leaderboard" text="Top 25 US states ranked by net product revenue. Click any state to drill down into its cities and zip codes on the map." />
            </h3>
          </div>
        </div>
        <div className="p-2 max-h-[500px] overflow-y-auto scrollbar-thin">
          {loading ? (
            <div className="flex justify-center py-8"><Spinner size="md" color="purple" /></div>
          ) : stateData.length === 0 ? (
            <div className="text-sm text-slate-500 italic text-center py-8">No data for this period</div>
          ) : (
            stateData.slice(0, 25).map((d, i) => (
              <LeaderboardRow
                key={d.state}
                rank={i + 1}
                name={STATE_ABBR_TO_NAME[d.state] || d.state}
                revenue={d.revenue}
                orders={d.order_count}
                maxRevenue={maxRev}
                onClick={() => onStateClick?.(d.state)}
                isSelected={selectedState === d.state}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  // State drill-down view (cities + zips)
  const stateName = STATE_ABBR_TO_NAME[selectedState] || selectedState;
  const displayData = tab === 'cities' ? cityData : zipData;
  const maxRev = displayData[0]?.revenue || 1;

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to US Map
        </button>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-white">{stateName}</h3>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 mt-2">
          <button
            onClick={() => setTab('cities')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === 'cities' ? 'bg-purple-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Cities
          </button>
          <button
            onClick={() => setTab('zips')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === 'zips' ? 'bg-purple-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:text-white'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            Zip Codes
          </button>
        </div>
      </div>
      <div className="p-2 max-h-[440px] overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="flex justify-center py-8"><Spinner size="md" color="purple" /></div>
        ) : displayData.length === 0 ? (
          <div className="text-sm text-slate-500 italic text-center py-8">No data for this period</div>
        ) : (
          displayData.slice(0, 50).map((d, i) => (
            <LeaderboardRow
              key={tab === 'cities' ? `${d.city}-${d.state}` : `${d.zip}-${d.state}`}
              rank={i + 1}
              name={tab === 'cities' ? d.city : `${d.zip} (${d.city || ''})`}
              revenue={d.revenue}
              orders={d.order_count}
              maxRevenue={maxRev}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
