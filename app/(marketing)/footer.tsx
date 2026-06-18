import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="hidden lg:block h-20 w-full border-t-2 border-slate-200 p-2">
      <div className="max-w-screen-lg mx-auto flex items-center justify-center gap-4 h-full text-sm text-brilliant-muted">
        <p>© {new Date().getFullYear()} Quranlab. Tous droits réservés.</p>
        <span aria-hidden>·</span>
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
