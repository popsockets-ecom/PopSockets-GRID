import React from 'react';
import { Calendar } from 'lucide-react';

const PRESETS = [
  { id: 'last30', label: 'Last 30d' },
  { id: 'last90', label: 'Last 90d' },
  { id: 'ytd', label: 'YTD' },
  { id: 'lastYear', label: 'Last Year' },
  { id: 'allTime', label: 'All Time' },
];

export function DateRangePicker({ selectedPreset, from, to, onChange }) {
  const handlePresetClick = (presetId) => {
    const today = new Date();
    // Use Mountain Time approximation (UTC-7) for date boundaries
    const mtOffset = 7 * 60 * 60 * 1000;
    const mtNow = new Date(today.getTime() - mtOffset);
    const mtToday = mtNow.toISOString().split('T')[0];

    let newFrom, newTo;
    switch (presetId) {
      case 'last30': {
        const d = new Date(mtNow);
        d.setDate(d.getDate() - 30);
        newFrom = d.toISOString().split('T')[0];
        newTo = mtToday;
        break;
      }
      case 'last90': {
        const d = new Date(mtNow);
        d.setDate(d.getDate() - 90);
        newFrom = d.toISOString().split('T')[0];
        newTo = mtToday;
        break;
      }
      case 'ytd': {
        newFrom = `${mtNow.getUTCFullYear()}-01-01`;
        newTo = mtToday;
        break;
      }
      case 'lastYear': {
        const yr = mtNow.getUTCFullYear() - 1;
        newFrom = `${yr}-01-01`;
        newTo = `${yr}-12-31`;
        break;
      }
      case 'allTime': {
        newFrom = '2024-01-01';
        newTo = mtToday;
        break;
      }
      default:
        return;
    }
    onChange({ preset: presetId, from: newFrom, to: newTo });
  };

  const handleDateChange = (field, value) => {
    onChange({
      preset: 'custom',
      from: field === 'from' ? value : from,
      to: field === 'to' ? value : to,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Calendar className="w-4 h-4 text-slate-400" />
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={from}
          onChange={(e) => handleDateChange('from', e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
        />
        <span className="text-xs text-slate-500">to</span>
        <input
          type="date"
          value={to}
          onChange={(e) => handleDateChange('to', e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>
      <div className="flex gap-1">
        {PRESETS.map(p => (
          <button
            key={p.id}
            onClick={() => handlePresetClick(p.id)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedPreset === p.id
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DateRangePicker;
