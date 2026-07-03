import { getApplePayDomainAssociation } from "@/lib/apple-pay";

export const runtime = "nodejs";

export async function GET() {
  const contents = getApplePayDomainAssociation();

  if (!contents) {
    return new Response("Apple Pay domain verification is not configured.", {
      status: 404,
    });
  }

  return new Response(contents, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
