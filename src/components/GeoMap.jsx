import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { scaleLog, scaleSqrt } from 'd3-scale';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { fmtDollar, fmtNumber } from '../utils/formatters.js';
import { FIPS_TO_ABBR, STATE_ABBR_TO_NAME } from '../services/geoDataService.js';
import { getCityCoordinates } from '../data/cityCoords.js';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';
const MAP_WIDTH = 800;
const MAP_HEIGHT = 500;
const MAP_SCALE = 1000;
const FILL_RATIO = 0.75; // state fills 75% of viewport

const COLOR_RANGE = [
  '#e0d5ff', '#c4b5fd', '#a78bfa', '#8b6cf5', '#7c5ce6',
  '#6d4fcc', '#5b45b2', '#4c3d99', '#3b2580',
];

// Compute center and zoom from a geography feature's projected bounds
function computeStateView(geo) {
  const projection = geoAlbersUsa().scale(MAP_SCALE).translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);
  const pathGen = geoPath().projection(projection);
  const bounds = pathGen.bounds(geo);

  if (!bounds || !isFinite(bounds[0][0])) return null;

  const [[x0, y0], [x1, y1]] = bounds;
  const dx = x1 - x0;
  const dy = y1 - y0;

  // Projected center → back to geo coordinates
  const center = projection.invert([(x0 + x1) / 2, (y0 + y1) / 2]);
  if (!center) return null;

  // Zoom so the state fills FILL_RATIO of the viewport
  const zoom = Math.min(
    (MAP_WIDTH * FILL_RATIO) / dx,
    (MAP_HEIGHT * FILL_RATIO) / dy
  );

  return { center, zoom: Math.max(1, Math.min(zoom, 15)) };
}

export function GeoMap({ stateData = [], cityData = [], onStateClick, selectedState, onBack, drillLevel }) {
  const [hoveredState, setHoveredState] = useState(null);
  const [hoveredCity, setHoveredCity] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [mapCenter, setMapCenter] = useState([-96, 38]);
  const [mapZoom, setMapZoom] = useState(1);
  const geoFeaturesRef = useRef({});

  // Auto-zoom when selectedState changes (from any source: map click OR leaderboard click)
  useEffect(() => {
    if (drillLevel === 'state' && selectedState && geoFeaturesRef.current[selectedState]) {
      const view = computeStateView(geoFeaturesRef.current[selectedState]);
      if (view) {
        setMapCenter(view.center);
        setMapZoom(view.zoom);
      }
    } else if (drillLevel === 'us') {
      setMapCenter([-96, 38]);
      setMapZoom(1);
    }
  }, [selectedState, drillLevel]);

  const handleStateClick = useCallback((abbr) => {
    onStateClick?.(abbr);
  }, [onStateClick]);

  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

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
        {drillLevel === 'state' && selectedState ? (
          <button
            onClick={handleBack}
            className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-sm border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-purple-300 hover:text-white hover:border-purple-500 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to US
          </button>
        ) : (mapZoom !== 1 || mapCenter[0] !== -96 || mapCenter[1] !== 38) && (
          <button
            onClick={() => { setMapCenter([-96, 38]); setMapZoom(1); }}
            className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-sm border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-purple-300 hover:text-white hover:border-purple-500 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" /></svg>
            Reset View
          </button>
        )}

        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{ scale: MAP_SCALE }}
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          style={{ width: '100%', height: 'auto' }}
        >
          <ZoomableGroup
            center={mapCenter}
            zoom={mapZoom}
            minZoom={1}
            maxZoom={20}
            filterZoomEvent={() => false}
            onMoveEnd={({ coordinates, zoom }) => { setMapCenter(coordinates); setMapZoom(zoom); }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const fips = geo.id;
                  const abbr = FIPS_TO_ABBR[fips];
                  if (abbr) geoFeaturesRef.current[abbr] = geo;
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
                      onClick={() => abbr && !isDrilled && handleStateClick(abbr)}
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
              const r = bubbleScale(city.revenue) / mapZoom;
              const isHov = hoveredCity?.city === city.city;
              const isTop5 = i < 5;
              const fontSize = (isHov ? 3.2 : 2.5) / mapZoom;
              const strokeW = (isHov ? 0.8 : 0.3) / mapZoom;
              return (
                <Marker key={`${city.city}-${i}`} coordinates={city.coords}>
                  <circle
                    r={r}
                    fill={isHov ? '#c4b5fd' : '#8b5cf6'}
                    fillOpacity={isHov ? 0.95 : 0.7}
                    stroke={isHov ? '#ffffff' : '#c4b5fd'}
                    strokeWidth={strokeW}
                    style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onMouseEnter={() => setHoveredCity(city)}
                    onMouseLeave={() => setHoveredCity(null)}
                  />
                  {(isTop5 || isHov) && (
                    <text
                      textAnchor="middle"
                      y={-r - 1.5 / mapZoom}
                      style={{
                        fontSize: `${fontSize}px`,
                        fill: isHov ? '#ffffff' : '#c4b5fd',
                        fontFamily: 'system-ui, sans-serif',
                        fontWeight: isHov ? 700 : 500,
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
