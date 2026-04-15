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

## Current State (Last Updated: 2026-04-15)

**Working on:** Session complete. Drill-aware KPI cards, Revenue/AOV toggle on leaderboard, all-states rendering.
**Branch:** main
**Status:** Live at https://popsockets-grid.vercel.app. Last commit `1581e63`.
**Next steps:**
- [ ] Investigate Snowflake orders table for `order_status` column to exclude cancellations
- [ ] DMA mapping (requires 43K-row zip-to-DMA lookup table)
- [ ] Rotate 3 exposed API keys (OpenAI in CAGE, Anthropic in TARA, Supabase service role in TARA)
- [ ] Remove Miami exclusion when instructed by user

**What was done (2026-04-14 → 2026-04-15):**
- **KPI cards are now drill-aware** (`KPICards.jsx`): previously always showed US totals regardless of selected state. Now accepts `selectedState`, `stateData`, `cityData`, `drillLoading` props. When a state is selected, Revenue/Orders/AOV read from that state's row in `stateData`, and the "Top State" card becomes a "Top City" card sourced from `cityData[0]`. Labels prefix the state name (e.g., "California Revenue", "California AOV"). Tooltips rewrite per scope. Top City card respects `drillLoading` (not `loading`) since it depends on the drill-down fetch.
- **Revenue/AOV toggle on leaderboard** (`Leaderboard.jsx`): new `MetricToggle` segmented control in the card header (US view) and alongside the Cities/Zip Codes tabs (state view). Re-sorts the list by the selected metric via `sortByMetric()`, swaps the primary dollar value in each row, and rescales the progress bar against the new max. `LeaderboardRow` signature changed from `revenue`/`maxRevenue` to `primaryValue`/`barMax` so it's metric-agnostic. Order count stays as secondary subtext in both modes.
- **Zip AOV computed client-side**: `get_geo_revenue_by_zip` RPC does NOT return `avg_order_value` (unlike `_by_state` and `_by_city` which do). `computeAov(row)` helper falls back to `revenue / order_count` when `avg_order_value` is null. State and city rows still use the DB-computed value.
- **All states shown in leaderboard**: removed `.slice(0, 25)` cap on `sortedStates`. All 50+ states (incl. DC, PR, etc.) render; `max-h-[500px] overflow-y-auto` scroll container handles overflow. Header copy changed from "Top States by Revenue" → "States by Revenue/AOV". Cities/zips keep the `.slice(0, 50)` cap (RPCs already cap at 200; 50 is plenty for UI).
- **AOV card removed then restored**: brief detour where AOV KPI card was removed (3-column grid) before the user asked for it back. Grid returned to `grid-cols-2 xl:grid-cols-4`. Lesson: don't rush to delete metrics users may still want as secondary context.

**Active data filters:**
- **Miami exclusion**: All 5 RPCs exclude Miami orders from 2026-03-26 onward. Temporary filter, remove when user says so. Applied via migration `exclude_miami_orders_from_march_26` (then adjusted to 24th, then reverted to 26th via `revert_miami_exclusion_to_march_26`).

**Context that's hard to get from code alone:**
- GRID revenue ($5.32M YTD) is slightly lower than PATH US DTC ($5.36M) because GRID can only count orders with valid shipping state codes. ~$78K of US DTC orders have NULL/bad state data and can't be mapped geographically.
- The orders table has NO `order_status` column, so canceled orders cannot be filtered out. The ~$40K gap vs PATH's ecomm_daily_sales (which nets cancellations) is expected.
- Negative revenue rows exist (12 rows, -$6.5K) representing returns. These reduce the total slightly.
- 40,983 rows have $0 net_product_revenue (possible cancellations) but don't affect revenue sums.
- **`get_geo_revenue_by_zip` returns 5 columns, not 6**: `zip, city, state, revenue, order_count` — no `avg_order_value`. State/city RPCs return AOV; zip RPC doesn't. Compute client-side when needed.

---

## What was done (2026-04-10 evening) — prior session:

