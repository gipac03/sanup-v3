import { BottomNav } from "@/components/BottomNav";
import AppExperience from "@/components/AppExperience";

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
      <AppExperience />
      {/* Sfondo ambientale: bagliori soft coerenti con la landing, così le
          pagine con poco contenuto non sembrano un vuoto nero. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(22,199,195,0.13),transparent)] blur-2xl" />
        <div className="absolute bottom-[-12%] right-[-8%] h-[440px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(18,118,227,0.12),transparent)] blur-2xl" />
        <div className="absolute bottom-[6%] left-[-10%] h-[360px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(22,199,195,0.07),transparent)] blur-2xl" />
      </div>
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-6 pb-28">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
