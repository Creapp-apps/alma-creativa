import { Suspense } from "react";
import { ListSkeleton } from "@/components/admin/skeletons";
import { InboxView } from "@/components/admin/inbox-view";

export default function AdminLeadsPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <InboxView />
    </Suspense>
  );
}
