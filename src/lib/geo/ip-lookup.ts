export type IpGeoResult = {
  city: string | null;
  neighborhood: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
};

function isPrivateIp(ip: string): boolean {
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("fe80:")) return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  return false;
}

/** Resolve city/region/coordinates from a public IP (best-effort). */
export async function lookupIpGeo(ip: string | null): Promise<IpGeoResult> {
  const empty: IpGeoResult = {
    city: null,
    neighborhood: null,
    region: null,
    country: null,
    latitude: null,
    longitude: null,
  };

  if (!ip || isPrivateIp(ip)) return empty;

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,district,regionName,countryCode,lat,lon`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) return empty;

    const data = (await res.json()) as {
      status?: string;
      city?: string;
      district?: string;
      regionName?: string;
      countryCode?: string;
      lat?: number;
      lon?: number;
    };

    if (data.status !== "success") return empty;

    return {
      city: data.city || null,
      neighborhood: data.district || null,
      region: data.regionName || null,
      country: data.countryCode || null,
      latitude: typeof data.lat === "number" ? data.lat : null,
      longitude: typeof data.lon === "number" ? data.lon : null,
    };
  } catch {
    return empty;
  }
}
