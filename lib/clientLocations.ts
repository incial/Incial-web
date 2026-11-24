import type { ClientLocation } from "@/lib/dataLoader";

/** Incial's base: every client thread on the world map starts here. */
export const HQ_LOCATION: ClientLocation = {
  label: "Kanjirappally, Kerala",
  lat: 9.55,
  lng: 76.79,
};

/** Cities offered in the admin location picker (custom coordinates are also allowed). */
export const LOCATION_PRESETS: ReadonlyArray<ClientLocation> = [
  { label: "Kochi, India", lat: 9.93, lng: 76.27 },
  { label: "Thiruvananthapuram, India", lat: 8.52, lng: 76.94 },
  { label: "Bengaluru, India", lat: 12.97, lng: 77.59 },
  { label: "Chennai, India", lat: 13.08, lng: 80.27 },
  { label: "Hyderabad, India", lat: 17.39, lng: 78.49 },
  { label: "Mumbai, India", lat: 19.08, lng: 72.88 },
  { label: "Pune, India", lat: 18.52, lng: 73.86 },
  { label: "Delhi, India", lat: 28.61, lng: 77.21 },
  { label: "Kolkata, India", lat: 22.57, lng: 88.36 },
  { label: "Dubai, UAE", lat: 25.2, lng: 55.27 },
  { label: "Abu Dhabi, UAE", lat: 24.45, lng: 54.38 },
  { label: "Doha, Qatar", lat: 25.29, lng: 51.53 },
  { label: "Riyadh, Saudi Arabia", lat: 24.71, lng: 46.68 },
  { label: "Muscat, Oman", lat: 23.59, lng: 58.41 },
  { label: "Kuwait City, Kuwait", lat: 29.38, lng: 47.99 },
  { label: "Manama, Bahrain", lat: 26.23, lng: 50.59 },
  { label: "Singapore", lat: 1.35, lng: 103.82 },
  { label: "Kuala Lumpur, Malaysia", lat: 3.14, lng: 101.69 },
  { label: "Hong Kong", lat: 22.32, lng: 114.17 },
  { label: "Tokyo, Japan", lat: 35.68, lng: 139.69 },
  { label: "Sydney, Australia", lat: -33.87, lng: 151.21 },
  { label: "Melbourne, Australia", lat: -37.81, lng: 144.96 },
  { label: "Auckland, New Zealand", lat: -36.85, lng: 174.76 },
  { label: "London, United Kingdom", lat: 51.51, lng: -0.13 },
  { label: "Paris, France", lat: 48.86, lng: 2.35 },
  { label: "Berlin, Germany", lat: 52.52, lng: 13.4 },
  { label: "Amsterdam, Netherlands", lat: 52.37, lng: 4.9 },
  { label: "Zurich, Switzerland", lat: 47.37, lng: 8.54 },
  { label: "Stockholm, Sweden", lat: 59.33, lng: 18.07 },
  { label: "New York, USA", lat: 40.71, lng: -74.01 },
  { label: "San Francisco, USA", lat: 37.77, lng: -122.42 },
  { label: "Los Angeles, USA", lat: 34.05, lng: -118.24 },
  { label: "Chicago, USA", lat: 41.88, lng: -87.63 },
  { label: "Austin, USA", lat: 30.27, lng: -97.74 },
  { label: "Toronto, Canada", lat: 43.65, lng: -79.38 },
  { label: "Vancouver, Canada", lat: 49.28, lng: -123.12 },
  { label: "Mexico City, Mexico", lat: 19.43, lng: -99.13 },
  { label: "São Paulo, Brazil", lat: -23.55, lng: -46.63 },
  { label: "Cape Town, South Africa", lat: -33.92, lng: 18.42 },
  { label: "Nairobi, Kenya", lat: -1.29, lng: 36.82 },
  { label: "Lagos, Nigeria", lat: 6.52, lng: 3.38 },
];

/** True when the coordinates can be placed on the map. */
export function isValidLocation(
  location: ClientLocation | undefined,
): location is ClientLocation {
  return (
    !!location &&
    Number.isFinite(location.lat) &&
    Number.isFinite(location.lng) &&
    Math.abs(location.lat) <= 90 &&
    Math.abs(location.lng) <= 180
  );
}
