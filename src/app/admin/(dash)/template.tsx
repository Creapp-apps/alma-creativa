// Se remonta en cada navegación → anima la entrada de cada vista (sutil).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="view-enter">{children}</div>;
}
