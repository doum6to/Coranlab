import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="w-full border-t border-brilliant-border px-5 py-5">
      <div className="mx-auto flex max-w-screen-lg flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[0.8125rem] text-brilliant-muted">
        <p>© {new Date().getFullYear()} Quranlab. Tous droits réservés.</p>
        <span aria-hidden className="hidden sm:inline">·</span>
        <Link href="/conditions" className="hover:underline">
          Conditions
        </Link>
        <Link href="/confidentialite" className="hover:underline">
          Confidentialité
        </Link>
      </div>
    </footer>
  );
};
