"use client";
import { mergeCoranConversion, type CoranConversion } from "@/lib/coran-conversion";
const cls = "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm";
export function CoranConversionFields({ value, onChange }: { value?: CoranConversion; onChange: (value: CoranConversion) => void }) {
 const c = mergeCoranConversion(value);
 return <section className="space-y-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
  <h3 className="font-bold">Argumentaire et questions fréquentes</h3>
  {([
   ["heroBenefits", "Bénéfices sous le titre (un par ligne)"], ["paymentNote", "Rassurance près du prix"],
   ["packHeading", "Titre du pack"], ["packIntro", "Présentation du pack"], ["packCta", "Bouton après les extraits"],
   ["savingsLabel", "Économie calculée ({amount} est remplacé par le montant)"], ["stepsHeading", "Titre de la méthode"],
   ["faqHeading", "Titre des questions fréquentes"], ["finalNote", "Explication avant le paiement"],
  ] as const).map(([key,label]) => <label key={key} className="block"><span className="mb-1 block text-sm font-semibold">{label}</span><textarea rows={3} className={cls} value={c[key]} onChange={(e)=>onChange({...c,[key]:e.target.value})}/></label>)}
  <label className="flex gap-3 text-sm"><input type="checkbox" checked={c.showBanners} onChange={(e)=>onChange({...c,showBanners:e.target.checked})}/>Afficher les anciennes bannières dans le parcours</label>
  {(["steps","faq"] as const).map(key => <div key={key} className="space-y-3">
    <h4 className="font-semibold">{key === "steps" ? "Étapes de la méthode" : "Questions et réponses"}</h4>
    {c[key].map((item,i)=><div key={i} className="space-y-2 rounded-lg border p-3">
      <label className="block text-sm">{key === "steps" ? "Titre" : "Question"}<input className={cls} value={item.title} onChange={(e)=>onChange({...c,[key]:c[key].map((x,j)=>j===i?{...x,title:e.target.value}:x)})}/></label>
      <label className="block text-sm">{key === "steps" ? "Explication" : "Réponse"}<textarea rows={3} className={cls} value={item.text} onChange={(e)=>onChange({...c,[key]:c[key].map((x,j)=>j===i?{...x,text:e.target.value}:x)})}/></label>
      <button type="button" className="text-sm text-rose-700" onClick={()=>onChange({...c,[key]:c[key].filter((_,j)=>i!==j)})}>Supprimer</button>
    </div>)}
    <button type="button" className="text-sm font-semibold underline" onClick={()=>onChange({...c,[key]:[...c[key],{title:"",text:""}]})}>Ajouter</button>
  </div>)}
 </section>;
}
