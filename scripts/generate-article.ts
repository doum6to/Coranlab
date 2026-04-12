/**
 * Auto-generate a blog article using Claude API.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/generate-article.ts
 *
 * What it does:
 *   1. Reads existing articles to avoid duplicate topics
 *   2. Calls Claude to generate a new article in our custom markdown format
 *   3. Writes the .md file to content/blog/
 *   4. Git commits & pushes (Vercel auto-deploys)
 *
 * The script is designed to be run via GitHub Actions on a daily cron.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error("Error: ANTHROPIC_API_KEY env var is required");
  process.exit(1);
}

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");
const JSX_ARTICLES_PATH = path.join(process.cwd(), "lib", "blog", "articles.tsx");

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getExistingSlugs(): string[] {
  const slugs: string[] = [];

  // From markdown files
  if (fs.existsSync(CONTENT_DIR)) {
    fs.readdirSync(CONTENT_DIR)
      .filter((f) => f.endsWith(".md"))
      .forEach((f) => slugs.push(f.replace(/\.md$/, "")));
  }

  // From JSX articles (parse slugs from the registry)
  const jsxContent = fs.readFileSync(JSX_ARTICLES_PATH, "utf-8");
  let slugMatch;
  const slugRe = /slug:\s*"([^"]+)"/g;
  while ((slugMatch = slugRe.exec(jsxContent)) !== null) {
    slugs.push(slugMatch[1]);
  }

  return slugs;
}

function getExistingTitles(): string[] {
  const titles: string[] = [];

  if (fs.existsSync(CONTENT_DIR)) {
    for (const file of fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"))) {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
      const match = raw.match(/title:\s*"([^"]+)"/);
      if (match) titles.push(match[1]);
    }
  }

  // JSX article titles
  const jsxContent = fs.readFileSync(JSX_ARTICLES_PATH, "utf-8");
  let titleMatch;
  const titleRe = /title:\s*"([^"]+)"/g;
  while ((titleMatch = titleRe.exec(jsxContent)) !== null) {
    titles.push(titleMatch[1]);
  }

  return titles;
}

async function callClaude(prompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function main() {
  console.log("🔍 Reading existing articles...");
  const existingSlugs = getExistingSlugs();
  const existingTitles = getExistingTitles();

  console.log(`  Found ${existingSlugs.length} existing articles`);
  console.log(`  Slugs: ${existingSlugs.join(", ")}`);

  // Ensure content dir exists
  fs.mkdirSync(CONTENT_DIR, { recursive: true });

  console.log("\n🤖 Generating new article with Claude...");

  const today = new Date().toISOString().slice(0, 10);

  const prompt = `Tu es un rédacteur expert en SEO et en contenu islamique éducatif. Tu écris pour Quranlab, une application gratuite qui aide les francophones à apprendre le vocabulaire du Coran.

ARTICLES DÉJÀ PUBLIÉS (NE PAS DUPLIQUER) :
${existingTitles.map((t) => `- ${t}`).join("\n")}

MISSION : Génère UN nouvel article de blog optimisé SEO.

THÉMATIQUES POSSIBLES (choisis-en une qui n'a PAS encore été couverte) :
- Les bienfaits spirituels de comprendre le Coran en arabe
- Comment intégrer l'apprentissage du Coran dans une routine quotidienne chargée
- Les erreurs les plus courantes quand on apprend l'arabe coranique
- L'histoire et l'évolution de l'écriture arabe du Coran
- Comment utiliser la répétition espacée pour le Coran
- Les différentes méthodes de lecture du Coran (Hafs, Warsh...)
- Comprendre les racines arabes pour décoder le Coran
- L'importance du contexte (asbab an-nuzul) pour comprendre le Coran
- Guide pour les parents : initier ses enfants au Coran
- Les outils numériques pour apprendre le Coran
- Comment rester motivé dans l'apprentissage du Coran
- La relation entre le Coran et la langue arabe moderne
- Les sciences du Coran (Ulum al-Quran) pour débutants
- Comment créer un cercle d'étude coranique efficace
- L'art de la récitation (Qira'at) et ses différentes écoles
- Ramadan et Coran : un programme d'apprentissage spécial
- Les formules coraniques récurrentes et leurs significations
- Apprendre le Coran en famille : méthodes et conseils

TON ET STYLE :
- Ton humain, naturel, comme un grand frère qui conseille
- Tutoiement systématique
- Phrases courtes et directes
- Questions rhétoriques pour engager le lecteur
- Exemples concrets et relatable (prière, quotidien)
- Pas de ton académique ou distant
- Inclure des mots arabes avec le composant {{ar|texte arabe}}
- Google ne doit PAS pouvoir détecter que c'est écrit par une IA

SEO :
- Le titre doit contenir des mots-clés recherchés sur Google FR
- La description doit donner envie de cliquer (max 160 caractères)
- Choisir 3-4 keywords à forte intention de recherche
- Utiliser les keywords naturellement dans les H2
- Liens internes vers les articles existants quand c'est pertinent

FORMAT MARKDOWN CUSTOM :
\`\`\`
---
title: "Titre de l'article"
description: "Meta description SEO (max 160 car)"
keywords: ["mot-clé 1", "mot-clé 2", "mot-clé 3"]
publishedAt: "${today}"
readingTime: 8
---

Paragraphe d'intro accrocheur...

## Titre H2 avec mot-clé

Paragraphe...

:::tip
💡 **Conseil** : texte du conseil...
:::

:::step 1|Titre de l'étape
Contenu de l'étape...
:::

:::cta
Texte d'accroche pour le CTA inline vers Quranlab.
:::

:::cta Découvrir Quranlab →|
Texte d'accroche personnalisé avec un label de bouton custom.
:::

{{arwords}}
{{arword|كلمة|traduction|info optionnelle}}
{{arword|كلمة|traduction}}
{{/arwords}}

Pour le texte arabe inline : {{ar|الحمد لله}}

Liens internes : [texte du lien](/blog/slug-existant)
\`\`\`

LIENS INTERNES DISPONIBLES :
${existingSlugs.map((s) => `- /blog/${s}`).join("\n")}

CONSIGNES STRICTES :
1. L'article doit faire entre 800 et 1500 mots
2. Minimum 4 sections H2
3. Au moins 1 :::tip, 1 :::cta, et du texte arabe
4. Inclure au moins 2 liens internes vers des articles existants
5. Ne commence PAS par "Bien sûr" ou "Voici" — commence directement par le markdown du frontmatter
6. Le slug sera dérivé du nom de fichier, pas besoin de le mettre dans le frontmatter
7. Retourne UNIQUEMENT le contenu markdown, rien d'autre (pas de \`\`\`markdown, pas d'explication)`;

  const articleContent = await callClaude(prompt);

  // Extract the slug from the title
  const titleMatch = articleContent.match(/title:\s*"([^"]+)"/);
  if (!titleMatch) {
    console.error("Error: Could not extract title from generated content");
    console.log(articleContent.slice(0, 500));
    process.exit(1);
  }

  const title = titleMatch[1];
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/-+/g, "-") // collapse hyphens
    .replace(/^-|-$/g, "") // trim hyphens
    .slice(0, 60);

  // Check for slug collision
  if (existingSlugs.includes(slug)) {
    console.error(`Error: Slug "${slug}" already exists. Try again.`);
    process.exit(1);
  }

  // Clean the content (remove any ```markdown wrappers if present)
  let cleanContent = articleContent.trim();
  if (cleanContent.startsWith("```")) {
    cleanContent = cleanContent.replace(/^```\w*\n/, "").replace(/\n```$/, "");
  }

  // Write the file
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  fs.writeFileSync(filePath, cleanContent, "utf-8");
  console.log(`\n✅ Article written to: ${filePath}`);
  console.log(`   Title: ${title}`);
  console.log(`   Slug: ${slug}`);

  // Git commit & push
  if (process.env.AUTO_COMMIT !== "false") {
    console.log("\n📦 Committing and pushing...");
    try {
      execSync(`git add "${filePath}"`, { stdio: "inherit" });
      execSync(
        `git commit -m "blog: add auto-generated article — ${title}"`,
        { stdio: "inherit" },
      );
      execSync("git push", { stdio: "inherit" });
      console.log("\n🚀 Pushed! Vercel will auto-deploy.");
    } catch (e) {
      console.error("Git operations failed:", e);
      console.log("Article was saved locally. Commit manually.");
    }
  } else {
    console.log("\n⏭️  AUTO_COMMIT=false — skipping git operations.");
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
