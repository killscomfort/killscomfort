import { Archivo_Narrow, Space_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const rideDisplay = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ride-display",
  display: "swap",
});

const rideMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-ride-mono",
  display: "swap",
});

export default function RideLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        rideDisplay.variable,
        rideMono.variable,
        "fixed inset-0 z-[200] h-[100dvh] w-full bg-near-black"
      )}
    >
      {children}
    </div>
  );
}
