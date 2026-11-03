/**
 * Runs once when a server instance starts (Next.js instrumentation hook).
 * Closes the Supabase Data API on public tables (RLS + revoked API grants) so
 * the security fix applies on every deploy without a manual step.
 * The runtime check must wrap the import directly so the edge bundle drops it.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node");
  }
}
