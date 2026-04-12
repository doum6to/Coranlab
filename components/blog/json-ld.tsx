import { absoluteUrl } from "@/lib/utils";

type ArticleJsonLdProps = {
  type: "article";
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
};

type WebsiteJsonLdProps = {
  type: "website";
};

type JsonLdProps = ArticleJsonLdProps | WebsiteJsonLdProps;

export function JsonLd(props: JsonLdProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://www.quranlab.app";

  let data: Record<string, unknown>;

  if (props.type === "article") {
    data = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: props.title,
      description: props.description,
      image: absoluteUrl("/hero.png"),
      datePublished: props.publishedAt,
      dateModified: props.updatedAt || props.publishedAt,
      author: {
        "@type": "Organization",
        name: "Quranlab",
        url: baseUrl,
      },
      publisher: {
        "@type": "Organization",
        name: "Quranlab",
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/quranlab-logo.svg"),
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": absoluteUrl(`/blog/${props.slug}`),
      },
      inLanguage: "fr",
    };
  } else {
    data = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Quranlab",
      description:
        "Application gratuite pour apprendre le vocabulaire du Coran. Maîtrise 85% des mots coraniques avec des leçons interactives.",
      url: baseUrl,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "fr",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
      },
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
