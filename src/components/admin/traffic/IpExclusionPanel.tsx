"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addExcludedIp, removeExcludedIp } from "@/lib/admin/traffic-actions";
import type { ExcludedIp } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Props = {
  excludedIps: ExcludedIp[];
  onChanged?: () => void;
};

export function IpExclusionPanel({ excludedIps, onChanged }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState("My computer");
  const [ip, setIp] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function detectMyIp() {
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/traffic/my-ip");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not detect IP");
      if (!data.ip) throw new Error("No IP detected");

      setIp(data.ip);
      setCity(data.city || "");
      setRegion(data.region || "");
      if (!label.trim() || label === "My computer") {
        setLabel(
          `My computer (${data.city || data.region || "unknown location"})`
        );
      }
      setMessage(`Detected ${data.ip}${data.city ? ` — ${data.city}` : ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Detection failed");
    }
  }

  function saveExclusion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await addExcludedIp(formData);
        setMessage("IP excluded from traffic analytics.");
        setIp("");
        router.refresh();
        onChanged?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function remove(id: string) {
    setError("");
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      try {
        await removeExcludedIp(formData);
        setMessage("Exclusion removed.");
        router.refresh();
        onChanged?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Remove failed");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg text-bone">Exclude my IP</h3>
        <p className="mt-1 text-sm text-bone/60">
          Keep your own visits out of traffic stats. Detect your current IP, label
          this device, and save.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={detectMyIp} disabled={pending}>
          Locate &amp; fill my IP
        </Button>
      </div>

      <form onSubmit={saveExclusion} className="grid gap-4 sm:grid-cols-2">
        <Input
          name="label"
          label="Location label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Home studio — Miami"
          required
        />
        <Input
          name="ip_address"
          label="IP address"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="203.0.113.10"
          required
        />
        <input type="hidden" name="city" value={city} />
        <input type="hidden" name="region" value={region} />

        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending || !ip}>
            {pending ? "Saving..." : "Save exclusion"}
          </Button>
        </div>
      </form>

      {message && <p className="text-sm text-moss-green">{message}</p>}
      {error && <p className="text-sm text-dried-blood">{error}</p>}

      {excludedIps.length > 0 && (
        <ul className="space-y-2 border-t border-clay/20 pt-4">
          {excludedIps.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 border border-clay/20 px-4 py-3 text-sm"
            >
              <div>
                <p className="text-bone">{row.label}</p>
                <p className="font-mono text-bone/60">{row.ip_address}</p>
                {(row.city || row.region) && (
                  <p className="text-bone/45">
                    {[row.city, row.region].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(row.id)}
                disabled={pending}
                className="text-xs uppercase tracking-widest text-dried-blood hover:text-bone"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
