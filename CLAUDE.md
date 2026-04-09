# GRID - Geographic Revenue Insights Dashboard

> **This file is Claude's memory for GRID.** Update it as you work, not just at commit time.

## Auto-Update Rules

**Update this file in real-time when:**
- You make a mistake → Add to "Mistakes & Learnings"
- You add a new view or component → Update Key Files
- You change RPCs or data flow → Update Data Architecture
- You discover why something works a certain way → Add context
- A user corrects you → Capture that correction here

---

## Current State (Last Updated: 2026-04-08)

**Working on:** Filtered geo RPCs to US DTC only, added GRID to PIT portal
**Branch:** main
**Status:** Live. Revenue now scoped to US DTC channel to match PATH figures.
**Next steps:**
- [ ] Investigate Snowflake orders table for `order_status` column to exclude cancellations
- [ ] DMA mapping (requires 43K-row zip-to-DMA lookup table)
- [ ] Consider design system audit for consistency across apps

**Context that's hard to get from code alone:**
- GRID revenue ($5.32M YTD) is slightly lower than PATH US DTC ($5.36M) because GRID can only count orders with valid shipping state codes. ~$78K of US DTC orders have NULL/bad state data and can't be mapped geographically.
- The orders table has NO `order_status` column, so canceled orders cannot be filtered out. The ~$40K gap vs PATH's ecomm_daily_sales (which nets cancellations) is expected.
- Negative revenue rows exist (12 rows, -$6.5K) representing returns. These reduce the total slightly.
- 40,983 rows have $0 net_product_revenue (possible cancellations) but don't affect revenue sums.

---

## What This App Does

Interactive geographic revenue dashboard showing US DTC order revenue by location. Choropleth heat map with drill-down from states to cities/zip codes.

**Why it exists:** Team needed geographic visibility into where revenue comes from. No existing tool showed revenue by state/city/zip with interactive drill-down.

**Data source:** Supabase `orders` table (synced from Snowflake via `snowflake-sync` edge function). Filtered to `dtc_channel = 'US DTC'` only to align with PATH's US DTC figures.

Core features:
- Interactive US choropleth map (log color scale, dark=more revenue)
- Click state to drill into city bubbles with auto-zoom
- KPI cards: Total Revenue, Total Orders, AOV, Top State
- Leaderboard: ranked states (US view) or cities/zips tabs (state view)
- Top 50 cities horizontal bar chart (US view only)
- Date range picker with presets (Last 30d, 90d, YTD, Last Year, All Time)
- Default date range: YTD (Jan 1 to today, Mountain Time)

## Tech Stack

| What | Technology | Version | Why |
|------|------------|---------|-----|
| Framework | React | 18.3.1 | Team standard |
| Build | Vite | 4.5.14 | Fast, matches other apps (Vite 8 had SIGILL crash) |
| Styling | Tailwind CSS | 3.4.19 | Design system consistency |
| Maps | react-simple-maps | 3.0.0 | TopoJSON US map with zoom |
| Geo | d3-geo | 3.1.1 | geoAlbersUsa projection, dynamic state zoom |
| Scales | d3-scale | 4.0.2 | Log scale for choropleth coloring |
| TopoJSON | topojson-client | 3.1.0 | Parse US state geometries |
| Charts | Recharts | 3.8.1 | Horizontal bar chart, consistent with other apps |
| Icons | lucide-react | 1.7.0 | Design system standard |
| Database | Supabase JS | 2.102.1 | RPC calls for aggregated data |
| Hosting | Vercel | - | Auto-deploy from GitHub |

## Commands

```bash
npm run dev      # Local dev server (Vite)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
```

Deploy: Push to GitHub main branch. Vercel auto-deploys.

## Key Files

| File | Purpose | Notes |
|------|---------|-------|
| `src/App.jsx` | Main component, state orchestration | Auth, date range, data fetching, drill-down |
| `src/components/GeoMap.jsx` | Choropleth map + city bubbles | d3-geo auto-zoom, log color scale |
| `src/components/KPICards.jsx` | 4 metric cards | Matches PATH StatCard pattern |
| `src/components/Leaderboard.jsx` | Ranked list (states or cities/zips) | Tabbed in state view |
| `src/components/TopCitiesChart.jsx` | Top 50 cities bar chart | Revenue-intensity coloring |
| `src/components/DateRangePicker.jsx` | Date inputs + presets | Mountain Time boundaries |
| `src/services/geoDataService.js` | All Supabase RPC calls | 5 functions + state mappings |
| `src/data/cityCoords.js` | ~300 US city coordinates | [lng, lat] for bubble placement |
| `src/utils/formatters.js` | fmtDollar, fmtNumber, fmtPct | Shared formatting |
| `src/lib/supabase.js` | Supabase client init | Uses VITE_SUPABASE_URL/ANON_KEY |

