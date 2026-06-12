import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { getClientIp } from "@/lib/request-ip";
import { lookupIpGeo } from "@/lib/geo/ip-lookup";

const bodySchema = z.object({
  path: z.string().min(1).max(500),
  referrer: z.string().max(2000).nullable().optional(),
  utm_source: z.string().max(200).nullable().optional(),
  utm_medium: z.string().max(200).nullable().optional(),
  utm_campaign: z.string().max(200).nullable().optional(),
  gclid: z.string().max(200).nullable().optional(),
});

function shouldTrackPath(path: string): boolean {
  if (path.startsWith("/admin")) return false;
  if (path.startsWith("/api")) return false;
  if (path.startsWith("/_next")) return false;
  if (path.includes(".")) return false;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const { path, referrer, utm_source, utm_medium, utm_campaign, gclid } =
      parsed.data;

    if (!shouldTrackPath(path)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const visitorIp = getClientIp(request);
    const supabase = createServiceClient();

    if (visitorIp) {
      const { data: excluded } = await supabase
        .from("excluded_ips")
        .select("id")
        .eq("ip_address", visitorIp)
        .maybeSingle();

      if (excluded) {
        return NextResponse.json({ ok: true, excluded: true });
      }
    }

    const geo = await lookupIpGeo(visitorIp);
    const userAgent = request.headers.get("user-agent");

    const { error } = await supabase.from("page_views").insert({
      visitor_ip: visitorIp,
      path,
      referrer: referrer || null,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      gclid: gclid || null,
      city: geo.city,
      neighborhood: geo.neighborhood,
      region: geo.region,
      country: geo.country,
      latitude: geo.latitude,
      longitude: geo.longitude,
      user_agent: userAgent,
    });

    if (error) {
      console.error("[page-view] insert failed:", error.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[page-view] error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
