import Link from "next/link";
import type { ReactNode } from "react";

/** Primitive UI riutilizzabili coerenti col design system (sez. 14, 29). */

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`glass rounded-2xl border border-border p-5 shadow-[0_20px_60px_rgba(0,0,0,0.4)] ${className}`}
    >
      {children}
    </div>
  );
}

export function PageTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-5">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
    </header>
  );
}

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl border border-border p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 font-[family-name:var(--font-space)] text-2xl font-bold text-primary">
        {value}
      </p>
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "success" | "danger" | "warning";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/5 text-muted ring-1 ring-inset ring-white/10",
    primary: "bg-primary/15 text-primary ring-1 ring-inset ring-primary/30",
    success: "bg-success/15 text-success ring-1 ring-inset ring-success/30",
    danger: "bg-danger/15 text-danger ring-1 ring-inset ring-danger/30",
    warning: "bg-warning/15 text-warning ring-1 ring-inset ring-warning/30",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

const buttonBase =
  "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40 disabled:pointer-events-none";

const buttonTones: Record<string, string> = {
  primary:
    "bg-gradient-to-r from-primary to-[#2fa8e8] text-primary-fg shadow-[0_6px_28px_rgba(22,199,195,0.35)] hover:shadow-[0_10px_40px_rgba(22,199,195,0.5)] hover:-translate-y-0.5",
  secondary:
    "border border-primary/40 bg-primary/5 text-[#dff3f6] backdrop-blur hover:bg-primary/10 hover:-translate-y-0.5",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  return (
    <Link href={href} className={`${buttonBase} ${buttonTones[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className = "",
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${buttonBase} ${buttonTones[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </Card>
  );
}
