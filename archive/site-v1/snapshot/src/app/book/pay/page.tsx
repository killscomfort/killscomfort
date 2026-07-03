import { redirect } from "next/navigation";

/** Legacy URL — service deposits live at /services */
export default function BookPayPage() {
  redirect("/services");
}
