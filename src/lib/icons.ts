import {
  Mail,
  Hash,
  Candy,
  Ticket,
  VenetianMask,
  QrCode,
  Trophy,
  Gift,
  Package,
  type LucideIcon,
} from "lucide-react";

// La DB guarda el ícono como nombre (string). Acá lo mapeamos al componente.
// Al agregar categorías nuevas con otro ícono, sumá la entrada acá.
export const iconMap: Record<string, LucideIcon> = {
  Mail,
  Hash,
  Candy,
  Ticket,
  VenetianMask,
  QrCode,
  Trophy,
  Gift,
  Package,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Package;
}
