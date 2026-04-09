import React, { useState, useEffect, useCallback } from 'react';
import { Map, Globe, BarChart3 } from 'lucide-react';
import { Sidebar } from './components/design-system/Sidebar/Sidebar.jsx';
import { LoginPage } from './components/design-system/Auth/LoginPage.jsx';
import { GeoMap } from './components/GeoMap.jsx';
import { KPICards } from './components/KPICards.jsx';
import { Leaderboard } from './components/Leaderboard.jsx';
import { TopCitiesChart } from './components/TopCitiesChart.jsx';
import { DateRangePicker } from './components/DateRangePicker.jsx';
import { Spinner } from './components/design-system/Loading/Spinner.jsx';
import { InfoTip } from './components/InfoTip.jsx';
import {
  fetchTotals,
  fetchStateRevenue,
  fetchCityRevenue,
  fetchZipRevenue,
  fetchTopCities,
  STATE_ABBR_TO_NAME,
} from './services/geoDataService.js';

function getDefaultDates() {
  const mtOffset = 7 * 60 * 60 * 1000;
  const mtNow = new Date(Date.now() - mtOffset);
  const today = mtNow.toISOString().split('T')[0];
  const yearStart = `${mtNow.getUTCFullYear()}-01-01`;
  return { from: yearStart, to: today, preset: 'ytd' };
}

const PASSWORDS = {
  BEBOLD: 'user',
  ADMIN: 'admin',
};

function App() {
  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Date range
  const [dateRange, setDateRange] = useState(getDefaultDates);

  // Data
  const [totals, setTotals] = useState(null);
  const [stateData, setStateData] = useState([]);
  const [topCities, setTopCities] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [zipData, setZipData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drillLoading, setDrillLoading] = useState(false);

  // Navigation
  const [selectedState, setSelectedState] = useState(null);
  const [drillLevel, setDrillLevel] = useState('us'); // 'us' | 'state'

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check auth on mount
  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('grid-auth') || '{}');
      if (auth.authenticated && auth.timestamp && Date.now() - auth.timestamp < 24 * 60 * 60 * 1000) {
        setIsAuthenticated(true);
      }
    } catch { /* ignore */ }
  }, []);

  const handleLogin = (password) => {
    const role = PASSWORDS[password.toUpperCase()];
    if (role) {
      localStorage.setItem('grid-auth', JSON.stringify({ authenticated: true, role, timestamp: Date.now() }));
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('grid-auth');
    setIsAuthenticated(false);
  };

  // Fetch US-level data when date range changes
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [t, s, tc] = await Promise.all([
          fetchTotals(dateRange.from, dateRange.to),
          fetchStateRevenue(dateRange.from, dateRange.to),
          fetchTopCities(dateRange.from, dateRange.to, 50),
        ]);
        if (cancelled) return;
        setTotals(t);
        setStateData(s);
        setTopCities(tc);
      } catch (err) {
        console.error('Failed to load geo data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [dateRange.from, dateRange.to, isAuthenticated]);

  // Fetch city/zip data when a state is selected
  useEffect(() => {
    if (!selectedState || !isAuthenticated) return;
    let cancelled = false;

    async function load() {
      setDrillLoading(true);
      try {
        const [cities, zips] = await Promise.all([
          fetchCityRevenue(dateRange.from, dateRange.to, selectedState),
          fetchZipRevenue(dateRange.from, dateRange.to, selectedState),
        ]);
        if (cancelled) return;
        setCityData(cities);
        setZipData(zips);
      } catch (err) {
        console.error('Failed to load drill data:', err);
      } finally {
        if (!cancelled) setDrillLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [selectedState, dateRange.from, dateRange.to, isAuthenticated]);

  const handleStateClick = useCallback((abbr) => {
    setSelectedState(abbr);
    setDrillLevel('state');
  }, []);

  const handleBack = useCallback(() => {
    setSelectedState(null);
    setDrillLevel('us');
    setCityData([]);
    setZipData([]);
  }, []);

  const handleDateChange = useCallback((newRange) => {
    setDateRange(newRange);
    // Reset drill-down on date change
    setSelectedState(null);
    setDrillLevel('us');
    setCityData([]);
    setZipData([]);
  }, []);

  const navigationItems = [
    { isSection: true, id: 'section-analytics', label: 'Analytics' },
    { id: 'heatmap', label: 'US Heat Map', icon: Map },
  ];

  if (!isAuthenticated) {
    return (
      <LoginPage
        appName="GRID"
        tagline="Geographic Revenue Insights Dashboard"
        logoSrc="/logo.png"
        onSubmit={handleLogin}
        error={authError}
        buttonText="Access Dashboard"
        footerText="Protected data. Authorized access only."
      />
    );
  }

  const topState = stateData[0] || null;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Sidebar
        appName="GRID"
        tagline="Geographic Revenue Insights Dashboard"
        logoSrc="/logo.png"
        navigationItems={navigationItems}
        activeItem="heatmap"
        onNavigate={() => {}}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="ml-0 lg:ml-64 min-h-screen relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px] pointer-events-none" />

        {/* Header bar */}
        <div className="h-12 bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 flex items-center px-6">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-200" />
            <span className="text-sm font-semibold text-white">
              {drillLevel === 'state' && selectedState
                ? `${STATE_ABBR_TO_NAME[selectedState] || selectedState} Heat Map`
                : 'US Heat Map'}
              <InfoTip
                label="Heat Map"
                text="Interactive choropleth showing US DTC revenue by geography. Darker states have higher revenue. Click any state to drill into city-level bubbles and zip code rankings."
                light
              />
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-6 relative z-10">
          {/* Date picker */}
          <div className="mb-6">
            <DateRangePicker
              selectedPreset={dateRange.preset}
              from={dateRange.from}
              to={dateRange.to}
              onChange={handleDateChange}
            />
          </div>

          {/* KPI Cards */}
          <div className="mb-6">
            <KPICards totals={totals} topState={topState} loading={loading} />
          </div>

          {/* Map + Leaderboard */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <GeoMap
                stateData={stateData}
                cityData={cityData}
                onStateClick={handleStateClick}
                selectedState={selectedState}
                onBack={handleBack}
                drillLevel={drillLevel}
              />
            </div>
            <div className="xl:col-span-1">
              <Leaderboard
                stateData={stateData}
                cityData={cityData}
                zipData={zipData}
                selectedState={selectedState}
                onStateClick={handleStateClick}
                onBack={handleBack}
                loading={drillLevel === 'us' ? loading : drillLoading}
                drillLevel={drillLevel}
              />
            </div>
          </div>

          {/* Top Cities Chart */}
          {drillLevel === 'us' && (
            <div className="mt-6">
              <TopCitiesChart data={topCities} loading={loading} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
