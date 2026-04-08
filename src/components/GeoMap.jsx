import React, { useState, useMemo, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleQuantize } from 'd3-scale';
import { fmtDollar, fmtNumber } from '../utils/formatters.js';
import { FIPS_TO_ABBR, STATE_ABBR_TO_NAME } from '../services/geoDataService.js';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const COLOR_RANGE = [
  '#1e293b', // slate-800 (lowest)
  '#312e81', // indigo-900
  '#4c1d95', // violet-900
  '#6d28d9', // violet-700
  '#7c3aed', // violet-600
  '#8b5cf6', // violet-500
  '#a78bfa', // violet-400
  '#c4b5fd', // violet-300
  '#ddd6fe', // violet-200 (highest)
];

export function GeoMap({ stateData = [], onStateClick, selectedState, totals }) {
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const revenueByState = useMemo(() => {
    const map = {};
    stateData.forEach(d => { map[d.state] = d; });
    return map;
  }, [stateData]);

  const colorScale = useMemo(() => {
    const revenues = stateData.map(d => d.revenue).filter(r => r > 0);
    if (revenues.length === 0) return () => COLOR_RANGE[0];
    return scaleQuantize()
      .domain([Math.min(...revenues), Math.max(...revenues)])
      .range(COLOR_RANGE);
  }, [stateData]);

  const handleMouseMove = useCallback((e) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const maxRevenue = useMemo(() => {
    return Math.max(...stateData.map(d => d.revenue), 1);
  }, [stateData]);

  return (
    <div className="relative" onMouseMove={handleMouseMove}>
      {/* Map */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{ scale: 1000 }}
          width={800}
          height={500}
          style={{ width: '100%', height: 'auto' }}
        >
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const fips = geo.id;
                  const abbr = FIPS_TO_ABBR[fips];
                  const stateInfo = revenueByState[abbr];
                  const revenue = stateInfo?.revenue || 0;
                  const isHovered = hoveredState === abbr;
                  const isSelected = selectedState === abbr;
                  const fillColor = revenue > 0 ? colorScale(revenue) : '#0f172a';

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => setHoveredState(abbr)}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => abbr && onStateClick?.(abbr)}
                      style={{
                        default: {
                          fill: isSelected ? '#a78bfa' : fillColor,
                          stroke: isSelected ? '#c4b5fd' : '#334155',
                          strokeWidth: isSelected ? 1.5 : 0.5,
                          outline: 'none',
                          transition: 'fill 0.2s ease, stroke 0.2s ease',
                          cursor: 'pointer',
                        },
                        hover: {
                          fill: isSelected ? '#c4b5fd' : (revenue > 0 ? '#a78bfa' : '#1e293b'),
                          stroke: '#c4b5fd',
                          strokeWidth: 1.5,
                          outline: 'none',
                          cursor: 'pointer',
                          filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))',
                        },
                        pressed: {
                          fill: '#8b5cf6',
                          stroke: '#c4b5fd',
                          strokeWidth: 2,
                          outline: 'none',
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Color legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700/50">
          <span className="text-[10px] text-slate-400 font-medium">LOW</span>
          <div className="flex gap-0.5">
            {COLOR_RANGE.map((color, i) => (
              <div key={i} className="w-5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">HIGH</span>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredState && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: tooltipPos.x + 12,
            top: tooltipPos.y - 10,
          }}
        >
          <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 shadow-xl min-w-[160px]">
            <div className="text-xs font-semibold text-white mb-1">
              {STATE_ABBR_TO_NAME[hoveredState] || hoveredState}
            </div>
            {revenueByState[hoveredState] ? (
              <>
                <div className="text-sm font-bold text-purple-300">
                  {fmtDollar(revenueByState[hoveredState].revenue)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {fmtNumber(revenueByState[hoveredState].order_count)} orders
                </div>
                <div className="mt-1.5 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-violet-400 rounded-full transition-all"
                    style={{ width: `${Math.min((revenueByState[hoveredState].revenue / maxRevenue) * 100, 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-500">No data</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GeoMap;
