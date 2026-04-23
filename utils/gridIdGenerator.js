export const calculateGridId = (lat, lon) => {
  const latInt = Math.floor(lat * 100);
  const lonInt = Math.floor(lon * 100);
  // Padding ensures 'LAT0992' instead of 'LAT992' for consistency
  const latStr = String(latInt).padStart(4, '0');
  const lonStr = String(lonInt).padStart(5, '0');
  return `LAT${latStr}LON${lonStr}`;
};

export const calculateCityGridId = (lat, lon) => {
  const latInt = Math.floor(lat * 10);
  const lonInt = Math.floor(lon * 10);
  const latStr = String(latInt).padStart(3, '0');
  const lonStr = String(lonInt).padStart(4, '0');
  return `LAT${latStr}LON${lonStr}`;
};