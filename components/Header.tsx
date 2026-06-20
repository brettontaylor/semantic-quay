import Link from "next/link";
import { Logo } from "./Logo";

const nav = [
  { href: "/#approach", label: "Approach" },
  { href: "/developers", label: "Developers" },
  { href: "/#contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <Logo />
        <nav className="flex items-center gap-7">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hidden text-sm text-muted transition-colors hover:text-ink sm:inline"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