- **Data Sources page added** (`DataHealth.jsx`): Admin-only page showing pipeline health for the `orders` table. Uses shared `get_data_freshness()` and `get_data_quality()` RPCs from Supabase. Summary banner shows overall health status. Source card shows freshness (Current/Behind/Stale), quality indicator (yesterday vs 7-day avg), sync schedule, row count. Matches CORE/PAIR/PATH pattern exactly.
- **Admin auth implemented**: `ADMIN` password now sets `isAdmin` state (read from `role` field in localStorage `grid-auth` JSON). Data Sources footer button only appears for admin logins. BEBOLD users see no Data Sources access.
- **Navigation wiring**: `currentPage` state switches between `'heatmap'` and `'data-health'`. Sidebar `footerContent` prop passes admin-only Data Sources button (Database icon). Header bar title updates dynamically per page.
- **Logo updated**: Replaced with higher-resolution version (899x875 source, saved as 512x512). White background removed via Python flood-fill (Pillow). Transparent PNG blends cleanly with dark sidebar.
- **Sidebar logo sizing**: Reduced from `w-16 h-16` (64px) to `w-10 h-10` (40px) in SidebarHeader.jsx. Previous size was too large and crowded the header area.
- **Header bar redesigned to match PATH**: Changed from `h-12` with `text-sm` to `h-14` with `text-xl font-bold`. Gradient updated from `from-purple-800 via-purple-700 to-indigo-800` to `from-slate-800 via-purple-800 to-blue-800` (matching PATH's PageHeader gradient variant). Added `border-b border-slate-600/50`. Removed icon prefixes on page titles (just bold text now).
- **"Analytics" section label removed** from sidebar navigation. Only "US Heat Map" nav item remains (cleaner look).
- **InfoTip spacing improved**: Icon margin increased from `ml-1` to `ml-2`, icon size from `w-3 h-3` to `w-3.5 h-3.5`. Less cramped next to the bold header title.

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
- Data Sources page (admin-only): pipeline health for orders table

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
| `src/App.jsx` | Main component, state orchestration | Auth, date range, data fetching, drill-down, page routing |
| `src/components/GeoMap.jsx` | Choropleth map + city bubbles | d3-geo auto-zoom, log color scale |
| `src/components/KPICards.jsx` | 4 metric cards (Revenue, Orders, AOV, Top State/City) | Drill-aware: reads from selected state's row when drilled in. Top State → Top City in state view. Takes `selectedState`, `stateData`, `cityData`, `drillLoading`. |
| `src/components/Leaderboard.jsx` | Ranked list (states or cities/zips) | Revenue/AOV metric toggle in header. Re-sorts by chosen metric. Renders all states (no top-25 cap). Cities/zips still sliced to 50. Zip AOV computed client-side. |
| `src/components/TopCitiesChart.jsx` | Top 50 cities bar chart | Revenue-intensity coloring, purple tooltip |
| `src/components/DataHealth.jsx` | Data Sources page (admin-only) | Pipeline freshness/quality for orders table |
| `src/components/InfoTip.jsx` | Portal-based info tooltips | Color-matched accent bar, ml-2 spacing, w-3.5 icon |
| `src/components/DateRangePicker.jsx` | Date inputs + presets | Mountain Time boundaries |
| `src/services/geoDataService.js` | All Supabase RPC calls | 5 functions + state mappings |
| `src/data/cityCoords.js` | ~300 US city coordinates | [lng, lat] for bubble placement |
| `src/utils/formatters.js` | fmtDollar, fmtNumber, fmtPct | Shared formatting |
| `src/lib/supabase.js` | Supabase client init | Uses VITE_SUPABASE_URL/ANON_KEY |

### Design System Components (local copy)

| Component | Location | Notes |
|-----------|----------|-------|
| Sidebar | `src/components/design-system/Sidebar/` | 256px fixed, mobile collapsible, supports footerContent prop |
| LoginPage | `src/components/design-system/Auth/` | Password form, VOICE design pattern |
| Spinner | `src/components/design-system/Loading/` | sm/md/lg/xl, purple/white/slate |
| SidebarHeader | `src/components/design-system/Sidebar/SidebarHeader.jsx` | Logo w-10 h-10, rounded-lg |

## Data Architecture

### Supabase RPCs (5 geo RPCs + 2 shared)

All geo RPCs filter to `dtc_channel = 'US DTC'` and use `normalize_us_state()` for US-only state mapping.

| RPC | Params | Returns | Used By |
|-----|--------|---------|---------|
| `get_geo_revenue_totals` | `p_from`, `p_to` | 1 row: total_revenue, total_orders, avg_order_value, total_states, total_cities | KPICards |
| `get_geo_revenue_by_state` | `p_from`, `p_to` | N rows: state, revenue, order_count, avg_order_value (sorted by revenue DESC) | GeoMap + Leaderboard |
| `get_geo_revenue_by_city` | `p_from`, `p_to`, `p_state` | Top 200 cities: city, state, revenue, order_count, avg_order_value | GeoMap bubbles + Leaderboard cities tab |
| `get_geo_revenue_by_zip` | `p_from`, `p_to`, `p_state` | Top 200 zips: zip, city, state, revenue, order_count | Leaderboard zips tab |
| `get_geo_top_cities` | `p_from`, `p_to`, `p_limit` | Top N cities nationwide: city, state, revenue, order_count | TopCitiesChart |
| `get_data_freshness` | (none) | All tracked tables: source_name, latest_date, row_count | DataHealth |
| `get_data_quality` | (none) | Quality metrics: source_name, yesterday_value, avg_7d, missing_days | DataHealth |

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

| Password | Role | Storage Key | Data Sources Access |
|----------|------|-------------|---------------------|
| BEBOLD | user | `grid-auth` | No |
| ADMIN | admin | `grid-auth` | Yes |

Storage: `localStorage` (not sessionStorage). 24-hour session expiry. Auth JSON stores `{ authenticated, role, timestamp }`. Admin state derived from `role === 'admin'`.

## Page Routing

| Page ID | View | Access | Header Title |
|---------|------|--------|--------------|
| `heatmap` | US Heat Map (default) | All users | "US Heat Map" (or state name when drilled) |
| `data-health` | Data Sources | Admin only | "Data Sources" |

Navigation: `currentPage` state. Sidebar nav items for main views, `footerContent` button for Data Sources (admin-gated).

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
- Geo features cached in `geoFeaturesRef` on first render, so zoom works from both map clicks AND leaderboard clicks
- `useEffect` on `selectedState`/`drillLevel` drives zoom (not the click handler)

### Reset View Button
- Appears in US view when map is panned away from default center/zoom
- Resets to `[-96, 38]` center, zoom 1
- Tracks position via `onMoveEnd` callback on ZoomableGroup

## Header Bar Design

Matches PATH's `PageHeader` gradient variant:
- Height: `h-14` (56px)
- Gradient: `from-slate-800 via-purple-800 to-blue-800`
- Border: `border-b border-slate-600/50`
- Title: `text-xl font-bold text-white leading-none`
- Padding: `pl-14 pr-4 sm:px-6` (extra left padding for mobile hamburger)
- No icon prefix on page titles (clean bold text only)

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

## Logo

- **Source**: `public/logo.png` (512x512, transparent background)
- **Processing**: White background removed via Python Pillow flood-fill from corners
- **Sidebar display**: `w-10 h-10 rounded-lg` in SidebarHeader.jsx (was `w-16 h-16`, reduced to avoid crowding)
- **Login page**: Displayed via LoginPage component's `logoSrc` prop

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
8. `exclude_miami_orders_from_march_26` - Temporary Miami exclusion from 2026-03-26 onward
9. `adjust_miami_exclusion_to_march_24` - Changed to March 24 (then reverted)
10. `revert_miami_exclusion_to_march_26` - Back to March 26 cutoff

## Backfill History

- Shipping columns were only populated for April 2026 initially
- Backfilled Jan-Mar 2026, all 2025, all 2024 via snowflake-sync edge function (2-week date-bounded chunks)
- 2 chunks failed initially (Apr 1-15, Aug 1-15 2025) and were retried successfully
- Data available from 2024-01-01 onward

---

## Mistakes & Learnings

### 2026-04-15 - KPI cards stayed static when drilling into a state
**What happened:** After the drill-down work was deployed, the KPI grid kept showing US totals even when a state was selected. The header and map/leaderboard updated, but Revenue/Orders/AOV/Top State cards didn't. Cards only took `totals` and `topState` props, both computed from the US-level fetch.
**Correct approach:** Pass `selectedState`, `stateData`, `cityData`, `drillLoading` into KPICards. Derive selected state's row from `stateData.find(r => r.state === selectedState)`. Swap "Top State" for "Top City" card (sourced from `cityData[0]`) when drilled in. Use `drillLoading` (not the US-level `loading`) for the Top City card since it depends on the state-scoped fetch.
**Key lesson:** When adding drill-down to an app, audit EVERY component that shows data, not just the ones you're actively changing. KPI cards are easy to miss because they don't have obvious "state" dependencies in the data layer — they just consume totals.

### 2026-04-15 - Removed a metric, user wanted it back within the hour
**What happened:** Earlier in the session, removed the AOV KPI card per user request, then the user asked for it back as the session progressed. Grid went 4 → 3 → 4 cols.
**Correct approach:** When a user says "remove X," the instinct to also clean up imports and grid dimensions is right, but favor reversible changes. Deleting the card entirely (vs. hiding or commenting) made restoration a full reimplementation. For metric toggles or UI-level removals, consider making them configurable before ripping out the code.

### 2026-04-15 - get_geo_revenue_by_zip RPC doesn't return avg_order_value
**What happened:** Added a Revenue/AOV toggle to the leaderboard. State and city rows worked immediately. Zip rows were missing AOV because the zip RPC returns `zip, city, state, revenue, order_count` — no `avg_order_value` column. State and city RPCs return it; zip doesn't.
**Correct approach:** Added `computeAov(row)` helper that falls back to `revenue / order_count` when `avg_order_value` is null. Could alternatively add AOV to the zip RPC via migration, but client-side compute is fine for this volume and avoids a schema change.
**Key lesson:** Never assume RPC return shapes are consistent across a family of functions. Always check the CLAUDE.md RPC table (or the migration) to see what each one actually returns. Document schema asymmetries explicitly.

### 2026-04-10 - SidebarHeader logo was too large (64px)
**What happened:** New high-res logo at `w-16 h-16` (64px) crowded the sidebar header, making the app name and tagline feel cramped.
**Correct approach:** Reduced to `w-10 h-10` (40px) with `rounded-lg` to match the fallback icon size. The sidebar header has limited vertical space, logos over 40px crowd the text.

### 2026-04-10 - Header bar didn't match PATH's PageHeader design
**What happened:** GRID used `h-12` with `text-sm font-semibold` and icon prefixes on titles. PATH uses `h-14` with `text-xl font-bold` and no icon prefixes. The difference was visually jarring when switching between apps.
**Correct approach:** Match PATH's PageHeader gradient variant exactly: `h-14`, `text-xl font-bold`, gradient `from-slate-800 via-purple-800 to-blue-800`, `border-b border-slate-600/50`. No icon before page titles.

### 2026-04-10 - Logo PNG had white background visible on dark sidebar
**What happened:** The original logo had an opaque white background. Against the dark slate-800 sidebar, it appeared as a white square.
**Correct approach:** Use Python Pillow flood-fill from corners to make white background transparent. Save as PNG with alpha channel. Always verify logos render correctly against dark backgrounds before committing.

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

### 2026-04-09 - Leaderboard clicks didn't zoom the map
**What happened:** Clicking a state in the leaderboard set `selectedState` but didn't compute map zoom (only map clicks passed the `geo` object to compute zoom).
**Correct approach:** Cache geo features in a ref during render. Use `useEffect` on `selectedState`/`drillLevel` to compute zoom from cached features, so both entry points produce identical zoom behavior.

### 2026-04-09 - Tooltip colors didn't match parent sections
**What happened:** InfoTip always used purple accent, even on green (orders), cyan (AOV), or orange (top state) cards.
**Correct approach:** Added `color` prop to InfoTip. Each KPI card passes its color scheme. Gradient bar, label, and hover icon all match the parent section's accent color.

---

## Gotchas & Patterns

- **Mountain Time dates**: `getDefaultDates()` offsets by UTC-7 before computing today's date. All date boundaries use this.
- **Log scale for choropleth**: Linear scale makes low-revenue states invisible. Log scale ensures all states show some color.
- **FIPS codes**: TopoJSON uses FIPS codes (e.g., "06" for California), not abbreviations. `FIPS_TO_ABBR` mapping in geoDataService.js handles conversion.
- **City coordinates**: Not all cities have coordinates in cityCoords.js. Cities without coords won't show bubbles. Add coords as needed.
- **Bubble/label scaling**: All visual sizes in state view must be divided by zoom level. Forgetting this makes elements huge on small states and tiny on large states.
- **No retry logic**: RPC failures log to console but don't retry. If Supabase is down, user sees stale data or empty state.
- **Loading vs empty**: Always show Spinner when loading. Only show "No data" after loading completes with empty results.
- **InfoTip `light` prop**: Use `light` on dark/colored backgrounds (e.g., header bar). Makes icon purple-200/60 → white on hover instead of slate-500 → accent.
- **InfoTip spacing**: `ml-2` margin and `w-3.5 h-3.5` icon size. Avoids cramped look next to bold titles.
- **Tooltip color matching**: Always pass the parent section's color to InfoTip so the accent bar matches. Purple for revenue, green for orders, cyan for AOV, orange for top state, amber for leaderboard.
- **Miami exclusion is temporary**: All 5 RPCs have `AND NOT (UPPER(TRIM(shipping_city)) = 'MIAMI' AND order_created_date >= '2026-03-26')`. Remove when user instructs.
- **localStorage not sessionStorage**: GRID uses localStorage for auth (unique among PopSockets apps). JSON stores `{ authenticated, role, timestamp }` under key `grid-auth`. Admin state derived from `role === 'admin'`.
- **No section labels in sidebar nav**: The "Analytics" label was removed. Just list nav items directly.
- **Data Sources is admin-only**: Passed via `footerContent` prop to Sidebar, gated by `isAdmin`. Not in the main nav items array.
- **KPI cards are drill-aware**: Pass `selectedState`, `stateData`, `cityData`, `drillLoading` to `KPICards` along with `totals`. When `selectedState` is set, cards read from the selected state's row in `stateData` instead of `totals`. "Top State" card becomes "Top City" sourced from `cityData[0]`. Adding a new KPI card? Decide whether it should reflect the scope or stay US-level and branch on `isStateView`.
- **Leaderboard metric toggle**: `Leaderboard` has a Revenue/AOV segmented control that re-sorts and rescales bars. `LeaderboardRow` takes `primaryValue` + `barMax` (not `revenue` + `maxRevenue`). Use the `computeAov(row)` helper — it handles the fact that `get_geo_revenue_by_zip` doesn't return `avg_order_value` and falls back to `revenue / order_count`.
- **No top-N cap on states**: `sortedStates.map(...)` (no `.slice(0, 25)`). The `max-h-[500px] overflow-y-auto` container handles scrolling. Cities and zips are still capped to 50 rows (RPCs cap at 200 server-side).

## Security Audit (2026-04-09)

Cross-app API key audit findings:
- **GRID is clean** — uses `.env` with Supabase anon key only (publishable, fine for frontend)
- **Never commit .env files with real secrets** — use `.env.example` pattern (GRID already does this correctly)
- **3 keys to rotate across other repos**: OpenAI (CAGE), Anthropic (TARA), Supabase service role (TARA)
- **Supabase anon keys in frontend are fine** — they're publishable by design, RLS protects data
