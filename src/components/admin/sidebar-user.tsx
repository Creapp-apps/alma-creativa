import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { UserMenu } from "@/components/admin/user-menu";

export async function SidebarUser() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email ?? "staff";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserMenu email={email} />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
