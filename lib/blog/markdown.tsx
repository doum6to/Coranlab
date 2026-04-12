import Link from "next/link";
import React from "react";

/* ------------------------------------------------------------------ */
/*  Reusable visual blocks (same as before, now shared with markdown)  */
/* ------------------------------------------------------------------ */

export function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-6 rounded-xl border-l-4 border-[#6967fb] bg-[#6967fb]/5 px-5 py-4 text-[15px] leading-relaxed text-brilliant-text/80">
      {children}
    </div>
  );
}

export function ArabicWord({
  word,
  translation,
  info,
}: {
  word: string;
  translation: string;
  info?: string;
}) {
  return (
    <div className="not-prose my-4 inline-flex flex-col items-center rounded-xl border border-brilliant-border bg-brilliant-surface px-5 py-3 text-center">
      <span className="font-arabic text-2xl leading-relaxed">{word}</span>
      <span className="mt-1 text-sm font-semibold text-brilliant-text">
        {translation}
      </span>
      {info && (
        <span className="mt-0.5 text-xs text-brilliant-muted">{info}</span>
      )}
    </div>
  );
}

export function ArabicWordRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-6 flex flex-wrap gap-3 justify-center">
      {children}
    </div>
  );
}

export function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="not-prose my-6 rounded-xl border-2 border-brilliant-border bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6967fb] text-sm font-bold text-white">
          {number}
        </span>
        <div>
          <h3 className="font-heading text-lg font-bold text-brilliant-text mb-2">
            {title}
          </h3>
          <div className="text-[15px] leading-relaxed text-brilliant-text/80">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function InlineCTA({
  text,
  label,
  href = "/onboarding",
}: {
  text: string;
  label?: string;
  href?: string;
}) {
  return (
    <div className="not-prose my-8 rounded-2xl border-2 border-[#6967fb]/20 bg-gradient-to-r from-[#6967fb]/5 to-[#6967fb]/10 p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
      <p className="flex-1 text-[15px] font-medium text-brilliant-text/80">
        {text}
      </p>
      <Link
        href={href}
        className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#6967fb] px-5 py-2.5 text-sm font-bold text-white shadow-[0_3px_0_0_#5250d4] transition hover:scale-[1.02] active:scale-[0.97] active:shadow-[0_1px_0_0_#5250d4] active:translate-y-[2px]"
      >
        {label || "Essayer Quranlab →"}
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Markdown → JSX renderer                                            */
/* ------------------------------------------------------------------ */

/**
 * Converts our custom markdown format to React elements.
 *
 * Supported custom syntax:
 * - :::tip ... :::           → Tip callout
 * - :::step N|Title ... :::  → Step card
 * - :::cta ... :::           → Inline CTA
 * - :::cta label|text ... ::: → Inline CTA with custom label
 * - {{ar|text}}              → Arabic text span
 * - {{arword|word|translation|info}} → ArabicWord card
 * - {{arwords}} ... {{/arwords}}     → ArabicWordRow wrapper
 * - Standard markdown: **bold**, *italic*, [link](url), ## headings, - lists
 */
export function renderMarkdown(raw: string): () => JSX.Element {
  return function MarkdownContent() {
    const elements: React.ReactNode[] = [];
    const lines = raw.split("\n");
    let i = 0;
    let key = 0;

    function nextKey() {
      return `md-${key++}`;
    }

    while (i < lines.length) {
      const line = lines[i];

      // ─── Custom block directives ───
      if (line.startsWith(":::tip")) {
        const blockLines: string[] = [];
        i++;
        while (i < lines.length && lines[i] !== ":::") {
          blockLines.push(lines[i]);
          i++;
        }
        i++; // skip closing :::
        elements.push(
          <Tip key={nextKey()}>
            {renderInlineContent(blockLines.join("\n").trim())}
          </Tip>,
        );
        continue;
      }

      if (line.startsWith(":::step")) {
        const match = line.match(/:::step\s+(\d+)\|(.+)/);
        const stepNum = match ? parseInt(match[1]) : 1;
        const stepTitle = match ? match[2].trim() : "";
        const blockLines: string[] = [];
        i++;
        while (i < lines.length && lines[i] !== ":::") {
          blockLines.push(lines[i]);
          i++;
        }
        i++;
        elements.push(
          <Step key={nextKey()} number={stepNum} title={stepTitle}>
            {renderParagraphs(blockLines.join("\n").trim())}
          </Step>,
        );
        continue;
      }

      if (line.startsWith(":::cta")) {
        const match = line.match(/:::cta\s+(.*)\|(.*)/) || line.match(/:::cta\s*(.*)/);
        let label: string | undefined;
        let text = "";
        const blockLines: string[] = [];
        i++;
        while (i < lines.length && lines[i] !== ":::") {
          blockLines.push(lines[i]);
          i++;
        }
        i++;
        text = blockLines.join(" ").trim();
        if (match && match[2]) {
          label = match[1].trim();
        }
        elements.push(
          <InlineCTA key={nextKey()} text={text} label={label || undefined} />,
        );
        continue;
      }

      // ─── Arabic word rows ───
      if (line.startsWith("{{arwords}}")) {
        const wordElements: React.ReactNode[] = [];
        i++;
        while (i < lines.length && !lines[i].startsWith("{{/arwords}}")) {
          const wMatch = lines[i].match(
            /\{\{arword\|([^|]+)\|([^|]+)(?:\|([^}]+))?\}\}/,
          );
          if (wMatch) {
            wordElements.push(
              <ArabicWord
                key={nextKey()}
                word={wMatch[1]}
                translation={wMatch[2]}
                info={wMatch[3]}
              />,
            );
          }
          i++;
        }
        i++; // skip closing
        elements.push(
          <ArabicWordRow key={nextKey()}>{wordElements}</ArabicWordRow>,
        );
        continue;
      }

      // ─── Headings ───
      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={nextKey()}>{renderInlineText(line.slice(3))}</h2>,
        );
        i++;
        continue;
      }
      if (line.startsWith("### ")) {
        elements.push(
          <h3 key={nextKey()}>{renderInlineText(line.slice(4))}</h3>,
        );
        i++;
        continue;
      }

      // ─── Unordered list ───
      if (line.startsWith("- ")) {
        const listItems: React.ReactNode[] = [];
        while (i < lines.length && lines[i].startsWith("- ")) {
          listItems.push(
            <li key={nextKey()}>{renderInlineText(lines[i].slice(2))}</li>,
          );
          i++;
        }
        elements.push(<ul key={nextKey()}>{listItems}</ul>);
        continue;
      }

      // ─── Empty line ───
      if (line.trim() === "") {
        i++;
        continue;
      }

      // ─── Paragraph ───
      const paraLines: string[] = [line];
      i++;
      while (
        i < lines.length &&
        lines[i].trim() !== "" &&
        !lines[i].startsWith("##") &&
        !lines[i].startsWith(":::") &&
        !lines[i].startsWith("- ") &&
        !lines[i].startsWith("{{ar")
      ) {
        paraLines.push(lines[i]);
        i++;
      }
      elements.push(
        <p key={nextKey()}>{renderInlineText(paraLines.join(" "))}</p>,
      );
    }

    return <>{elements}</>;
  };
}

