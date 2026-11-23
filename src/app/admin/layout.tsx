import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Back-office",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh bg-secondary/30">{children}</div>;
}
