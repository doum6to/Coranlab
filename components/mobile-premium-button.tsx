import Link from "next/link";

export const MobilePremiumButton = () => {
  return (
    <Link
      href="/premium"
      className="rounded-lg px-3 py-1.5 text-[11px] font-bold text-white animate-premium-gradient"
      style={{
        background:
          "linear-gradient(90deg, #050C38 0%, #6700A3 25%, #E02F75 50%, #FF5A57 75%, #050C38 100%)",
        backgroundSize: "400% 100%",
        boxShadow: "0 2px 0 0 rgba(5, 12, 56, 0.4)",
      }}
    >
      Devenir Premium
    </Link>
  );
};