/* ─── Inline text rendering ─── */

function renderInlineContent(text: string): React.ReactNode {
  // Render as simple inline content (for tips etc.)
  return renderInlineText(text);
}

function renderParagraphs(text: string): React.ReactNode {
  const paragraphs = text.split("\n\n").filter((p) => p.trim());
  if (paragraphs.length === 1) {
    return <p>{renderInlineText(paragraphs[0])}</p>;
  }
  return paragraphs.map((p, idx) => (
    <p key={idx} className={idx > 0 ? "mt-2" : ""}>
      {renderInlineText(p)}
    </p>
  ));
}

function renderInlineText(text: string): React.ReactNode {
  // Process inline patterns: **bold**, *italic*, [link](url), {{ar|text}}
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let idx = 0;

  while (remaining.length > 0) {
    // Arabic text: {{ar|text}}
    const arMatch = remaining.match(/\{\{ar\|([^}]+)\}\}/);
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    // Italic: *text*
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);
    // Link: [text](url)
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

    // Find earliest match
    const matches = [
      arMatch ? { type: "ar", match: arMatch } : null,
      boldMatch ? { type: "bold", match: boldMatch } : null,
      italicMatch ? { type: "italic", match: italicMatch } : null,
      linkMatch ? { type: "link", match: linkMatch } : null,
    ]
      .filter(Boolean)
      .sort((a, b) => a!.match.index! - b!.match.index!);

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const first = matches[0]!;
    const matchIndex = first.match.index!;

    // Add text before match
    if (matchIndex > 0) {
      parts.push(remaining.slice(0, matchIndex));
    }

    switch (first.type) {
      case "ar":
        parts.push(
          <span key={idx++} className="font-arabic text-lg">
            {first.match[1]}
          </span>,
        );
        remaining = remaining.slice(matchIndex + first.match[0].length);
        break;
      case "bold":
        parts.push(<strong key={idx++}>{first.match[1]}</strong>);
        remaining = remaining.slice(matchIndex + first.match[0].length);
        break;
      case "italic":
        parts.push(<em key={idx++}>{first.match[1]}</em>);
        remaining = remaining.slice(matchIndex + first.match[0].length);
        break;
      case "link":
        parts.push(
          <Link key={idx++} href={first.match[2]}>
            {first.match[1]}
          </Link>,
        );
        remaining = remaining.slice(matchIndex + first.match[0].length);
        break;
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
