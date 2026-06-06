import { BookOpenText, Sparkles } from "lucide-react";

import type { LandingStory } from "@/lib/landing-content";
import { Sparkle, Star } from "./doodles";

function Paragraphs({ text }: { text: string }) {
  const parts = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className="mt-6 space-y-4 text-lg leading-relaxed text-neutral-700">
      {parts.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

function StoryCta({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="my-12 text-center">
      <a
        href="#offre"
        className="inline-flex items-center justify-center rounded-2xl border-b-4 border-[#4a48c4] bg-[#6967fb] px-7 py-4 font-display text-base font-bold uppercase tracking-wide text-white transition-all hover:brightness-[1.05] active:translate-y-1 active:border-b-0"
      >
        {label}
      </a>
      {sub ? <p className="mt-2 text-sm text-neutral-500">{sub}</p> : null}
    </div>
  );
}

export function StorySection({ data }: { data: LandingStory }) {
  const cta = <StoryCta label={data.ctaLabel} sub={data.ctaSub} />;

  return (
    <section className="bg-white">
      <div className="relative max-w-[720px] mx-auto px-6 sm:px-8 py-16 sm:py-24">
        <Sparkle className="absolute right-6 top-10 h-6 w-6 text-[#6967fb] hidden sm:block" />
        <Star className="absolute left-5 top-1/4 h-5 w-5 text-neutral-900/15 hidden sm:block" />

        {/* HOOK */}
        <h2 className="font-display font-bold text-3xl sm:text-[40px] leading-[1.1] text-neutral-950">
          {data.hookHeading}
        </h2>
        <Paragraphs text={data.hookBody} />

        {cta}

        {/* IGNORED PATTERN */}
        <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl leading-tight text-neutral-950">
          {data.patternHeading}
        </h2>
        <Paragraphs text={data.patternBody} />

        {/* WHY IT FAILS */}
        <h3 className="mt-14 font-display font-bold text-2xl sm:text-3xl text-neutral-950">
          {data.whyHeading}
        </h3>
        <div className="mt-6 space-y-4">
          {data.discoveries.map((d, i) => (
            <div
              key={i}
              className="flex gap-4 rounded-2xl border-2 border-neutral-900/10 bg-[#FAF8F3] p-5"
            >
              <span className="font-display text-2xl font-bold text-[#6967fb]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h4 className="font-display font-bold text-neutral-950">
                  {d.title}
                </h4>
                <p className="mt-1 text-[15px] leading-relaxed text-neutral-600">
                  {d.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {cta}

        {/* SOLUTION */}
        <div className="rounded-3xl bg-neutral-950 p-8 sm:p-10 text-white">
          <p className="text-[11px] tracking-[0.2em] uppercase text-white/50">
            {data.methodEyebrow}
          </p>
          <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl leading-tight">
            {data.methodHeading}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/80">
            {data.methodBody}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {data.steps.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl border-2 border-neutral-900/10 bg-white p-5"
            >
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#6967fb]">
                {s.label}
              </p>
              <h4 className="mt-1 font-display font-bold text-lg text-neutral-950">
                {s.title}
              </h4>
              <p className="mt-1 text-[15px] leading-relaxed text-neutral-600">
                {s.text}
              </p>
            </div>
          ))}
        </div>

        {/* DIFFERENT */}
        <h3 className="mt-14 font-display font-bold text-2xl sm:text-3xl text-neutral-950">
          {data.perksHeading}
        </h3>
        <ul className="mt-6 space-y-3">
          {data.perks.map((p, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#58cc6a] text-white">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              <span className="text-[15px] leading-relaxed text-neutral-700">
                {p}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-2xl bg-[#FAF8F3] border-2 border-neutral-900/10 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <BookOpenText className="h-5 w-5 text-[#6967fb]" strokeWidth={2} />
            <h3 className="font-display font-bold text-xl text-neutral-950">
              {data.whyWorksHeading}
            </h3>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-neutral-700">
            {data.whyWorksBody}
          </p>
        </div>

        {cta}

        {/* SCIENCE */}
        <h3 className="font-display font-bold text-2xl sm:text-3xl text-center text-neutral-950">
          {data.scienceHeading}
        </h3>
        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          {data.science.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl border-2 border-neutral-900/10 bg-white p-4 text-center"
            >
              <p className="font-display font-bold text-xl sm:text-2xl text-[#6967fb]">
                {s.k}
              </p>
              <p className="mt-1 text-xs text-neutral-500">{s.v}</p>
            </div>
          ))}
        </div>
        {data.scienceNote ? (
          <p className="mt-5 text-center text-[15px] text-neutral-600">
            {data.scienceNote}
          </p>
        ) : null}

        {/* PRICE FRAMING */}
        <div className="mt-12 text-center">
          <h3 className="font-display font-bold text-2xl sm:text-3xl text-neutral-950">
            {data.priceHeading}
          </h3>
          <p className="mt-4 text-lg leading-relaxed text-neutral-700">
            {data.priceBody}
          </p>
        </div>

        {cta}
      </div>
    </section>
  );
}
