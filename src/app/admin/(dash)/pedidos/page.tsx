import { Suspense } from "react";
import { ListSkeleton } from "@/components/admin/skeletons";
import { LeadsView } from "@/components/admin/leads-view";

export default function AdminPedidosPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <LeadsView kind="pedidos" />
    </Suspense>
  );
}
