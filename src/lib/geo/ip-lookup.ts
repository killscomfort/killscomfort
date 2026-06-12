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

function normalizeCountry(code: string | null | undefined): string | null {
  if (!code) return null;
  return code.toUpperCase();
}

async function lookupIpWhoIs(ip: string): Promise<IpGeoResult | null> {
  const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    success?: boolean;
    city?: string;
    region?: string;
    country_code?: string;
    latitude?: number;
    longitude?: number;
  };

  if (!data.success) return null;

  return {
    city: data.city || null,
    neighborhood: null,
    region: data.region || null,
    country: normalizeCountry(data.country_code),
    latitude: typeof data.latitude === "number" ? data.latitude : null,
    longitude: typeof data.longitude === "number" ? data.longitude : null,
  };
}

async function lookupIpApiDistrict(ip: string): Promise<Pick<IpGeoResult, "neighborhood" | "city" | "region" | "country" | "latitude" | "longitude">> {
  const res = await fetch(
    `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,district,regionName,countryCode,lat,lon`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return {};

  const data = (await res.json()) as {
    status?: string;
    city?: string;
    district?: string;
    regionName?: string;
    countryCode?: string;
    lat?: number;
    lon?: number;
  };

  if (data.status !== "success") return {};

  return {
    city: data.city || null,
    neighborhood: data.district || null,
    region: data.regionName || null,
    country: normalizeCountry(data.countryCode),
    latitude: typeof data.lat === "number" ? data.lat : null,
    longitude: typeof data.lon === "number" ? data.lon : null,
  };
}

function mergeGeo(primary: IpGeoResult, fallback: Partial<IpGeoResult>): IpGeoResult {
  return {
    city: primary.city || fallback.city || null,
    neighborhood: primary.neighborhood || fallback.neighborhood || null,
    region: primary.region || fallback.region || null,
    country: primary.country || fallback.country || null,
    latitude: primary.latitude ?? fallback.latitude ?? null,
    longitude: primary.longitude ?? fallback.longitude ?? null,
  };
}

/** Resolve city/neighborhood/coordinates from a public IP (multi-source). */
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
    const [whois, ipApi] = await Promise.all([
      lookupIpWhoIs(ip),
      lookupIpApiDistrict(ip),
    ]);

    if (whois) return mergeGeo(whois, ipApi);
    if (ipApi.city || ipApi.latitude) {
      return mergeGeo(
        {
          city: ipApi.city ?? null,
          neighborhood: ipApi.neighborhood ?? null,
          region: ipApi.region ?? null,
          country: ipApi.country ?? null,
          latitude: ipApi.latitude ?? null,
          longitude: ipApi.longitude ?? null,
        },
        {}
      );
    }

    return empty;
  } catch {
    return empty;
  }
}