### Design System Components (local copy)

| Component | Location | Notes |
|-----------|----------|-------|
| Sidebar | `src/components/design-system/Sidebar/` | 256px fixed, mobile collapsible |
| LoginPage | `src/components/design-system/Auth/` | Password form |
| Spinner | `src/components/design-system/Loading/` | sm/md/lg/xl, purple/white/slate |

## Data Architecture

### Supabase RPCs (5 total)

All RPCs filter to `dtc_channel = 'US DTC'` and use `normalize_us_state()` for US-only state mapping.

| RPC | Params | Returns | Used By |
|-----|--------|---------|---------|
| `get_geo_revenue_totals` | `p_from`, `p_to` | 1 row: total_revenue, total_orders, avg_order_value, total_states, total_cities | KPICards |
| `get_geo_revenue_by_state` | `p_from`, `p_to` | N rows: state, revenue, order_count, avg_order_value (sorted by revenue DESC) | GeoMap + Leaderboard |
| `get_geo_revenue_by_city` | `p_from`, `p_to`, `p_state` | Top 200 cities: city, state, revenue, order_count, avg_order_value | GeoMap bubbles + Leaderboard cities tab |
| `get_geo_revenue_by_zip` | `p_from`, `p_to`, `p_state` | Top 200 zips: zip, city, state, revenue, order_count | Leaderboard zips tab |
| `get_geo_top_cities` | `p_from`, `p_to`, `p_limit` | Top N cities nationwide: city, state, revenue, order_count | TopCitiesChart |

### SQL Functions

- **`normalize_us_state(text)`**: Maps raw shipping_state_code to 2-letter US abbreviations. Handles full names ("California" -> "CA"), already-valid codes, and filters out international codes (ON, NSW, BC, etc.). Returns NULL for non-US.
- **CTE pattern in city/zip RPCs**: Pre-finds raw state codes matching normalized state, then filters on raw values. Avoids full table scan from calling normalize_us_state() in WHERE clause.

### Revenue Calculation

- Revenue: `COALESCE(net_product_revenue, net_line_item_price, 0)` per line item
- `net_product_revenue` exists for rows after ~Mar 24, 2026; `net_line_item_price` for older rows
- Includes shipping line items (dim_item_id = 'ShippingTotal')
- Does NOT filter out canceled orders (no order_status column available)

### Data Flow

```
Snowflake ORDERS table
  → snowflake-sync edge function (daily, 5 sync windows)
  → Supabase orders table
  → RPCs aggregate by state/city/zip (US DTC only)
  → React frontend via supabase.rpc()
```

## Authentication

| Password | Role | Storage Key |
|----------|------|-------------|
| BEBOLD | user | `grid-auth` |
| ADMIN | admin | `grid-auth` |

Storage: `localStorage` (not sessionStorage). 24-hour session expiry.

## Map Implementation Details

