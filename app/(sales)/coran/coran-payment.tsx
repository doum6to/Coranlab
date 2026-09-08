"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { CoranOrangeMoney } from "@/lib/coran-landing-shared";
const Payment = dynamic(() => import("./payment-methods").then(module => module.PaymentMethods), {
 ssr:false, loading:()=> <p role="status">Chargement du paiement sécurisé…</p>,
});
export function CoranPayment(props: {
 omEnabled: boolean; om: CoranOrangeMoney;
 createCheckout?: () => Promise<{ clientSecret: string | null } | { error: string }>;
}) {
 const [ready,setReady] = useState(false);
 const root = useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if (!root.current) return;
  if (!("IntersectionObserver" in window)) { setReady(true); return; }
  const observer = new IntersectionObserver(entries=>{
   if (entries.some(entry=>entry.isIntersecting)) { setReady(true); observer.disconnect(); }
  });
  observer.observe(root.current);
  return ()=>observer.disconnect();
 },[]);
 return <div ref={root} className="min-h-48">
   {ready ? <Payment {...props} anchorId="coran-payment-form" /> : <button type="button" onClick={()=>setReady(true)} className="min-h-12 w-full rounded-lg border border-neutral-300 px-4 py-3 font-semibold">Afficher le paiement sécurisé</button>}
 </div>;
}
