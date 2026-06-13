import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InquiriesKanban } from "@/components/admin/InquiriesKanban";
import { normalizeInquiryStatus } from "@/lib/inquiry-status";
import type { Inquiry } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const supabase = await createClient();

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  const items = ((inquiries || []) as Inquiry[]).map((inquiry) => ({
    ...inquiry,
    status: normalizeInquiryStatus(inquiry.status),
  }));

  return (
    <>
      <AdminPageHeader
        title="Inquiries"
        description="Drag leads across the pipeline. Click a card for full details and edits."
      />

      {items.length === 0 ? (
        <p className="text-bone/50">No inquiries yet.</p>
      ) : (
        <InquiriesKanban inquiries={items} />
      )}
    </>
  );
}
