import { Users } from "lucide-react";
import { ComingSoon } from "@/components/admin/coming-soon";

export default function UsuariosPage() {
  return (
    <ComingSoon
      icon={Users}
      title="Usuarios"
      description="El equipo que accede al back-office."
      points={[
        "Invitar y dar de baja usuarios",
        "Roles y permisos",
        "Actividad reciente",
      ]}
    />
  );
}
