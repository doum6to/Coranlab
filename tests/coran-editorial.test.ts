import assert from "node:assert/strict";
import test from "node:test";
import { mergeCoranConversion } from "../lib/coran-conversion";
import { optimizeCoranContent, migrateCoranEditorial } from "../lib/coran-editorial-migration";
import { CORAN_LANDING_DEFAULTS, mergeCoranLandingContent, type CoranLandingContent } from "../lib/coran-landing-shared";

const root = "https://pogfkwweomyypasnxieh.supabase.co/storage/v1/object/public/images/coran/";
function legacy(): CoranLandingContent {
  return {
    ...CORAN_LANDING_DEFAULTS,
    price: { currency: "EUR", amountCents: 1299, compareAtCents: 3700 },
    bgColor: "#000000", textColor: "#ffffff",
    body: [
      ...["3fa45822-1920-473b-9f58-6beeba9726c0", "6850e7a0-ee91-4575-b4ce-6cfc5553a38f", "32f00f4c-01bf-43c6-a799-2235e9cb0ea2"].map((id) => ({ type: "image" as const, url: `${root}${id}.webp` })),
      { type: "text", text: "Mon ajout personnalisé" },
    ],
    samples: [{ cover: "https://example.com/cover.png", pdf: "https://example.com/extract.pdf", title: "Mon extrait" }],
    orangeMoney: { ...CORAN_LANDING_DEFAULTS.orangeMoney, enabled: true, amountLabel: "8 000 FCFA" },
  };
}

test("legacy graphics become editable copy without changing commerce or other content", () => {
  const original = legacy();
  const migrated = mergeCoranLandingContent(migrateCoranEditorial(original));
  assert.deepEqual(migrated.price, original.price);
  for (const key of ["samples", "orangeMoney", "banners", "reviews", "gifs", "deliverables", "sectionOrder"] as const) assert.deepEqual(migrated[key], original[key]);
  assert.equal(migrated.body.at(-1)?.type, "text");
  assert.equal(migrated.body.filter((b) => b.type === "image").length, 0);
  assert.match(JSON.stringify(migrated.body), /30 Juzz/);
  assert.match(JSON.stringify(migrated.body), /Médine/);
  assert.match(JSON.stringify(migrated.body), /Hamza/);
  assert.equal(original.body[0].type, "image");
  assert.equal(migrated.bgColor, "#f8faf8");
});

test("saved admin edits survive subsequent reads, including blank labels and hidden prices", () => {
  const migrated = mergeCoranLandingContent(migrateCoranEditorial(legacy()));
  const edited = { ...migrated, showPrice: false, body: [{ type: "text" as const, heading: "Mon titre", text: "Mon texte" }], editorial: { ...migrated.editorial!, introduction: "", checkoutHeading: "Mon paiement" } };
  const loaded = mergeCoranLandingContent(migrateCoranEditorial(JSON.parse(JSON.stringify(edited))));
  assert.deepEqual(loaded, edited);
});

test("custom pages and partial legacy content are not overwritten", () => {
  const custom = { ...legacy(), body: [{ type: "text" as const, text: "Contenu personnalisé" }] };
  assert.equal(migrateCoranEditorial(custom), custom);
  const partial = { ...legacy(), body: legacy().body.slice(0, 1) };
  assert.equal(migrateCoranEditorial(partial), partial);
});

test("conversion copy respects saved admin choices and keeps actual prices", async () => {
  const source = { ...legacy(), title: "Titre choisi par l’admin", conversion: mergeCoranConversion({ faq: [], steps: [], paymentNote: "Mon libellé" }) };
  const result = mergeCoranLandingContent(optimizeCoranContent(source));
  assert.equal(result.title, source.title);
  assert.deepEqual(result.price, source.price);
  assert.deepEqual(result.conversion?.faq, []);
  assert.deepEqual(result.conversion?.steps, []);
  assert.equal(result.conversion?.paymentNote, "Mon libellé");
});
