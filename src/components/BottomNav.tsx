"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Navigazione principale (sez. 4): Home | Allenati | Errori | Salvate |
 * Progressi | Impostazioni. Barra inferiore su mobile, resta in basso anche su
 * desktop per semplicita' in questa fase.
 */
const NAV_ITEMS: { href: string; label: string; icon: string }[] = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/allenati", label: "Allenati", icon: "dumbbell" },
  { href: "/errori", label: "Errori", icon: "alert" },
  { href: "/salvate", label: "Salvate", icon: "bookmark" },
  { href: "/progressi", label: "Progressi", icon: "chart" },
  { href: "/impostazioni", label: "Impostazioni", icon: "gear" },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navigazione principale"
      className="fixed bottom-0 inset-x-0 z-20 border-t border-border bg-card/95 backdrop-blur"
    >
      <ul className="max-w-2xl mx-auto grid grid-cols-6">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <NavIcon name={item.icon} active={active} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? "var(--primary)" : "var(--muted)";
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 4l9 6.5" />
          <path d="M5 9.5V20h14V9.5" />
        </svg>
      );
    case "dumbbell":
      return (
        <svg {...common}>
          <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <path d="M12 3 2 20h20L12 3Z" />
          <path d="M12 10v4M12 17h.01" />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...common}>
          <path d="M6 3h12v18l-6-4-6 4V3Z" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6" />
        </svg>
      );
    case "gear":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
        </svg>
      );
    default:
      return null;
  }
}
