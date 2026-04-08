// Top ~300 US cities by population with [lng, lat] coordinates
// Used for placing revenue bubbles on the state drill-down map
export const CITY_COORDS = {
  // Florida
  'Miami,FL':[-80.19,25.76],'Orlando,FL':[-81.38,28.54],'Jacksonville,FL':[-81.66,30.33],
  'Tampa,FL':[-82.46,27.95],'St. Petersburg,FL':[-82.64,27.77],'Hialeah,FL':[-80.28,25.86],
  'Fort Lauderdale,FL':[-80.14,26.12],'Tallahassee,FL':[-84.28,30.44],'Port Saint Lucie,FL':[-80.35,27.29],
  'Cape Coral,FL':[-81.95,26.56],'Pembroke Pines,FL':[-80.34,26.01],'Hollywood,FL':[-80.15,26.01],
  'Gainesville,FL':[-82.33,29.65],'Coral Springs,FL':[-80.27,26.27],'Clearwater,FL':[-82.8,27.97],
  'Sarasota,FL':[-82.53,27.34],'Lakeland,FL':[-81.95,28.04],'Doral,FL':[-80.36,25.82],
  'Winter Garden,FL':[-81.59,28.57],'Naples,FL':[-81.79,26.14],'Boca Raton,FL':[-80.08,26.36],
  'Kissimmee,FL':[-81.42,28.29],'West Palm Beach,FL':[-80.05,26.72],'Ocala,FL':[-82.14,29.19],
  'Daytona Beach,FL':[-81.02,29.21],'Pensacola,FL':[-87.22,30.42],
  // California
  'Los Angeles,CA':[-118.24,34.05],'San Diego,CA':[-117.16,32.72],'San Jose,CA':[-121.89,37.34],
  'San Francisco,CA':[-122.42,37.77],'Fresno,CA':[-119.77,36.75],'Sacramento,CA':[-121.49,38.58],
  'Long Beach,CA':[-118.19,33.77],'Oakland,CA':[-122.27,37.8],'Bakersfield,CA':[-119.02,35.37],
  'Anaheim,CA':[-117.91,33.84],'Riverside,CA':[-117.4,33.95],'Santa Ana,CA':[-117.87,33.75],
  'Irvine,CA':[-117.83,33.68],'Stockton,CA':[-121.29,37.96],'Chula Vista,CA':[-117.08,32.64],
  'Santa Clarita,CA':[-118.54,34.39],'San Bernardino,CA':[-117.29,34.11],'Modesto,CA':[-120.997,37.64],
  'Huntington Beach,CA':[-117.99,33.66],'Glendale,CA':[-118.26,34.14],'Pasadena,CA':[-118.14,34.15],
  // Texas
  'Houston,TX':[-95.37,29.76],'San Antonio,TX':[-98.49,29.42],'Dallas,TX':[-96.80,32.78],
  'Austin,TX':[-97.74,30.27],'Fort Worth,TX':[-97.33,32.75],'El Paso,TX':[-106.44,31.76],
  'Arlington,TX':[-97.11,32.74],'Corpus Christi,TX':[-97.4,27.8],'Plano,TX':[-96.7,33.02],
  'Laredo,TX':[-99.51,27.51],'Lubbock,TX':[-101.85,33.58],'Irving,TX':[-96.95,32.81],
  'Garland,TX':[-96.64,32.91],'Frisco,TX':[-96.82,33.15],'McKinney,TX':[-96.62,33.2],
  'Round Rock,TX':[-97.68,30.51],'Midland,TX':[-102.08,31.99],
  // New York
  'New York,NY':[-74.006,40.71],'Buffalo,NY':[-78.88,42.89],'Rochester,NY':[-77.61,43.16],
  'Yonkers,NY':[-73.9,40.93],'Syracuse,NY':[-76.15,43.05],'Albany,NY':[-73.76,42.65],
  'Brooklyn,NY':[-73.95,40.65],'Bronx,NY':[-73.87,40.85],'Queens,NY':[-73.79,40.73],
  // Pennsylvania
  'Philadelphia,PA':[-75.17,39.95],'Pittsburgh,PA':[-79.99,40.44],'Allentown,PA':[-75.49,40.6],
  'Erie,PA':[-80.09,42.13],'Reading,PA':[-75.93,40.34],'Scranton,PA':[-75.66,41.41],
  // Illinois
  'Chicago,IL':[-87.63,41.88],'Aurora,IL':[-88.32,41.76],'Naperville,IL':[-88.15,41.79],
  'Joliet,IL':[-88.08,41.53],'Rockford,IL':[-89.09,42.27],'Springfield,IL':[-89.64,39.78],
  // Ohio
  'Columbus,OH':[-82.99,39.96],'Cleveland,OH':[-81.69,41.5],'Cincinnati,OH':[-84.51,39.1],
  'Toledo,OH':[-83.56,41.65],'Akron,OH':[-81.52,41.08],'Dayton,OH':[-84.19,39.76],
  // Georgia
  'Atlanta,GA':[-84.39,33.75],'Augusta,GA':[-81.97,33.47],'Columbus,GA':[-84.99,32.46],
  'Savannah,GA':[-81.1,32.08],'Athens,GA':[-83.38,33.96],'Macon,GA':[-83.63,32.84],
  // Washington
  'Seattle,WA':[-122.33,47.61],'Spokane,WA':[-117.43,47.66],'Tacoma,WA':[-122.44,47.25],
  'Vancouver,WA':[-122.66,45.64],'Bellevue,WA':[-122.2,47.61],'Kent,WA':[-122.24,47.38],
  // North Carolina
  'Charlotte,NC':[-80.84,35.23],'Raleigh,NC':[-78.64,35.78],'Greensboro,NC':[-79.79,36.07],
  'Durham,NC':[-78.9,35.99],'Winston-Salem,NC':[-80.24,36.1],'Fayetteville,NC':[-78.88,35.05],
  // Virginia
  'Virginia Beach,VA':[-75.98,36.85],'Norfolk,VA':[-76.29,36.85],'Chesapeake,VA':[-76.29,36.77],
  'Richmond,VA':[-77.44,37.54],'Arlington,VA':[-77.09,38.88],'Alexandria,VA':[-77.05,38.8],
  // Michigan
  'Detroit,MI':[-83.05,42.33],'Grand Rapids,MI':[-85.67,42.96],'Warren,MI':[-83.03,42.49],
  'Ann Arbor,MI':[-83.74,42.28],'Lansing,MI':[-84.55,42.73],'Flint,MI':[-83.69,43.01],
  // Colorado
  'Denver,CO':[-104.99,39.74],'Colorado Springs,CO':[-104.82,38.83],'Aurora,CO':[-104.83,39.73],
  'Fort Collins,CO':[-105.08,40.59],'Boulder,CO':[-105.27,40.01],'Lakewood,CO':[-105.08,39.7],
  // Arizona
  'Phoenix,AZ':[-112.07,33.45],'Tucson,AZ':[-110.97,32.22],'Mesa,AZ':[-111.83,33.42],
  'Chandler,AZ':[-111.84,33.3],'Scottsdale,AZ':[-111.93,33.49],'Gilbert,AZ':[-111.79,33.35],
  'Tempe,AZ':[-111.94,33.41],
  // Tennessee
  'Nashville,TN':[-86.78,36.16],'Memphis,TN':[-90.05,35.15],'Knoxville,TN':[-83.92,35.96],
  'Chattanooga,TN':[-85.31,35.05],'Murfreesboro,TN':[-86.39,35.85],
  // Indiana
  'Indianapolis,IN':[-86.16,39.77],'Fort Wayne,IN':[-85.13,41.08],'Evansville,IN':[-87.56,37.97],
  'South Bend,IN':[-86.25,41.68],'Carmel,IN':[-86.12,39.98],
  // Massachusetts
  'Boston,MA':[-71.06,42.36],'Worcester,MA':[-71.8,42.26],'Springfield,MA':[-72.59,42.1],
  'Cambridge,MA':[-71.11,42.37],'Lowell,MA':[-71.32,42.63],
  // Maryland
  'Baltimore,MD':[-76.61,39.29],'Frederick,MD':[-77.41,39.41],'Rockville,MD':[-77.15,39.08],
  'Gaithersburg,MD':[-77.2,39.14],'Bowie,MD':[-76.73,38.94],
  // Missouri
  'Kansas City,MO':[-94.58,39.1],'St. Louis,MO':[-90.2,38.63],'Springfield,MO':[-93.29,37.22],
  'Columbia,MO':[-92.33,38.95],"St. Joseph,MO":[-94.85,39.77],
  // Minnesota
  'Minneapolis,MN':[-93.27,44.98],'St. Paul,MN':[-93.09,44.95],'Rochester,MN':[-92.47,44.02],
  'Duluth,MN':[-92.1,46.79],'Bloomington,MN':[-93.3,44.84],
  // Wisconsin
  'Milwaukee,WI':[-87.91,43.04],'Madison,WI':[-89.4,43.07],'Green Bay,WI':[-88.02,44.51],
  'Kenosha,WI':[-87.82,42.58],'Racine,WI':[-87.78,42.73],
  // New Jersey
  'Newark,NJ':[-74.17,40.74],'Jersey City,NJ':[-74.08,40.73],'Paterson,NJ':[-74.17,40.92],
  'Elizabeth,NJ':[-74.21,40.66],'Trenton,NJ':[-74.76,40.22],
  // Oregon
  'Portland,OR':[-122.68,45.52],'Salem,OR':[-123.04,44.94],'Eugene,OR':[-123.09,44.05],
  'Bend,OR':[-121.31,44.06],'Medford,OR':[-122.87,42.33],
  // Nevada
  'Las Vegas,NV':[-115.14,36.17],'Henderson,NV':[-114.98,36.04],'Reno,NV':[-119.81,39.53],
  'North Las Vegas,NV':[-115.12,36.2],'Sparks,NV':[-119.75,39.53],
  // Louisiana
  'New Orleans,LA':[-90.07,29.95],'Baton Rouge,LA':[-91.19,30.45],'Shreveport,LA':[-93.75,32.53],
  'Lafayette,LA':[-92.02,30.22],'Lake Charles,LA':[-93.22,30.23],
  // Alabama
  'Birmingham,AL':[-86.8,33.52],'Montgomery,AL':[-86.3,32.37],'Huntsville,AL':[-86.59,34.73],
  'Mobile,AL':[-88.04,30.69],'Tuscaloosa,AL':[-87.57,33.21],
  // South Carolina
  'Charleston,SC':[-79.93,32.78],'Columbia,SC':[-81.03,34],'Greenville,SC':[-82.39,34.85],
  'North Charleston,SC':[-79.97,32.85],'Myrtle Beach,SC':[-78.89,33.69],
  // Connecticut
  'Bridgeport,CT':[-73.2,41.18],'New Haven,CT':[-72.93,41.31],'Hartford,CT':[-72.68,41.76],
  'Stamford,CT':[-73.54,41.05],'Waterbury,CT':[-73.05,41.56],
  // Utah
  'Salt Lake City,UT':[-111.89,40.76],'Provo,UT':[-111.66,40.23],'West Jordan,UT':[-111.94,40.61],
  'Orem,UT':[-111.69,40.3],'Sandy,UT':[-111.88,40.57],
  // Oklahoma
  'Oklahoma City,OK':[-97.52,35.47],'Tulsa,OK':[-95.99,36.15],'Norman,OK':[-97.44,35.22],
  'Broken Arrow,OK':[-95.78,36.06],'Edmond,OK':[-97.48,35.65],
  // Iowa
  'Des Moines,IA':[-93.61,41.59],'Cedar Rapids,IA':[-91.64,42],'Davenport,IA':[-90.58,41.52],
  'Sioux City,IA':[-96.4,42.5],'Iowa City,IA':[-91.53,41.66],
  // Kansas
  'Wichita,KS':[-97.34,37.69],'Overland Park,KS':[-94.67,38.98],'Kansas City,KS':[-94.63,39.11],
  'Olathe,KS':[-94.82,38.88],'Topeka,KS':[-95.68,39.05],
  // Kentucky
  'Louisville,KY':[-85.76,38.25],'Lexington,KY':[-84.5,38.04],'Bowling Green,KY':[-86.44,36.99],
  'Covington,KY':[-84.51,39.08],
  // Arkansas
  'Little Rock,AR':[-92.29,34.75],'Fort Smith,AR':[-94.4,35.39],'Fayetteville,AR':[-94.16,36.06],
  'Bentonville,AR':[-94.21,36.37],
  // Other states - capitals + major cities
  'Anchorage,AK':[-149.9,61.22],'Honolulu,HI':[-157.86,21.31],
  'Boise,ID':[-116.2,43.62],'Portland,ME':[-70.26,43.66],
  'Manchester,NH':[-71.45,42.99],'Wilmington,DE':[-75.55,39.74],
  'Providence,RI':[-71.41,41.82],'Burlington,VT':[-73.21,44.48],
  'Billings,MT':[-108.5,45.78],'Omaha,NE':[-95.93,41.26],'Lincoln,NE':[-96.68,40.81],
  'Albuquerque,NM':[-106.65,35.08],'Santa Fe,NM':[-105.94,35.69],
  'Fargo,ND':[-96.79,46.88],'Sioux Falls,SD':[-96.73,43.55],
  'Charleston,WV':[-81.63,38.35],'Cheyenne,WY':[-104.82,41.14],
  'Jackson,MS':[-90.18,32.3],'Washington,DC':[-77.04,38.91],
};

export function getCityCoordinates(cityName, stateAbbr) {
  // Try exact match first
  const key = `${cityName},${stateAbbr}`;
  if (CITY_COORDS[key]) return CITY_COORDS[key];

  // Try case-insensitive
  const lowerCity = cityName.toLowerCase();
  for (const [k, v] of Object.entries(CITY_COORDS)) {
    const [c, s] = k.split(',');
    if (s === stateAbbr && c.toLowerCase() === lowerCity) return v;
  }

  return null;
}
