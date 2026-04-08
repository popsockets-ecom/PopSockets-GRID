import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { scaleLog, scaleSqrt } from 'd3-scale';
import { fmtDollar, fmtNumber } from '../utils/formatters.js';
import { FIPS_TO_ABBR, STATE_ABBR_TO_NAME } from '../services/geoDataService.js';
import { getCityCoordinates } from '../data/cityCoords.js';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

// Inverted: light = low revenue, dark/saturated = high revenue
const COLOR_RANGE = [
  '#e0d5ff', '#c4b5fd', '#a78bfa', '#8b6cf5', '#7c5ce6',
  '#6d4fcc', '#5b45b2', '#4c3d99', '#3b2580',
];

// State center coordinates for zoom targeting
const STATE_CENTERS = {
  AL:[-86.8,32.8],AK:[-153,64],AZ:[-111.7,34.3],AR:[-92.2,34.8],CA:[-119.5,37.2],
  CO:[-105.5,39],CT:[-72.7,41.6],DE:[-75.5,39],FL:[-82.4,28.6],GA:[-83.5,32.7],
  HI:[-157,20.5],ID:[-114.6,44.4],IL:[-89.2,40],IN:[-86.3,39.8],IA:[-93.5,42],
  KS:[-98.3,38.5],KY:[-85.7,37.8],LA:[-92,31],ME:[-69,45.4],MD:[-76.8,39.1],
  MA:[-71.8,42.2],MI:[-85,44.3],MN:[-94.3,46.3],MS:[-89.7,32.7],MO:[-92.5,38.4],
  MT:[-109.6,47],NE:[-99.8,41.5],NV:[-116.9,39.5],NH:[-71.6,43.7],NJ:[-74.7,40.1],
  NM:[-106,34.5],NY:[-75.5,42.9],NC:[-79.4,35.6],ND:[-100.5,47.4],OH:[-82.8,40.3],
  OK:[-97.5,35.6],OR:[-120.5,44],PA:[-77.8,40.9],RI:[-71.5,41.7],SC:[-80.9,33.9],
  SD:[-100.2,44.4],TN:[-86.4,35.9],TX:[-99.4,31.5],UT:[-111.7,39.3],VT:[-72.7,44],
  VA:[-78.9,37.5],WA:[-120.5,47.4],WV:[-80.6,38.6],WI:[-89.8,44.6],WY:[-107.5,43],
  DC:[-77,38.9],
};

// Zoom level per state (bigger states need less zoom)
function getStateZoom(abbr) {
  const big = { AK:2.5, TX:4.5, CA:4.5, MT:5.5, NM:5.5, AZ:5.5, NV:5.5, CO:6, OR:5.5, WY:6.5 };
  const small = { RI:14, DE:12, CT:10, NJ:9, NH:9, VT:9, MA:9, MD:9, HI:6, DC:16 };
  const center = STATE_CENTERS[abbr] || [-96, 38];
  const zoom = big[abbr] || small[abbr] || 6.5;
  return { center, zoom };
}

