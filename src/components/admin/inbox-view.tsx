import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Inbox, type Conversation } from "@/components/admin/inbox";

export async function InboxView() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <h1 className="font-display text-xl">Leads</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Supabase no está configurado. Cargá las variables en{" "}
          <code>.env.local</code> para ver la bandeja.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data } = await supabase
    .from("conversations")
    .select(
      "id,channel,external_id,contact_name,contact_handle,last_message_at,last_message_preview,last_inbound_at,unread,lead_id",
    )
    .order("last_message_at", { ascending: false, nullsFirst: false });

  return (
    <Inbox
      conversations={(data ?? []) as Conversation[]}
      userEmail={user.email ?? "staff"}
    />
  );
}
