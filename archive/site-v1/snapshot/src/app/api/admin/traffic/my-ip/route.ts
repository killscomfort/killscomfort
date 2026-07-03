import { NextRequest, NextResponse } from "next/server";
import { getAdminServiceClient } from "@/lib/admin/auth";
import { getClientIp } from "@/lib/request-ip";
import { lookupIpGeo } from "@/lib/geo/ip-lookup";

export async function GET(request: NextRequest) {
  try {
    await getAdminServiceClient();
    const ip = getClientIp(request);
    const geo = await lookupIpGeo(ip);

    return NextResponse.json({
      ip,
      city: geo.city,
      region: geo.region,
      country: geo.country,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
