import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, Clock, TrendingDown } from 'lucide-react';
import { Spinner } from './design-system/Loading/Spinner.jsx';
import { supabase } from '../lib/supabase.js';

// ─── Data Source Definitions (GRID-specific) ────────────────────────────────

const DATA_SOURCES = [
  {
    key: 'orders',
    label: 'Orders (Raw)',
    group: 'Pipeline',
    expectedDays: 2,
    source: 'Snowflake',
    schedule: '4x daily (6AM, 12PM, 4PM, 8PM UTC)',
    description: 'Full order-level data. Filtered to US DTC with valid state codes for geographic revenue mapping.',
  },
];

const GROUPS = ['Pipeline'];

// ─── Freshness Logic ────────────────────────────────────────────────────────

function getMountainToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Denver' }).format(new Date());
}

function daysBehind(latestDate) {
  if (!latestDate) return null;
  const today = new Date(getMountainToday() + 'T00:00:00');
  const latest = new Date(latestDate + 'T00:00:00');
  return Math.floor((today - latest) / (1000 * 60 * 60 * 24));
}

function getStatus(source, latestDate) {
  if (source.expectedDays === null) return 'reference';
  const behind = daysBehind(latestDate);
  if (behind === null) return 'unknown';
  if (behind <= source.expectedDays) return 'current';
  if (behind <= source.expectedDays + 1) return 'warning';
  return 'stale';
}

