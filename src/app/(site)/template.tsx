// Transición de entrada sutil al navegar entre páginas del sitio público.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="view-enter">{children}</div>;
}
