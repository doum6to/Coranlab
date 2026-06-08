import type { LandingContent } from "@/lib/landing-content";
import type { Locale } from "./locales";

/**
 * Translated landing content for the product (V3) landing. Only the sections
 * the product layout renders are translated (product, offer, reviews headings,
 * faq); anything omitted falls back to the French defaults via deep-merge, and
 * an admin can still override per locale from the dashboard.
 */
export const LANDING_I18N: Partial<Record<Locale, Partial<LandingContent>>> = {
  en: {
    product: {
      gallery: [],
      showThumbnails: true,
      rating: "4.9/5 · 1,000+ learners",
      title: "Understand 85% of the Qur'an",
      subtitle:
        "The reference ebook + 3 free bonuses (including lifetime access to the app). Instant download, one-time payment.",
      bullets: [
        "The ~300 words that make up 85% of the Qur'an",
        "Translation + roots, sorted by frequency",
        "Lifetime access to the app as a bonus",
        "Instant download",
      ],
      guarantee: "One-time payment · Instant access · Secured by Stripe",
      benefitsHeading: "Why it works",
      benefits: [
        {
          title: "The essentials first",
          text: "You learn the most frequent words — maximum understanding for minimum effort.",
        },
        {
          title: "No overwhelming grammar",
          text: "Words in their Qur'anic context, naturally, the way you learn a language.",
        },
        {
          title: "5 minutes a day",
          text: "A sustainable pace, designed for busy professionals, students and parents.",
        },
      ],
      insideHeading: "What you get",
      insideItems: [
        {
          image: "",
          title: "📖 The ebook — 85% of the words of the Qur'an",
          text: "The most frequent words, sorted, with translation and roots.",
        },
        {
          image: "",
          title: "🎁 Lifetime access to the app",
          text: "Learn and review with spaced repetition, for life. Limited spots.",
        },
        {
          image: "",
          title: "🎁 Qur'anic Du'as",
          text: "240+ pages, translation + Tafsir Ibn Kathir.",
        },
        {
          image: "",
          title: "🎁 Summary of the 30 Juzz",
          text: "To meditate on and live the words of Allah every day.",
        },
      ],
      howHeading: "How it works after your payment",
      steps: [
        {
          title: "1. Payment confirmed",
          text: "As soon as your payment goes through, your lifetime Premium access is reserved. You land on a welcome page.",
        },
        {
          title: "2. Create your account",
          text: "Create your account with the same email you used to buy — that's what automatically activates your lifetime access.",
        },
        {
          title: "3. Start learning",
          text: "You get immediate access to the app and start the Qur'anic vocabulary, level by level.",
        },
      ],
      compareHeading: "Why not a traditional course?",
      compareUs: "This ebook",
      compareThem: "Traditional Arabic course",
      compareRows: [
        "Focused on Qur'anic vocabulary",
        "Results in a few weeks",
        "No endless grammar",
        "Lifetime access to the app included",
        "A fraction of the price",
      ],
      founderHeading: "Why I created this",
      founderText:
        "Like many, I recited without understanding. I didn't want to become a linguist — just to understand the Book I read every day. This is the method I wish I'd had.",
      founderImage: "",
    },
    offer: {
      eyebrow: "The complete offer",
      cycleNote: "One-time payment · Instant download",
      features: [
        "📖 The ebook: 85% of the words of the Qur'an",
        "🎁 Lifetime access to the app (limited spots)",
        "🎁 Qur'anic Du'as — 240+ pages, Tafsir Ibn Kathir",
        "🎁 Summary of the 30 Juzz of the Qur'an",
        "Instant access and download",
      ],
      buttonLabel: "Get everything now",
      buttonSub: "Secure payment · 14-day guarantee",
      secure: "Secure payment via Stripe",
      stickyLabel: "Get it",
    },
    reviews: {
      eyebrow: "Verified reviews",
      heading: "They started before you",
      screenshots: [],
      items: [],
    },
    faq: {
      eyebrow: "FAQ",
      heading: "Frequently asked questions",
      items: [
        {
          q: 'What exactly does "lifetime" mean?',
          a: "You pay once and keep Premium access to the app forever. No subscription, no recurring charges, ever.",
        },
        {
          q: "How do I access the app after paying?",
          a: "Right after payment, you create your account with the email you used to buy. Your lifetime access is activated automatically. You also receive a confirmation email.",
        },
        {
          q: "Are future lessons and updates included?",
          a: "Yes. All new lessons, features and improvements to the app are included, at no extra cost.",
        },
        {
          q: "Is the payment secure?",
          a: "Yes. Payment is handled by Stripe, the global standard for online payments. We never see your card number.",
        },
        {
          q: "Which devices can I use it on?",
          a: "All your devices: phone, tablet and computer. Just log in with your account and your progress follows you everywhere.",
        },
        {
          q: "What if I already have a monthly subscription?",
          a: "No problem: write to us after your purchase and we'll switch your account to lifetime access and cancel your subscription.",
        },
      ],
    },
  },
  es: {
    product: {
      gallery: [],
      showThumbnails: true,
      rating: "4,9/5 · más de 1000 estudiantes",
      title: "Comprende el 85% del Corán",
      subtitle:
        "El ebook de referencia + 3 bonos gratis (incluido el acceso de por vida a la aplicación). Descarga inmediata, pago único.",
      bullets: [
        "Las ~300 palabras que forman el 85% del Corán",
        "Traducción + raíces, ordenadas por frecuencia",
        "Acceso de por vida a la aplicación como bono",
        "Descarga inmediata",
      ],
      guarantee: "Pago único · Acceso inmediato · Protegido por Stripe",
      benefitsHeading: "Por qué funciona",
      benefits: [
        {
          title: "Lo esencial primero",
          text: "Aprendes las palabras más frecuentes: máxima comprensión con el mínimo esfuerzo.",
        },
        {
          title: "Sin gramática abrumadora",
          text: "Las palabras en su contexto coránico, de forma natural, como se aprende un idioma.",
        },
        {
          title: "5 minutos al día",
          text: "Un ritmo sostenible, pensado para profesionales, estudiantes y padres ocupados.",
        },
      ],
      insideHeading: "Lo que recibes",
      insideItems: [
        {
          image: "",
          title: "📖 El ebook — el 85% de las palabras del Corán",
          text: "Las palabras más frecuentes, ordenadas, con traducción y raíces.",
        },
        {
          image: "",
          title: "🎁 Acceso de por vida a la aplicación",
          text: "Aprende y repasa con repetición espaciada, de por vida. Plazas limitadas.",
        },
        {
          image: "",
          title: "🎁 Du'as coránicas",
          text: "Más de 240 páginas, traducción + Tafsir Ibn Kathir.",
        },
        {
          image: "",
          title: "🎁 Resumen de los 30 Yuz",
          text: "Para meditar y vivir la palabra de Allah cada día.",
        },
      ],
      howHeading: "Cómo funciona después de tu pago",
      steps: [
        {
          title: "1. Pago confirmado",
          text: "En cuanto se valida tu pago, tu acceso Premium de por vida queda reservado. Llegas a una página de bienvenida.",
        },
        {
          title: "2. Crea tu cuenta",
          text: "Crea tu cuenta con el mismo correo que usaste en la compra: eso es lo que activa automáticamente tu acceso de por vida.",
        },
        {
          title: "3. Empieza a aprender",
          text: "Accedes de inmediato a la aplicación y empiezas el vocabulario del Corán, nivel a nivel.",
        },
      ],
      compareHeading: "¿Por qué no un curso tradicional?",
      compareUs: "Este ebook",
      compareThem: "Curso de árabe tradicional",
      compareRows: [
        "Centrado en el vocabulario del Corán",
        "Resultados en pocas semanas",
        "Sin gramática interminable",
        "Acceso de por vida a la aplicación incluido",
        "Una fracción del precio",
      ],
      founderHeading: "Por qué creé esto",
      founderText:
        "Como muchos, recitaba sin comprender. No quería convertirme en lingüista, solo entender el Libro que leo cada día. Este es el método que me habría gustado tener.",
      founderImage: "",
    },
    offer: {
      eyebrow: "La oferta completa",
      cycleNote: "Pago único · Descarga inmediata",
      features: [
        "📖 El ebook: el 85% de las palabras del Corán",
        "🎁 Acceso de por vida a la aplicación (plazas limitadas)",
        "🎁 Du'as coránicas — más de 240 páginas, Tafsir Ibn Kathir",
        "🎁 Resumen de los 30 Yuz del Corán",
        "Acceso y descarga inmediatos",
      ],
      buttonLabel: "Conseguir todo ahora",
      buttonSub: "Pago seguro · Garantía de 14 días",
      secure: "Pago seguro con Stripe",
      stickyLabel: "Lo quiero",
    },
    reviews: {
      eyebrow: "Opiniones verificadas",
      heading: "Empezaron antes que tú",
      screenshots: [],
      items: [],
    },
    faq: {
      eyebrow: "Preguntas frecuentes",
      heading: "Preguntas frecuentes",
      items: [
        {
          q: "¿Qué significa exactamente «de por vida»?",
          a: "Pagas una sola vez y conservas el acceso Premium a la aplicación para siempre. Sin suscripción, sin cargos recurrentes, nunca.",
        },
        {
          q: "¿Cómo accedo a la aplicación después de pagar?",
          a: "Justo después del pago, creas tu cuenta con el correo que usaste en la compra. Tu acceso de por vida se activa automáticamente. También recibes un correo de confirmación.",
        },
        {
          q: "¿Se incluyen las futuras lecciones y actualizaciones?",
          a: "Sí. Todas las nuevas lecciones, funciones y mejoras de la aplicación están incluidas, sin coste adicional.",
        },
        {
          q: "¿El pago es seguro?",
          a: "Sí. El pago lo procesa Stripe, el estándar mundial de pagos en línea. Nunca vemos el número de tu tarjeta.",
        },
        {
          q: "¿En qué dispositivos puedo usarla?",
          a: "En todos tus dispositivos: teléfono, tableta y ordenador. Solo inicias sesión con tu cuenta y tu progreso te acompaña en todas partes.",
        },
        {
          q: "¿Y si ya tengo una suscripción mensual?",
          a: "Sin problema: escríbenos después de tu compra y cambiaremos tu cuenta a acceso de por vida y cancelaremos tu suscripción.",
        },
      ],
    },
  },
};
