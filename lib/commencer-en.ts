import type { CommencerContent } from "@/lib/commencer-shared";

/**
 * English content for /en/commencer. Static (not admin-editable for now):
 * the admin edits the French flow; this file mirrors its structure with
 * the same option ids so personalisation (level, reminder time, alphabet)
 * keeps working. No upsells in English: the add-on products are French.
 */
export const COMMENCER_EN: CommencerContent = {
  accentColor: "#6967FB",
  steps: [
    { type: "splash", arabic: "قُرْآن", brand: "QURANLAB", tagline: "UNDERSTAND THE QUR'AN" },
    { type: "welcome", headline: "Salam alaykum, I'm Koji!", tagline: "Understand the Qur'an.\n**Finally.**", cta: "Continue", signinText: "Already have an account?", signinCta: "Log in" },
    { type: "question", id: "why", headline: "Why do you want to understand the Qur'an?", sub: "Pick as many as you like", multi: true, options: [
      { id: "prayer", label: "Feel my prayer", icon: "hands" },
      { id: "recite", label: "Understand what I recite", icon: "book-open" },
      { id: "closer", label: "Get closer to Allah", icon: "moon-star" },
      { id: "read", label: "Read the Qur'an without translation", icon: "sparkles" },
      { id: "kids", label: "Pass it on to my children", icon: "baby" },
      { id: "other", label: "Other", icon: "more" },
    ] },
    { type: "question", id: "pain", headline: "What does not understanding change day to day?", sub: "Pick as many as you like", multi: true, options: [
      { id: "empty", label: "I recite without feeling anything", icon: "heart" },
      { id: "demot", label: "I lose motivation to read the Qur'an", icon: "book" },
      { id: "memo", label: "I struggle to memorise surahs", icon: "bookmark" },
      { id: "far", label: "I feel far from my faith", icon: "moon" },
      { id: "talk", label: "I don't dare join discussions", icon: "message" },
    ] },
    { type: "chart", headline: "Built to bring you closer to the Qur'an", chartLabel: "Your progress", brandLabel: "Quranlab", othersLabel: "Other methods", xStart: "Month 0", xEnd: "Month 1", checkTitle: "Quranlab will help you", checklist: [
      "Understand what you say in salat",
      "Recognise the 500 words = 85% of the Qur'an",
      "Remember thanks to smart reviews",
      "Progress a few minutes a day",
    ] },
    { type: "question", id: "gender", headline: "To calibrate your plan", sub: "This answer personalises your path.", multi: false, options: [ { id: "m", label: "Man" }, { id: "f", label: "Woman" } ] },
    { type: "question", id: "level", headline: "Your level in Qur'anic Arabic?", sub: "Quranlab adapts the lessons to your level.", multi: false, options: [
      { id: "l1", label: "Complete beginner", icon: "signal-0" }, { id: "l2", label: "I know a few words", icon: "signal-1" }, { id: "l3", label: "I recognise words in surahs", icon: "signal-2" },
      { id: "l4", label: "I understand simple verses", icon: "signal-3" }, { id: "l5", label: "I understand most verses", icon: "signal-4" },
    ] },
    { type: "question", id: "alphabet", headline: "Can you read Arabic?", multi: false, options: [ { id: "yes", label: "Yes, I read Arabic", icon: "thumbs-up" }, { id: "no", label: "Not yet (I read transliteration)", icon: "thumbs-down" } ] },
    { type: "question", id: "blockers", headline: "What held you back in the past?", sub: "Pick as many as you like", multi: true, options: [
      { id: "time", label: "Not enough time", icon: "clock" }, { id: "method", label: "No method / structure", icon: "layers" }, { id: "busy", label: "Too busy (work / school)", icon: "laptop" },
      { id: "consist", label: "Lack of consistency", icon: "repeat" }, { id: "hard", label: "Arabic felt too hard", icon: "puzzle" }, { id: "other", label: "Other", icon: "plus" },
    ] },
    { type: "question", id: "when", headline: "When do you want to practise?", sub: "We'll send your reminder at the right time.", multi: false, options: [
      { id: "morning", label: "In the morning", icon: "sunrise" }, { id: "prayer", label: "After a prayer", icon: "moon-star" }, { id: "evening", label: "In the evening", icon: "sunset" }, { id: "any", label: "Whenever I have a moment", icon: "coffee" },
    ] },
    { type: "time", headline: "How much time per day?", goalLabel: "Your goal", aloneLabel: "On your own", xStart: "Now", xEnd: "3 months", placeholder: "Pick a duration to see when you'll understand 85% of the Qur'an.", sentence: "At {min} min a day, you'll understand 85% of the Qur'an **in {weeks} weeks**.", options: [
      { minutes: 5, label: "5 min", weeks: 10 }, { minutes: 15, label: "15 min", weeks: 8 }, { minutes: 30, label: "30 min", weeks: 6 }, { minutes: 45, label: "45 min+", weeks: 5 },
    ] },
    { type: "social", headline: "They finally understand their prayer", rating: "4.9", ratingSub: "Over 1,500 learners", sub: "Quranlab was built for people like you", reviews: [
      { initials: "OM", name: "Omar", text: "I recited without understanding anything for 15 years. Within days I recognise words in my prayer. It changed everything." },
      { initials: "NA", name: "Nayah", text: "I finally KNOW what I'm saying when I pray. The simplest way I've found. Barak Allah fikum." },
      { initials: "YA", name: "Yassine", text: "A few minutes a day and Al-Fatiha took on a whole new meaning. 100% recommended." },
    ], lockSeconds: 2.5 },
    { type: "loader", headline: "Building your personalised plan", captions: ["Optimising for Qur'anic Arabic…", "Calibrating to your level…", "Preparing your first lessons…"], durationMs: 7000 },
    { type: "plan", headline: "Your personalised plan is ready", journeyTitle: "Qur'an Path", levelPill: "Level {level} · {levelLabel}", yourPlanLabel: "YOUR PLAN", minutesLabel: "per day", dateLabel: "your goal", rows: [
      { icon: "target", label: "Goal", text: "Understand every word of your prayer" },
      { icon: "wrench", label: "What we fix", text: "{min}-minute lessons that fit in your day" },
      { icon: "bell", label: "Your reminder", text: "{when}" },
      { icon: "layers", label: "Focus", text: "Vocabulary · Verses · Prayer" },
    ], cta: "Start my plan" },
    { type: "email", headline: "Get your personalised plan by email", sub: "We'll also send your reminder {when} to keep your routine.", placeholder: "you@email.com", cta: "Send me my plan", note: "No spam · unsubscribe in 1 click", skip: "Skip" },
    { type: "lesson", headline: "Your first lesson, right now", sub: "Three words you already recite. Find their meaning.", cards: [
      { arabic: "رَبِّ", translit: "Rabb", fr: "Lord", choices: ["Lord", "Light", "Path"] },
      { arabic: "ٱلرَّحِيمِ", translit: "ar-Rahîm", fr: "The Most Merciful", choices: ["The Almighty", "The Most Merciful", "The Creator"] },
      { arabic: "ٱلْحَمْدُ", translit: "al-hamd", fr: "Praise", choices: ["Prayer", "Praise", "Forgiveness"] },
    ], doneHeadline: "You just understood 3 words of the Qur'an", doneSub: "497 to go. Keep the momentum.", cta: "Continue" },
  ],
  paywall: {
    badge: "Launch offer · Lifetime access",
    title: "Unlock **all of Quranlab** for the price of a coffee",
    subtitle: "One payment. No subscription. Lifetime access.",
    perks: [
      { icon: "unlock", title: "The 500 words = 85% of the Qur'an", text: "Every lesson, every level, unlocked immediately." },
      { icon: "target", title: "Your personalised plan", text: "The path we just built together, ready to start." },
      { icon: "layers", title: "Unlimited exercises", text: "Quizzes, anagrams, spaced repetition: you memorise without effort." },
      { icon: "bell", title: "Your daily reminder", text: "A little nudge {when} to keep your routine." },
    ],
    amountCents: 999,
    priceLabel: "€9.99",
    compareLabel: "€49",
    priceNote: "one time · for life",
    urgency: "Launch price reserved for new learners. It will go up to €49 soon.",
    reassurance: "Secure payment · Instant access · 30-day guarantee",
    cta: "Unlock lifetime access — €9.99",
    finePrint: "One-time payment of €9.99. No renewal, no subscription. 30-day money-back guarantee.",
    guaranteeTitle: "30-day guarantee",
    guaranteeText: "If you don't recognise more words in your prayer within 30 days, one email and you're refunded.",
  },
  merci: {
    title: "Your lifetime access is active, barak Allah fik!",
    text: "An email was just sent to **create your account** and start your plan. Remember to check your spam folder.",
    cta: "Create my account",
    sourceHeadline: "One last thing: where did you hear about us?",
    sourceOptions: [
      { id: "instagram", label: "Instagram", icon: "instagram" }, { id: "tiktok", label: "TikTok", icon: "music" }, { id: "youtube", label: "YouTube", icon: "youtube" },
      { id: "snapchat", label: "Snapchat", icon: "ghost" }, { id: "friend", label: "A friend", icon: "users" }, { id: "mosque", label: "Mosque / community", icon: "landmark" }, { id: "other", label: "Other", icon: "more" },
    ],
  },
  // Add-on products are French-only: no upsell on the English flow.
  upsell: {
    enabled: false,
    badge: "", title: "", text: "", bullets: [], amountCents: 2700, priceLabel: "", compareLabel: "", cta: "", decline: "", note: "", doneTitle: "", doneText: "",
    bookBadge: "", bookTitle: "", bookCta: "", bookDecline: "", bookNote: "", bookDoneSuffix: "", bookDoneText: "",
  },
};