const STATUS_CONFIG = {
  current: { label: 'Current', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle, iconColor: 'text-emerald-400' },
  warning: { label: 'Behind', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: AlertTriangle, iconColor: 'text-amber-400' },
  stale: { label: 'Stale', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', icon: XCircle, iconColor: 'text-rose-400' },
  unknown: { label: 'Unknown', color: 'text-slate-500', bg: 'bg-slate-700/30 border-slate-600/30', icon: Clock, iconColor: 'text-slate-500' },
};

// ─── Quality Logic ──────────────────────────────────────────────────────────

function getQualityStatus(quality) {
  if (!quality || quality.yesterday_value === null) return null;
  const { yesterday_value, avg_7d, missing_days } = quality;
  const yv = Number(yesterday_value);
  const avg = Number(avg_7d);
  if (missing_days > 1) return 'gap';
  if (avg > 0 && yv === 0) return 'zero';
  if (avg > 0 && yv < avg * 0.3) return 'low';
  return 'ok';
}

function fmtQualityValue(val) {
  const n = Number(val);
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n.toFixed(0)}`;
}

// ─── Format Helpers ─────────────────────────────────────────────────────────

function fmtDate(dateStr) {
  if (!dateStr) return 'No data';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtRows(count) {
  if (count == null) return '';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M rows`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K rows`;
  return `${count} rows`;
}

function fmtBehind(source, latestDate) {
  const behind = daysBehind(latestDate);
  if (behind === null) return '';
  if (behind === 0) return 'Today';
  if (behind === 1) return 'Yesterday';
  return `${behind} days ago`;
}

// ─── Source Card ─────────────────────────────────────────────────────────────

function SourceCard({ source, freshness, quality }) {
  const latest = freshness?.latest_date;
  const rows = freshness?.row_count;
  const status = getStatus(source, latest);
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;
  const qStatus = getQualityStatus(quality);

  return (
    <div className={`rounded-lg border p-3 ${config.bg} transition-colors`}>
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-sm font-semibold text-white">{source.label}</p>
          <span className="text-[9px] font-medium text-slate-500 bg-slate-700/60 px-1.5 py-0.5 rounded mt-0.5 inline-block">{source.source}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${config.color}`}>{config.label}</span>
          <StatusIcon className={`w-3.5 h-3.5 ${config.iconColor}`} />
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-1.5 mb-2">{source.description}</p>
      {source.schedule && (
        <div className="flex items-center gap-1.5 mb-2">
          <Clock className="w-3 h-3 text-slate-600" />
          <span className="text-[10px] text-slate-500">{source.schedule}</span>
        </div>
      )}
      {qStatus && qStatus !== 'ok' && (
        <div className={`flex items-center gap-1.5 mb-2 px-2 py-1 rounded text-[10px] font-medium ${
          qStatus === 'zero' || qStatus === 'gap' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
        }`}>
          <TrendingDown className="w-3 h-3 flex-shrink-0" />
          {qStatus === 'gap' ? `${quality.missing_days} missing days in last 7` : `Yesterday ${fmtQualityValue(quality.yesterday_value)} vs ${fmtQualityValue(quality.avg_7d)} avg`}
        </div>
      )}
      {qStatus === 'ok' && quality && (
        <div className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
          <CheckCircle className="w-3 h-3 flex-shrink-0" />
          Yesterday {fmtQualityValue(quality.yesterday_value)} vs {fmtQualityValue(quality.avg_7d)} avg
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono ${config.color}`}>{fmtDate(latest)}</span>
          {fmtBehind(source, latest) && <span className="text-[10px] text-slate-500">{fmtBehind(source, latest)}</span>}
        </div>
        {rows != null && <span className="text-[10px] text-slate-600">{fmtRows(rows)}</span>}
      </div>
    </div>
  );
}

// ─── Summary Banner ─────────────────────────────────────────────────────────

function SummaryBanner({ freshnessByKey, qualityByKey }) {
  let current = 0, warning = 0, stale = 0, qualityIssues = 0;

  for (const s of DATA_SOURCES) {
    const status = getStatus(s, freshnessByKey[s.key]?.latest_date);
    if (status === 'current') current++;
    else if (status === 'warning') warning++;
    else if (status === 'stale') stale++;
    const q = getQualityStatus(qualityByKey[s.key]);
    if (q && q !== 'ok') qualityIssues++;
  }

  const freshnessGood = stale === 0 && warning === 0;
  const allGood = freshnessGood && qualityIssues === 0;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {allGood ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : stale > 0 ? <XCircle className="w-5 h-5 text-rose-400" /> : <AlertTriangle className="w-5 h-5 text-amber-400" />}
          <div>
            <p className={`text-sm font-semibold ${allGood ? 'text-emerald-400' : stale > 0 ? 'text-rose-400' : 'text-amber-400'}`}>
              {allGood ? 'All Data Sources Healthy' : stale > 0 ? `${stale} Source${stale > 1 ? 's' : ''} Stale` : qualityIssues > 0 ? `${qualityIssues} Quality Warning${qualityIssues > 1 ? 's' : ''}` : `${warning} Source${warning > 1 ? 's' : ''} Behind`}
            </p>
            <p className="text-xs text-slate-500">{current} current, {warning} behind, {stale} stale of {DATA_SOURCES.length} tracked source{DATA_SOURCES.length !== 1 ? 's' : ''}{qualityIssues > 0 ? ` · ${qualityIssues} with data quality warnings` : ''}</p>
          </div>
        </div>
        <p className="text-xs text-slate-600">Last checked: {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Denver' })} MT</p>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function DataHealth() {
  const [freshness, setFreshness] = useState(null);
  const [quality, setQuality] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [freshnessRes, qualityRes] = await Promise.all([
        supabase.rpc('get_data_freshness'),
        supabase.rpc('get_data_quality'),
      ]);
      if (freshnessRes.error) throw freshnessRes.error;
      setFreshness(freshnessRes.data);
      if (qualityRes.data) setQuality(qualityRes.data);
    } catch (err) {
      console.error('Data health fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const freshnessByKey = {};
  if (freshness) for (const row of freshness) freshnessByKey[row.source_name] = row;
  const qualityByKey = {};
  if (quality) for (const row of quality) qualityByKey[row.source_name] = row;

  if (loading && !freshness) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-32">
          <Spinner size="lg" color="purple" />
          <p className="mt-4 text-sm text-slate-400">Checking data sources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-1"><SummaryBanner freshnessByKey={freshnessByKey} qualityByKey={qualityByKey} /></div>
        <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-sm text-white transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Recheck
        </button>
      </div>

      {GROUPS.map(group => {
        const groupSources = DATA_SOURCES.filter(s => s.group === group);
        return (
          <div key={group}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{group}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupSources.map(source => (
                <SourceCard key={source.key} source={source} freshness={freshnessByKey[source.key]} quality={qualityByKey[source.key]} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
