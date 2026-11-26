/**
 * Tiny UI dictionary for /commencer strings that are not part of the admin
 * content. Plain module (no "use client") so server components can read it.
 */
export const CM_UI = {
  fr: {
    continue: "Continuer", beginner: "Débutant", everyDay: "chaque jour", redirect: "Redirection…", error: "Une erreur est survenue.", terms: "Conditions", privacy: "Confidentialité", thanks: "Merci ! 🙏", nothing: "Rien reçu d'ici quelques minutes ? Écris-nous à contact@quranlab.app.",
    back: "Retour", soundOn: "Activer le son", soundOff: "Couper le son", invalidEmail: "Adresse email invalide.",
    // Koji's reply once an answer is picked (by question id, then generic ones in rotation).
    react: {
      why: "Belle intention. On va y arriver ensemble.",
      pain: "Beaucoup ressentent la même chose. C'est exactement pour ça que Quranlab existe.",
      gender: "C'est noté !",
      level: "Parfait, je règle les leçons sur ton niveau.",
      alphabet_yes: "Super, on avancera encore plus vite.",
      alphabet_no: "Aucun souci : la phonétique est affichée sous chaque mot.",
      blockers: "Bonne nouvelle : quelques minutes par jour suffisent.",
      when: "Noté, c'est ton créneau.",
    } as Record<string, string>,
    reactGeneric: ["Bien noté !", "Parfait.", "Merci, je m'en souviens."],
    lesson: {
      askNext: "Et celui-ci ?", answers: "Réponses", listen: "Écouter",
      right: "Exact !", almost: "Presque !", answerWas: "Réponse :",
      inFatiha: "Al-Fatiha, verset {n}", totalXp: "Total XP", xp: "XP",
      streakTitle: "Ta série commence", streakCount: "jour de série",
      fact: "Ces mots sont dans Al-Fatiha. Tu les récites au moins **17 fois par jour** en priant, et maintenant tu les comprends.",
    },
    recap: "Tes {xp} XP, tes {words} mots et ta série sont prêts à être enregistrés.",
    pay: { how: "Comment ça marche", today: "Tu paies {price}. Tout Quranlab est débloqué.", month: "{zero}. Rien à payer, rien à résilier.", year: "{zero}. Ton accès est toujours là.", versus: "Une app classique à {price} par mois te coûterait {year} par an.", sheetTitle: "Paiement sécurisé", sheetSummary: "{product} · {price}, une seule fois", close: "Fermer", secured: "Paiement chiffré par Stripe", hosted: "Un souci ? Payer sur la page Stripe", hostedCta: "Payer sur la page Stripe", loadFailed: "Le formulaire de paiement n'a pas pu se charger.", retry: "Réessayer" },
    planReady: "Plan prêt",
    demo: { caption: "Ce que tu dis dans chaque prière", glosses: ["Guide-nous", "le chemin", "droit"] },
  },
  en: {
    continue: "Continue", beginner: "Beginner", everyDay: "every day", redirect: "Redirecting…", error: "Something went wrong.", terms: "Terms", privacy: "Privacy", thanks: "Thank you! 🙏", nothing: "Nothing after a few minutes? Write to us at contact@quranlab.app.",
    back: "Back", soundOn: "Turn sound on", soundOff: "Turn sound off", invalidEmail: "Invalid email address.",
    react: {
      why: "A beautiful intention. We'll get there together.",
      pain: "Many people feel the same. That is exactly why Quranlab exists.",
      gender: "Noted!",
      level: "Perfect, I'll set the lessons to your level.",
      alphabet_yes: "Great, we'll move even faster.",
      alphabet_no: "No problem: the phonetics are shown under every word.",
      blockers: "Good news: a few minutes a day is enough.",
      when: "Noted, that's your slot.",
    } as Record<string, string>,
    reactGeneric: ["Got it!", "Perfect.", "Thanks, I'll remember that."],
    lesson: {
      askNext: "And this one?", answers: "Answers", listen: "Listen",
      right: "Correct!", almost: "Almost!", answerWas: "Answer:",
      inFatiha: "Al-Fatiha, verse {n}", totalXp: "Total XP", xp: "XP",
      streakTitle: "Your streak begins", streakCount: "day streak",
      fact: "These words are in Al-Fatiha. You recite them at least **17 times a day** when you pray, and now you understand them.",
    },
    recap: "Your {xp} XP, your {words} words and your streak are ready to be saved.",
    pay: { how: "How it works", today: "You pay {price}. All of Quranlab is unlocked.", month: "{zero}. Nothing to pay, nothing to cancel.", year: "{zero}. Your access is still there.", versus: "A typical app at {price} a month would cost you {year} a year.", sheetTitle: "Secure payment", sheetSummary: "{product} · {price}, one time", close: "Close", secured: "Payment encrypted by Stripe", hosted: "Trouble? Pay on the Stripe page", hostedCta: "Pay on the Stripe page", loadFailed: "The payment form could not load.", retry: "Try again" },
    planReady: "Plan ready",
    demo: { caption: "What you say in every prayer", glosses: ["Guide us", "the path", "straight"] },
  },
  es: {
    continue: "Continuar", beginner: "Principiante", everyDay: "cada día", redirect: "Redirigiendo…", error: "Ha ocurrido un error.", terms: "Condiciones", privacy: "Privacidad", thanks: "¡Gracias! 🙏", nothing: "¿Nada en unos minutos? Escríbenos a contact@quranlab.app.",
    back: "Atrás", soundOn: "Activar el sonido", soundOff: "Silenciar", invalidEmail: "Correo electrónico no válido.",
    react: {
      why: "Hermosa intención. Lo lograremos juntos.",
      pain: "Mucha gente siente lo mismo. Para eso existe Quranlab.",
      gender: "¡Anotado!",
      level: "Perfecto, ajusto las lecciones a tu nivel.",
      alphabet_yes: "Genial, avanzaremos aún más rápido.",
      alphabet_no: "Sin problema: la fonética aparece bajo cada palabra.",
      blockers: "Buena noticia: bastan unos minutos al día.",
      when: "Anotado, ese es tu momento.",
    } as Record<string, string>,
    reactGeneric: ["¡Anotado!", "Perfecto.", "Gracias, lo recordaré."],
    lesson: {
      askNext: "¿Y esta?", answers: "Respuestas", listen: "Escuchar",
      right: "¡Correcto!", almost: "¡Casi!", answerWas: "Respuesta:",
      inFatiha: "Al-Fatiha, versículo {n}", totalXp: "XP total", xp: "XP",
      streakTitle: "Tu racha empieza", streakCount: "día de racha",
      fact: "Estas palabras están en Al-Fatiha. Las recitas al menos **17 veces al día** al rezar, y ahora las entiendes.",
    },
    recap: "Tus {xp} XP, tus {words} palabras y tu racha están listos para guardarse.",
    pay: { how: "Cómo funciona", today: "Pagas {price}. Todo Quranlab queda desbloqueado.", month: "{zero}. Nada que pagar, nada que cancelar.", year: "{zero}. Tu acceso sigue ahí.", versus: "Una app típica a {price} al mes te costaría {year} al año.", sheetTitle: "Pago seguro", sheetSummary: "{product} · {price}, una sola vez", close: "Cerrar", secured: "Pago cifrado por Stripe", hosted: "¿Algún problema? Pagar en la página de Stripe", hostedCta: "Pagar en la página de Stripe", loadFailed: "No se pudo cargar el formulario de pago.", retry: "Reintentar" },
    planReady: "Plan listo",
    demo: { caption: "Lo que dices en cada oración", glosses: ["Guíanos", "el camino", "recto"] },
  },
} as const;
export type CmLocale = keyof typeof CM_UI;
export type CmUi = (typeof CM_UI)[CmLocale];