### Choropleth (US View)
- TopoJSON source: `https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json`
- Color scale: `d3.scaleLog()` with 9-color purple gradient (#e0d5ff to #3b2580)
- No-data fill: `#1a1a2e`
- State matching: FIPS codes from TopoJSON → state abbreviation via `FIPS_TO_ABBR`

### City Bubbles (State View)
- Coordinates from `cityCoords.js` (~300 cities with [lng, lat])
- Bubble radius: sqrt scale, divided by zoom level for consistent visual size
- Labels: Top 5 cities shown by default, rest on hover
- Font size: divided by zoom level to prevent scaling

### Auto-Zoom
- Uses `d3.geoAlbersUsa()` projection to compute pixel bounds from state geometry
- Zoom = `min(width/geoWidth, height/geoHeight) * 0.75` (75% fill ratio)
- Center computed from projected geometry centroid
- NOT hardcoded per state. Works for any state including Alaska/Hawaii

## Environment Variables

```
VITE_SUPABASE_URL=https://xjvwwwfpauazdzibclmc.supabase.co
VITE_SUPABASE_ANON_KEY=[JWT token]
```

## Deployment

- **Vercel project**: popsockets-grid
- **URL**: https://popsockets-grid.vercel.app
- **GitHub**: popsockets-ecom/PopSockets-GRID
- **Auto-deploy**: Push to main
- **SPA rewrite**: `vercel.json` rewrites all routes to `/index.html`

## Known Revenue Gaps vs PATH

| Gap | Amount | Reason |
|-----|--------|--------|
| Missing state codes | ~$78K | US DTC orders with NULL/invalid shipping_state_code can't be mapped |
| Cancellations included | ~$40K | orders table has no order_status column; PATH's ecomm_daily_sales nets these out |
| Total gap | ~$40K lower | GRID $5.32M vs PATH $5.36M YTD (GRID is lower due to missing state codes outweighing cancellation inclusion) |

## Migrations Applied

1. `add_shipping_columns_and_orders_summary_view` - Added 3 shipping columns + orders_summary view
2. `create_geographic_revenue_rpcs` - 4 RPCs + index
3. `fix_geo_rpcs_us_only_and_normalize` - normalize_us_state() function + rebuilt all RPCs
4. `optimize_geo_city_zip_rpcs` - CTE-based city/zip RPCs + functional index
5. `normalize_city_names_in_geo_rpcs` - INITCAP deduplication for city names
6. `add_top_cities_rpc` - get_geo_top_cities for bar chart
7. `filter_geo_rpcs_us_dtc_only` - Added `dtc_channel = 'US DTC'` to all 5 RPCs

## Backfill History

- Shipping columns were only populated for April 2026 initially
- Backfilled Jan-Mar 2026, all 2025, all 2024 via snowflake-sync edge function (2-week date-bounded chunks)
- 2 chunks failed initially (Apr 1-15, Aug 1-15 2025) and were retried successfully
- Data available from 2024-01-01 onward

---

## Mistakes & Learnings

### 2026-04-08 - Revenue included all channels, not just US DTC
**What happened:** GRID showed $5.47M YTD while PATH showed $5.36M. Investigation revealed GRID was including TikTok ($126K), Global-E ($17K), and z_validate ($3K) orders shipping to US addresses.
**Correct approach:** Added `dtc_channel = 'US DTC'` filter to all 5 RPCs. GRID is a geographic breakdown of US DTC revenue, not all-channel revenue.

### 2026-04-08 - 197 states from international shipping codes
**What happened:** Snowflake orders table has international state codes (ON, NSW, BC, CMX) and full state names ("California"). Initial RPCs returned 197 distinct "states."
**Correct approach:** Created `normalize_us_state()` SQL function that maps to valid US 2-letter codes only. Returns NULL for anything non-US.

### 2026-04-08 - CTE pattern needed for city/zip RPCs
**What happened:** Using `normalize_us_state(shipping_state_code) = p_state` in WHERE clause caused full table scan and timeouts.
**Correct approach:** CTE first finds the raw state codes that normalize to the target, then filters on raw values using an index-friendly IN clause.

### 2026-04-08 - Vite 8 SIGILL crash on build
**What happened:** Initial setup used Vite 8 which crashed with exit code 132 (SIGILL).
**Correct approach:** Downgraded to Vite 4 to match other PopSockets apps.

### 2026-04-08 - SVG labels scale with zoom
**What happened:** City labels and bubbles grew huge when zooming into a state because SVG elements scale with the ZoomableGroup transform.
**Correct approach:** Divide fontSize and bubble radius by the current zoom level.

---

## Gotchas & Patterns

- **Mountain Time dates**: `getDefaultDates()` offsets by UTC-7 before computing today's date. All date boundaries use this.
- **Log scale for choropleth**: Linear scale makes low-revenue states invisible. Log scale ensures all states show some color.
- **FIPS codes**: TopoJSON uses FIPS codes (e.g., "06" for California), not abbreviations. `FIPS_TO_ABBR` mapping in geoDataService.js handles conversion.
- **City coordinates**: Not all cities have coordinates in cityCoords.js. Cities without coords won't show bubbles. Add coords as needed.
- **Bubble/label scaling**: All visual sizes in state view must be divided by zoom level. Forgetting this makes elements huge on small states and tiny on large states.
- **No retry logic**: RPC failures log to console but don't retry. If Supabase is down, user sees stale data or empty state.
- **Loading vs empty**: Always show Spinner when loading. Only show "No data" after loading completes with empty results.
