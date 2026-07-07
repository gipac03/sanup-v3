import Link from "next/link";

/**
 * Segnaposto della landing su "/". Nella fase successiva viene sostituito
 * dal porting React della landing (scena Three.js, bloom, ecc.).
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
      <h1 className="text-3xl font-bold tracking-tight">SanUp</h1>
      <p className="text-muted">Landing in arrivo.</p>
      <Link
        href="/home"
        className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-fg"
      >
        Entra nell&apos;app →
      </Link>
    </div>
  );
}