export function GeoMap({ stateData = [], cityData = [], onStateClick, selectedState, onBack, drillLevel }) {
  const [hoveredState, setHoveredState] = useState(null);
  const [hoveredCity, setHoveredCity] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [mapCenter, setMapCenter] = useState([-96, 38]);
  const [mapZoom, setMapZoom] = useState(1);

  useEffect(() => {
    if (drillLevel === 'state' && selectedState) {
      const { center, zoom } = getStateZoom(selectedState);
      setMapCenter(center);
      setMapZoom(zoom);
    } else {
      setMapCenter([-96, 38]);
      setMapZoom(1);
    }
  }, [drillLevel, selectedState]);

  const revenueByState = useMemo(() => {
    const map = {};
    stateData.forEach(d => { map[d.state] = d; });
    return map;
  }, [stateData]);

  const colorScale = useMemo(() => {
    const revenues = stateData.map(d => d.revenue).filter(r => r > 0);
    if (revenues.length === 0) return () => COLOR_RANGE[0];
    const minRev = Math.min(...revenues);
    const maxRev = Math.max(...revenues);
    if (minRev === maxRev) return () => COLOR_RANGE[4];
    return scaleLog()
      .domain([Math.max(minRev, 1), maxRev])
      .range([0, COLOR_RANGE.length - 1])
      .clamp(true);
  }, [stateData]);

  const getColor = useCallback((revenue) => {
    if (revenue <= 0) return '#1a1a2e';
    const idx = Math.round(colorScale(revenue));
    return COLOR_RANGE[Math.min(idx, COLOR_RANGE.length - 1)];
  }, [colorScale]);

  // City bubbles: only cities with real coordinates
  const cityBubbles = useMemo(() => {
    if (!selectedState || cityData.length === 0) return [];
    return cityData
      .map(d => {
        const coords = getCityCoordinates(d.city, selectedState);
        return coords ? { ...d, coords } : null;
      })
      .filter(Boolean)
      .slice(0, 40);
  }, [cityData, selectedState]);

  const bubbleScale = useMemo(() => {
    if (cityBubbles.length === 0) return () => 3;
    const maxRev = Math.max(...cityBubbles.map(d => d.revenue));
    return scaleSqrt().domain([0, maxRev]).range([1.5, 14]);
  }, [cityBubbles]);

  const handleMouseMove = useCallback((e) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const maxRevenue = useMemo(() => Math.max(...stateData.map(d => d.revenue), 1), [stateData]);

  const hoveredItem = hoveredCity || (hoveredState ? revenueByState[hoveredState] : null);
  const hoveredLabel = hoveredCity
    ? `${hoveredCity.city}, ${selectedState}`
    : hoveredState ? (STATE_ABBR_TO_NAME[hoveredState] || hoveredState) : null;

  return (
    <div className="relative" onMouseMove={handleMouseMove}>
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
        {drillLevel === 'state' && selectedState && (
          <button
            onClick={onBack}
            className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-sm border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-purple-300 hover:text-white hover:border-purple-500 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to US
          </button>
        )}

        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{ scale: 1000 }}
          width={800}
          height={500}
          style={{ width: '100%', height: 'auto' }}
        >
          <ZoomableGroup
            center={mapCenter}
            zoom={mapZoom}
            minZoom={1}
            maxZoom={20}
            filterZoomEvent={() => false}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const fips = geo.id;
                  const abbr = FIPS_TO_ABBR[fips];
                  const stateInfo = revenueByState[abbr];
                  const revenue = stateInfo?.revenue || 0;
                  const isSelected = selectedState === abbr;
                  const isDrilled = drillLevel === 'state';
                  const isDimmed = isDrilled && !isSelected;
                  const fillColor = revenue > 0 ? getColor(revenue) : '#1a1a2e';

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => !isDrilled && setHoveredState(abbr)}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => abbr && !isDrilled && onStateClick?.(abbr)}
                      style={{
                        default: {
                          fill: isDimmed ? '#0f172a' : (isSelected && isDrilled ? '#1e1b4b' : fillColor),
                          stroke: isSelected && isDrilled ? '#7c3aed' : (isDimmed ? '#1e293b' : '#475569'),
                          strokeWidth: isSelected && isDrilled ? 1 : 0.5,
                          outline: 'none',
                          opacity: isDimmed ? 0.15 : 1,
                          cursor: isDrilled ? 'default' : 'pointer',
                        },
                        hover: {
                          fill: isDimmed ? '#0f172a' : (isDrilled ? '#1e1b4b' : (revenue > 0 ? '#a78bfa' : '#1e293b')),
                          stroke: isDimmed ? '#1e293b' : '#c4b5fd',
                          strokeWidth: isDimmed ? 0.5 : 1.5,
                          outline: 'none',
                          opacity: isDimmed ? 0.15 : 1,
                          cursor: isDrilled ? 'default' : 'pointer',
                          filter: isDimmed ? 'none' : 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.4))',
                        },
                        pressed: { fill: '#8b5cf6', stroke: '#c4b5fd', strokeWidth: 2, outline: 'none' },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* City bubbles with real coordinates */}
            {drillLevel === 'state' && cityBubbles.map((city, i) => {
              const r = bubbleScale(city.revenue);
              const isHov = hoveredCity?.city === city.city;
              return (
                <Marker key={`${city.city}-${i}`} coordinates={city.coords}>
                  <circle
                    r={r}
                    fill={isHov ? '#c4b5fd' : '#8b5cf6'}
                    fillOpacity={isHov ? 0.95 : 0.7}
                    stroke={isHov ? '#ffffff' : '#c4b5fd'}
                    strokeWidth={isHov ? 1.5 : 0.5}
                    style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onMouseEnter={() => setHoveredCity(city)}
                    onMouseLeave={() => setHoveredCity(null)}
                  />
                  {(r > 4 || isHov) && (
                    <text
                      textAnchor="middle"
                      y={-r - 3}
                      style={{
                        fontSize: isHov ? '7px' : '6px',
                        fill: isHov ? '#ffffff' : '#c4b5fd',
                        fontFamily: 'system-ui, sans-serif',
                        fontWeight: isHov ? 700 : 500,
                        pointerEvents: 'none',
                        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                      }}
                    >
                      {city.city}
                    </text>
                  )}
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700/50">
          {drillLevel === 'us' ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-medium">LOW</span>
              <div className="flex gap-0.5">
                {COLOR_RANGE.map((color, i) => (
                  <div key={i} className="w-5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">HIGH</span>
            </div>
          ) : (
            <span className="text-xs text-purple-300 font-semibold">
              {STATE_ABBR_TO_NAME[selectedState]} — {cityBubbles.length} cities mapped
            </span>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {(hoveredState || hoveredCity) && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{ left: tooltipPos.x + 14, top: tooltipPos.y - 12 }}
        >
          <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 shadow-xl min-w-[160px]">
            <div className="text-xs font-semibold text-white mb-1">{hoveredLabel}</div>
            {hoveredItem ? (
              <>
                <div className="text-sm font-bold text-purple-300">{fmtDollar(hoveredItem.revenue)}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{fmtNumber(hoveredItem.order_count)} orders</div>
                <div className="mt-1.5 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-violet-400 rounded-full"
                    style={{ width: `${Math.min((hoveredItem.revenue / maxRevenue) * 100, 100)}%` }}
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
