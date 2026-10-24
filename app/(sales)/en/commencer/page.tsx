import { redirect } from "next/navigation";

/** Old English entry point → /start (keeps any shared link working). */
export default function EnCommencerRedirect({ searchParams }: { searchParams?: { step?: string } }) {
  redirect(searchParams?.step === "paywall" ? "/start?step=paywall" : "/start");
}
