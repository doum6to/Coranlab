import Link from "next/link";

export function BlogCTA() {
  return (
    <section
      className="mt-12 sm:mt-16 rounded-2xl border-2 border-[#5856c9] border-b-4 px-6 py-10 sm:px-10 sm:py-12 text-center text-white overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, #6967fb 0%, #4a48d4 100%)",
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10" />

      <div className="relative">
        <h2 className="text-xl sm:text-2xl font-bold font-heading mb-2">
          Prêt à apprendre le vocabulaire du Coran ?
        </h2>

        <p className="text-sm sm:text-base text-white/80 max-w-md mx-auto mb-8">
          Rejoins des milliers d&apos;apprenants et maîtrise 85% des mots du
          Coran grâce à des leçons interactives et des exercices adaptés.
        </p>

        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm sm:text-base font-bold text-[#6967fb] shadow-[0_4px_0_0_rgba(255,255,255,0.3)] transition hover:scale-[1.02] active:scale-[0.97] active:shadow-[0_2px_0_0_rgba(255,255,255,0.3)] active:translate-y-[2px]"
        >
          Commencer gratuitement
        </Link>
      </div>
    </section>
  );
}
