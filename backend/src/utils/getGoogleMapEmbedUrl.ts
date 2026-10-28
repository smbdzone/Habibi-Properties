const SHORT_MAP_LINK_HOSTS = new Set([
  "maps.app.goo.gl",
  "goo.gl",
]);

/**
 * Resolve Google Maps short URLs.
 *
 * Example:
 * maps.app.goo.gl/xxxxx
 *        ↓
 * www.google.com/maps/place/...
 */
export async function resolveMapUrl(url: string): Promise<string> {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return url;
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (!SHORT_MAP_LINK_HOSTS.has(hostname)) {
    return url;
  }

  try {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 5000);

    try {
      const response = await fetch(url, { redirect: "follow", signal: controller.signal });

      return response.url || url;
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return url;
  }
}

/**
 * Extract actual Google Maps pin coordinates.
 *
 * Priority:
 *
 * 1. !3dLAT!4dLNG
 * 2. q/query/ll/center
 * 3. @LAT,LNG
 */
export function extractCoordsFromMapUrl(
  url: string
): string | null {
  if (!url) return null;

  /**
   * Google Maps actual place/pin coordinates.
   *
   * Example:
   * !3d31.520420!4d74.358740
   */
  const pinMatch = url.match(
    /!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)/
  );

  if (pinMatch) {
    return `${pinMatch[1]},${pinMatch[2]}`;
  }

  /**
   * Check URL query parameters.
   *
   * Examples:
   * ?q=31.5204,74.3587
   * ?query=31.5204,74.3587
   * ?ll=31.5204,74.3587
   * ?center=31.5204,74.3587
   */
  try {
    const parsedUrl = new URL(url);

    for (const name of [
      "q",
      "query",
      "ll",
      "center",
    ]) {
      const value = parsedUrl.searchParams.get(name);

      if (!value) continue;

      const coordMatch = value.match(
        /^(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)$/
      );

      if (coordMatch) {
        return `${coordMatch[1]},${coordMatch[2]}`;
      }
    }
  } catch {
    // Invalid absolute URL
  }

  /**
   * @LAT,LNG is only a fallback.
   *
   * Google can move this coordinate because it represents
   * the map viewport rather than necessarily the place pin.
   */
  const atMatch = url.match(
    /@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/
  );

  if (atMatch) {
    return `${atMatch[1]},${atMatch[2]}`;
  }

  return null;
}

/**
 * Extract latitude and longitude separately.
 */
export function extractLatLngFromMapUrl(
  url: string
): {
  latitude: number;
  longitude: number;
} | null {
  const coords = extractCoordsFromMapUrl(url);

  if (!coords) {
    return null;
  }

  const [latitude, longitude] = coords
    .split(",")
    .map(Number);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  // Optional sanity check
  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}

/**
 * Extract human-readable place name from:
 *
 * /maps/place/Some+Place/...
 *
 * Example:
 * /maps/place/Palm+Jumeirah/@25.112...
 *
 * Returns:
 * "Palm Jumeirah"
 */
export function extractPlaceFromMapUrl(
  url: string
): string | null {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);

    const match = parsedUrl.pathname.match(
      /\/maps\/place\/([^/@]+)/
    );

    if (!match) {
      return null;
    }

    return decodeURIComponent(
      match[1]
        .replace(/\+/g, " ")
        .replace(/%2C/gi, ",")
    ).trim();
  } catch {
    return null;
  }
}

/**
 * Extract coordinates from a property's own
 * latitude and longitude fields.
 */
export function extractPropertyCoords(
  property: any
): string | null {
  const latitude = property?.latitude;
  const longitude = property?.longitude;

  if (
    latitude === undefined ||
    latitude === null ||
    longitude === undefined ||
    longitude === null
  ) {
    return null;
  }

  if (
    latitude === "" ||
    longitude === ""
  ) {
    return null;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return null;
  }

  if (
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  return `${lat},${lng}`;
}

/**
 * Resolve the best Google Maps search query for a property.
 *
 * Priority:
 *
 * 1. Map URL → actual coordinates
 * 2. Map URL → place name
 * 3. property.latitude + property.longitude
 * 4. property.title + location
 */
export async function resolveMapQuery(
  property: any,
  location: string
): Promise<string> {
  const rawMapUrl = String(
    property?.mapUrl ?? ""
  ).trim();

  if (rawMapUrl) {
    const resolvedUrl =
      await resolveMapUrl(rawMapUrl);

    // First try actual coordinates
    const coords =
      extractCoordsFromMapUrl(resolvedUrl);

    if (coords) {
      return coords;
    }

    // Then try place name
    const place =
      extractPlaceFromMapUrl(resolvedUrl);

    if (place) {
      return place;
    }
  }

  // Fallback to manually stored coordinates
  const propertyCoords =
    extractPropertyCoords(property);

  if (propertyCoords) {
    return propertyCoords;
  }

  // Last fallback:
  // Google Maps text search
  const title = String(
    property?.title ?? ""
  ).trim();

  const cleanLocation = String(
    location ?? ""
  ).trim();

  if (title && cleanLocation) {
    return `${title}, ${cleanLocation}`;
  }

  return title || cleanLocation;
}


export function isValidCoordinates(input: string): boolean {
  const match = input.trim().match(
    /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/
  );

  if (!match) return false;

  const lat = Number(match[1]);
  const lng = Number(match[2]);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}


export default resolveMapQuery;