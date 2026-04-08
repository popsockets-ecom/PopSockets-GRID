import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { scaleLog, scaleLinear, scaleSqrt } from 'd3-scale';
import { fmtDollar, fmtNumber } from '../utils/formatters.js';
import { FIPS_TO_ABBR, STATE_ABBR_TO_NAME } from '../services/geoDataService.js';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

// All steps are visible against the dark background
// Inverted: light = low revenue, dark/saturated = high revenue
const COLOR_RANGE = [
  '#e0d5ff', // near-white violet (lowest)
  '#c4b5fd', // violet-300
  '#a78bfa', // violet-400
  '#8b6cf5', // violet
  '#7c5ce6', // bright purple
  '#6d4fcc', // medium purple
  '#5b45b2', // purple-indigo
  '#4c3d99', // indigo
  '#3b2580', // deep indigo (highest)
];

// State centroid coordinates for city bubble positioning reference
const STATE_CENTERS = {
  AL:[32.8,-86.8],AK:[64,-153],AZ:[34.3,-111.7],AR:[34.8,-92.2],CA:[37.2,-119.5],
  CO:[39,-105.5],CT:[41.6,-72.7],DE:[39,-75.5],FL:[28.6,-82.4],GA:[32.7,-83.5],
  HI:[20.5,-157],ID:[44.4,-114.6],IL:[40,-89.2],IN:[39.8,-86.3],IA:[42,-93.5],
  KS:[38.5,-98.3],KY:[37.8,-85.7],LA:[31,-92],ME:[45.4,-69],MD:[39.1,-76.8],
  MA:[42.2,-71.8],MI:[44.3,-85],MN:[46.3,-94.3],MS:[32.7,-89.7],MO:[38.4,-92.5],
  MT:[47,-109.6],NE:[41.5,-99.8],NV:[39.5,-116.9],NH:[43.7,-71.6],NJ:[40.1,-74.7],
  NM:[34.5,-106],NY:[42.9,-75.5],NC:[35.6,-79.4],ND:[47.4,-100.5],OH:[40.3,-82.8],
  OK:[35.6,-97.5],OR:[44,-120.5],PA:[40.9,-77.8],RI:[41.7,-71.5],SC:[33.9,-80.9],
  SD:[44.4,-100.2],TN:[35.9,-86.4],TX:[31.5,-99.4],UT:[39.3,-111.7],VT:[44,-72.7],
  VA:[37.5,-78.9],WA:[47.4,-120.5],WV:[38.6,-80.6],WI:[44.6,-89.8],WY:[43,-107.5],
  DC:[38.9,-77],
};

// Zoom configs per state (center + zoom level)
const STATE_ZOOM = {
  AK: { center: [-153, 64], zoom: 3 },
  HI: { center: [-157, 20.5], zoom: 6 },
  TX: { center: [-99.4, 31.5], zoom: 5 },
  CA: { center: [-119.5, 37.2], zoom: 5 },
  MT: { center: [-109.6, 47], zoom: 6 },
  FL: { center: [-82.4, 28.6], zoom: 6 },
  NY: { center: [-75.5, 42.9], zoom: 7 },
  default: { zoom: 6 },
};

function getStateZoom(abbr) {
  if (STATE_ZOOM[abbr]) return STATE_ZOOM[abbr];
  const center = STATE_CENTERS[abbr];
  if (!center) return { center: [-96, 38], zoom: 4 };
  return { center: [center[1], center[0]], zoom: STATE_ZOOM.default.zoom };
}

// Approximate city lat/lng from state center + offset (for cities without geocoding)
// In production you'd use a geocoding API; this gives reasonable visual spread
function getCityCoords(city, stateAbbr, index, total) {
  const center = STATE_CENTERS[stateAbbr];
  if (!center) return null;
  // Spread cities in a spiral pattern from state center
  const angle = (index / total) * Math.PI * 4;
  const radius = 0.3 + (index / total) * 1.5;
  return [
    center[1] + Math.cos(angle) * radius,
    center[0] + Math.sin(angle) * radius * 0.7,
  ];
}

