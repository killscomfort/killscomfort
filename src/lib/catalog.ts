import { getBookingService, type BookingService } from "@/lib/booking-services";
import { getMerchItem, type MerchItem } from "@/lib/merch";

export type MerchCatalogItem = MerchItem & { kind: "merch" };
export type ServiceCatalogItem = BookingService & { kind: "service" };
export type CatalogItem = MerchCatalogItem | ServiceCatalogItem;

export function getCatalogItem(slug: string): CatalogItem | undefined {
  const merch = getMerchItem(slug);
  if (merch) return { ...merch, kind: "merch" };

  const service = getBookingService(slug);
  if (service) return { ...service, kind: "service" };

  return undefined;
}

export function catalogItemRequiresShipping(item: CatalogItem) {
  return item.kind === "merch";
}
