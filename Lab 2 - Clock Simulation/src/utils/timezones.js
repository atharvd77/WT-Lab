// A curated, human-friendly catalogue of IANA timezones. Kept as a static
// list (rather than Intl.supportedValuesOf, which isn't available in every
// browser) so the searchable selector works everywhere out of the box.
export const TIMEZONE_CATALOGUE = [
  { id: 'America/New_York', city: 'New York', country: 'United States' },
  { id: 'America/Los_Angeles', city: 'Los Angeles', country: 'United States' },
  { id: 'America/Chicago', city: 'Chicago', country: 'United States' },
  { id: 'America/Denver', city: 'Denver', country: 'United States' },
  { id: 'America/Anchorage', city: 'Anchorage', country: 'United States' },
  { id: 'America/Toronto', city: 'Toronto', country: 'Canada' },
  { id: 'America/Vancouver', city: 'Vancouver', country: 'Canada' },
  { id: 'America/Mexico_City', city: 'Mexico City', country: 'Mexico' },
  { id: 'America/Sao_Paulo', city: 'São Paulo', country: 'Brazil' },
  { id: 'America/Buenos_Aires', city: 'Buenos Aires', country: 'Argentina' },
  { id: 'Europe/London', city: 'London', country: 'United Kingdom' },
  { id: 'Europe/Paris', city: 'Paris', country: 'France' },
  { id: 'Europe/Berlin', city: 'Berlin', country: 'Germany' },
  { id: 'Europe/Madrid', city: 'Madrid', country: 'Spain' },
  { id: 'Europe/Rome', city: 'Rome', country: 'Italy' },
  { id: 'Europe/Amsterdam', city: 'Amsterdam', country: 'Netherlands' },
  { id: 'Europe/Moscow', city: 'Moscow', country: 'Russia' },
  { id: 'Europe/Istanbul', city: 'Istanbul', country: 'Turkey' },
  { id: 'Africa/Cairo', city: 'Cairo', country: 'Egypt' },
  { id: 'Africa/Lagos', city: 'Lagos', country: 'Nigeria' },
  { id: 'Africa/Johannesburg', city: 'Johannesburg', country: 'South Africa' },
  { id: 'Africa/Nairobi', city: 'Nairobi', country: 'Kenya' },
  { id: 'Asia/Dubai', city: 'Dubai', country: 'UAE' },
  { id: 'Asia/Karachi', city: 'Karachi', country: 'Pakistan' },
  { id: 'Asia/Kolkata', city: 'Mumbai', country: 'India' },
  { id: 'Asia/Dhaka', city: 'Dhaka', country: 'Bangladesh' },
  { id: 'Asia/Bangkok', city: 'Bangkok', country: 'Thailand' },
  { id: 'Asia/Jakarta', city: 'Jakarta', country: 'Indonesia' },
  { id: 'Asia/Singapore', city: 'Singapore', country: 'Singapore' },
  { id: 'Asia/Hong_Kong', city: 'Hong Kong', country: 'China' },
  { id: 'Asia/Shanghai', city: 'Shanghai', country: 'China' },
  { id: 'Asia/Seoul', city: 'Seoul', country: 'South Korea' },
  { id: 'Asia/Tokyo', city: 'Tokyo', country: 'Japan' },
  { id: 'Asia/Manila', city: 'Manila', country: 'Philippines' },
  { id: 'Australia/Perth', city: 'Perth', country: 'Australia' },
  { id: 'Australia/Adelaide', city: 'Adelaide', country: 'Australia' },
  { id: 'Australia/Sydney', city: 'Sydney', country: 'Australia' },
  { id: 'Australia/Brisbane', city: 'Brisbane', country: 'Australia' },
  { id: 'Pacific/Auckland', city: 'Auckland', country: 'New Zealand' },
  { id: 'Pacific/Honolulu', city: 'Honolulu', country: 'United States' },
  { id: 'Pacific/Fiji', city: 'Suva', country: 'Fiji' },
  { id: 'Asia/Tehran', city: 'Tehran', country: 'Iran' },
  { id: 'Asia/Jerusalem', city: 'Jerusalem', country: 'Israel' },
  { id: 'Europe/Athens', city: 'Athens', country: 'Greece' },
  { id: 'Europe/Zurich', city: 'Zurich', country: 'Switzerland' },
  { id: 'Europe/Stockholm', city: 'Stockholm', country: 'Sweden' },
  { id: 'Asia/Ho_Chi_Minh', city: 'Ho Chi Minh City', country: 'Vietnam' },
  { id: 'America/Bogota', city: 'Bogotá', country: 'Colombia' },
  { id: 'America/Lima', city: 'Lima', country: 'Peru' },
  { id: 'America/Santiago', city: 'Santiago', country: 'Chile' },
  { id: 'UTC', city: 'Coordinated Universal Time', country: 'UTC' },
];

export function searchTimezones(query) {
  if (!query || !query.trim()) return TIMEZONE_CATALOGUE.slice(0, 12);
  const q = query.trim().toLowerCase();
  return TIMEZONE_CATALOGUE.filter(
    (tz) =>
      tz.city.toLowerCase().includes(q) ||
      tz.country.toLowerCase().includes(q) ||
      tz.id.toLowerCase().includes(q)
  ).slice(0, 12);
}