export function GeoMap({ stateData = [], cityData = [], onStateClick, selectedState, onBack, drillLevel }) {
  const [hoveredState, setHoveredState] = useState(null);
  const [hoveredCity, setHoveredCity] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [mapCenter, setMapCenter] = useState([-96, 38]);
  const [mapZoom, setMapZoom] = useState(1);

  // Animate zoom on state select/deselect
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

  // Log scale so small states are still visible
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

  // City bubble scale
  const bubbleScale = useMemo(() => {
    if (cityData.length === 0) return () => 3;
    const maxRev = Math.max(...cityData.map(d => d.revenue));
    return scaleSqrt().domain([0, maxRev]).range([2, 18]);
  }, [cityData]);

  const handleMouseMove = useCallback((e) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const maxRevenue = useMemo(() => {
    return Math.max(...stateData.map(d => d.revenue), 1);
  }, [stateData]);

  const hoveredItem = hoveredCity || (hoveredState ? revenueByState[hoveredState] : null);
  const hoveredLabel = hoveredCity
    ? hoveredCity.city
    : (hoveredState ? (STATE_ABBR_TO_NAME[hoveredState] || hoveredState) : null);

  return (
    <div className="relative" onMouseMove={handleMouseMove}>
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
        {/* Back button overlay */}
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
            maxZoom={12}
            filterZoomEvent={e => false}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const fips = geo.id;
                  const abbr = FIPS_TO_ABBR[fips];
                  const stateInfo = revenueByState[abbr];
                  const revenue = stateInfo?.revenue || 0;
                  const isHovered = hoveredState === abbr && !hoveredCity;
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
                          stroke: isSelected && isDrilled ? '#6d28d9' : (isDimmed ? '#1e293b' : '#334155'),
                          strokeWidth: isSelected && isDrilled ? 1.5 : 0.5,
                          outline: 'none',
                          opacity: isDimmed ? 0.3 : 1,
                          cursor: isDrilled ? 'default' : 'pointer',
                        },
                        hover: {
                          fill: isDimmed ? '#0f172a' : (isDrilled ? '#1e1b4b' : (revenue > 0 ? '#a78bfa' : '#1e293b')),
                          stroke: isDimmed ? '#1e293b' : '#c4b5fd',
                          strokeWidth: isDimmed ? 0.5 : 1.5,
                          outline: 'none',
                          opacity: isDimmed ? 0.3 : 1,
                          cursor: isDrilled ? 'default' : 'pointer',
                          filter: isDimmed ? 'none' : 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))',
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

            {/* City bubbles when drilled into a state */}
            {drillLevel === 'state' && selectedState && cityData.slice(0, 30).map((city, i) => {
              const coords = getCityCoords(city.city, selectedState, i, Math.min(cityData.length, 30));
              if (!coords) return null;
              const r = bubbleScale(city.revenue);
              const isHovered = hoveredCity?.city === city.city;
              return (
                <Marker key={`${city.city}-${i}`} coordinates={coords}>
                  <circle
                    r={r}
                    fill={isHovered ? '#c4b5fd' : '#8b5cf6'}
                    fillOpacity={isHovered ? 0.95 : 0.75}
                    stroke={isHovered ? '#e0d5ff' : '#a78bfa'}
                    strokeWidth={isHovered ? 1.5 : 0.5}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseEnter={() => setHoveredCity(city)}
                    onMouseLeave={() => setHoveredCity(null)}
                  />
                  {(r > 6 || isHovered) && (
                    <text
                      textAnchor="middle"
                      y={r + 10}
                      style={{
                        fontSize: '8px',
                        fill: isHovered ? '#e0d5ff' : '#94a3b8',
                        fontFamily: 'system-ui, sans-serif',
                        fontWeight: isHovered ? 600 : 400,
                        pointerEvents: 'none',
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

        {/* Color legend (only in US view) */}
        {drillLevel === 'us' && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 font-medium">LOW</span>
            <div className="flex gap-0.5">
              {COLOR_RANGE.map((color, i) => (
                <div key={i} className="w-5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
              ))}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">HIGH</span>
          </div>
        )}

        {/* State label when zoomed */}
        {drillLevel === 'state' && selectedState && (
          <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700/50">
            <span className="text-xs text-purple-300 font-semibold">
              {STATE_ABBR_TO_NAME[selectedState]} — Top {Math.min(cityData.length, 30)} Cities
            </span>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {(hoveredState || hoveredCity) && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 10 }}
        >
          <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 shadow-xl min-w-[160px]">
            <div className="text-xs font-semibold text-white mb-1">{hoveredLabel}</div>
            {hoveredItem ? (
              <>
                <div className="text-sm font-bold text-purple-300">
                  {fmtDollar(hoveredItem.revenue)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {fmtNumber(hoveredItem.order_count)} orders
                </div>
                <div className="mt-1.5 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-violet-400 rounded-full transition-all"
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
