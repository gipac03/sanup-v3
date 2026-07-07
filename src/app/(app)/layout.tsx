import { BottomNav } from "@/components/BottomNav";

/**
 * Layout dell'area applicativa (dashboard, allenamenti, ecc.).
 * Fornisce il "chrome" condiviso: contenitore centrato + barra di navigazione.
 * La landing su "/" vive fuori da questo gruppo e resta full-bleed.
 */
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-full flex flex-col">
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-6 pb-28">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
