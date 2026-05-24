"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  subtitle?: string;
};

export function AppHeader({ subtitle }: Props) {
  const pathname = usePathname();

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[var(--accent)]">Dominion Card Viewer</h1>
          {subtitle && <p className="text-xs text-[var(--muted)]">{subtitle}</p>}
        </div>
        <nav className="flex gap-2">
          <NavLink href="/" active={pathname === "/"}>
            Browse
          </NavLink>
          <NavLink href="/randomizer" active={pathname === "/randomizer"}>
            Randomizer
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg border px-3 py-1.5 text-sm transition ${
        active
          ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
          : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent-dim)] hover:text-[var(--text)]"
      }`}
    >
      {children}
    </Link>
  );
}
