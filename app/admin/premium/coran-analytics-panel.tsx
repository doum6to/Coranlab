import "server-only";
import { sql } from "drizzle-orm";
import db from "@/db/drizzle";
export async function CoranAnalyticsPanel() {
 let totals: Record<string, number> = {};
 try {
  const result = await db.execute(sql`
   WITH period AS (
     SELECT MIN(created_at) AS starts
     FROM analytics_event
     WHERE path = '/coran' AND event = 'coran_view'
       AND meta = 'coran_conversion_v2'
       AND created_at > now() - interval '30 days'
   )
   SELECT event, COUNT(DISTINCT session_id)::int AS total
   FROM analytics_event
   WHERE path = '/coran' AND created_at >= (SELECT starts FROM period)
     AND (meta = 'coran_conversion_v2' OR event = 'purchase')
   GROUP BY event
  `);
  for (const row of result.rows as {event: string; total: number}[]) totals[row.event] = Number(row.total) || 0;
 } catch {
  return <p className="mb-6 rounded-xl border p-4 text-sm">Le suivi de /coran est momentanément indisponible.</p>;
 }
 return <section className="mb-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
   <h3 className="text-lg font-bold">Page /coran — parcours d’achat</h3>
   <p className="mb-4 text-sm text-neutral-600">Depuis la première visite mesurée de cette version, dans la limite des 30 derniers jours. Visiteurs par navigateur ; commandes Stripe confirmées.</p>
   <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
    {([
      ["coran_view","Visiteurs"], ["coran_gallery_open","Extraits ouverts"], ["coran_cta_click","Clics vers l’achat"],
      ["coran_checkout_view","Offre de paiement vue"], ["coran_checkout_start","Paiement chargé"], ["purchase","Commandes Stripe"],
    ] as const).map(([event,label])=><div key={event} className="rounded-xl border bg-white p-4"><p className="text-sm text-neutral-600">{label}</p><p className="mt-1 text-2xl font-bold">{totals[event] || 0}</p></div>)}
   </div>
   {!totals.coran_view && <p className="mt-4 text-sm text-neutral-600">Les résultats apparaîtront après les premières visites mesurées.</p>}
   <p className="mt-4 text-sm text-neutral-500">Les visites peuvent être sous-comptées si le suivi est bloqué. Les commandes Orange Money ne sont pas incluses dans ce tableau.</p>
 </section>;
}
