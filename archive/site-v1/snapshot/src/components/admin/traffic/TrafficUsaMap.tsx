"use client";

import { useEffect, useRef } from "react";
import type { TrafficMapPoint } from "@/lib/traffic/queries";
import "leaflet/dist/leaflet.css";

type Props = {
  points: TrafficMapPoint[];
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function popupHtml(point: TrafficMapPoint) {
  const city = escapeHtml(point.city || "Unknown city");
  const neighborhood = point.neighborhood
    ? `<br><span style="opacity:0.75">${escapeHtml(point.neighborhood)}</span>`
    : "";
  const region = point.region
    ? `<br><span style="opacity:0.6">${escapeHtml(point.region)}</span>`
    : "";
  const visits = point.count === 1 ? "1 visit" : `${point.count} visits`;

  return `<strong>${city}</strong>${neighborhood}${region}<br><span style="opacity:0.85">${visits}</span>`;
}

export function TrafficUsaMap({ points }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    void (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(container, {
        center: [39.8283, -98.5795],
        zoom: 4,
        minZoom: 3,
        maxZoom: 12,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      const latLngs: [number, number][] = [];

      for (const point of points) {
        const latLng: [number, number] = [point.latitude, point.longitude];
        latLngs.push(latLng);

        const radius = Math.min(22, 7 + Math.sqrt(point.count) * 4);

        L.circleMarker(latLng, {
          radius,
          color: "#ffffff",
          weight: 1.5,
          fillColor: "#ffffff",
          fillOpacity: 0.65,
        })
          .bindPopup(popupHtml(point), { closeButton: false })
          .addTo(map);
      }

      if (latLngs.length > 1) {
        map.fitBounds(L.latLngBounds(latLngs), {
          padding: [28, 28],
          maxZoom: 8,
        });
      } else if (latLngs.length === 1) {
        map.setView(latLngs[0], 10);
      }

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [points]);

  return (
    <div className="relative overflow-hidden rounded border border-clay/20">
      <div ref={containerRef} className="z-0 h-[380px] w-full [&_.leaflet-control-attribution]:bg-near-black/80 [&_.leaflet-control-attribution]:text-bone/45 [&_.leaflet-control-attribution_a]:text-muted-gold" />
      {points.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-near-black/70 text-sm text-bone/50">
          No US city locations in this range
        </div>
      )}
    </div>
  );
}
