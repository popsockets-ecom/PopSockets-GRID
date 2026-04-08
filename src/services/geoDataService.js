import { supabase } from '../lib/supabase.js';

export async function fetchTotals(from, to) {
  const { data, error } = await supabase.rpc('get_geo_revenue_totals', {
    p_from: from,
    p_to: to,
  });
  if (error) throw error;
  return data?.[0] || { total_revenue: 0, total_orders: 0, avg_order_value: 0, total_states: 0, total_cities: 0 };
}

export async function fetchStateRevenue(from, to) {
  const { data, error } = await supabase.rpc('get_geo_revenue_by_state', {
    p_from: from,
    p_to: to,
  });
  if (error) throw error;
  return data || [];
}

export async function fetchCityRevenue(from, to, state) {
  const { data, error } = await supabase.rpc('get_geo_revenue_by_city', {
    p_from: from,
    p_to: to,
    p_state: state,
  });
  if (error) throw error;
  return data || [];
}

export async function fetchTopCities(from, to, limit = 50) {
  const { data, error } = await supabase.rpc('get_geo_top_cities', {
    p_from: from,
    p_to: to,
    p_limit: limit,
  });
  if (error) throw error;
  return data || [];
}

export async function fetchZipRevenue(from, to, state) {
  const { data, error } = await supabase.rpc('get_geo_revenue_by_zip', {
    p_from: from,
    p_to: to,
    p_state: state,
  });
  if (error) throw error;
  return data || [];
}

// State name to abbreviation mapping
export const STATE_ABBR_TO_NAME = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia', PR: 'Puerto Rico', GU: 'Guam', VI: 'Virgin Islands',
  AS: 'American Samoa', MP: 'Northern Mariana Islands',
};

export const STATE_NAME_TO_ABBR = Object.fromEntries(
  Object.entries(STATE_ABBR_TO_NAME).map(([abbr, name]) => [name, abbr])
);

// State FIPS codes for matching topojson
export const STATE_FIPS = {
  AL: '01', AK: '02', AZ: '04', AR: '05', CA: '06', CO: '08', CT: '09', DE: '10',
  FL: '12', GA: '13', HI: '15', ID: '16', IL: '17', IN: '18', IA: '19', KS: '20',
  KY: '21', LA: '22', ME: '23', MD: '24', MA: '25', MI: '26', MN: '27', MS: '28',
  MO: '29', MT: '30', NE: '31', NV: '32', NH: '33', NJ: '34', NM: '35', NY: '36',
  NC: '37', ND: '38', OH: '39', OK: '40', OR: '41', PA: '42', RI: '44', SC: '45',
  SD: '46', TN: '47', TX: '48', UT: '49', VT: '50', VA: '51', WA: '53', WV: '54',
  WI: '55', WY: '56', DC: '11', PR: '72',
};

export const FIPS_TO_ABBR = Object.fromEntries(
  Object.entries(STATE_FIPS).map(([abbr, fips]) => [fips, abbr])
);
