"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBirthday } from "@/app/actions";
import { PartyPopper } from "lucide-react";
import { InvitationImageUpload } from "@/components/invitation-image-upload";

export function CreateBirthday() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const form = new FormData(e.currentTarget);
      const result = await createBirthday(Object.fromEntries(form.entries()));
      if (result.ok) {
        router.push(`/${result.slug}/admin?key=${encodeURIComponent(result.key)}`);
        return;
      }
      setError("Δεν μπορέσαμε να δημιουργήσουμε την πρόσκληση. Έλεγξε τα στοιχεία και δοκίμασε ξανά.");
    } catch {
      setError("Δεν μπορέσαμε να δημιουργήσουμε την πρόσκληση. Δοκίμασε ξανά σε λίγο.");
    }
    setBusy(false);
  }

  return <main className="min-h-screen px-4 py-8 sm:grid sm:place-items-center"><section className="paper mx-auto w-full max-w-2xl rounded-[32px] p-6 sm:p-10"><div className="text-center"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#fff0df] text-[#ca9361]"><PartyPopper size={28}/></div><p className="mt-4 text-xs font-bold uppercase tracking-[.2em] text-[#a88476]">Birthday Wishlist</p><h1 className="serif mt-2 text-4xl">Μια γιορτή γεμάτη αγάπη</h1><p className="mx-auto mt-3 max-w-md leading-6 text-[#72788a]">Φτιάξε την πρόσκληση και τη λίστα δώρων σε λίγα λεπτά. Μοιράσου έναν σύνδεσμο με όλους.</p></div><form onSubmit={submit} className="mt-8 grid min-w-0 gap-4 sm:grid-cols-2"><p className="text-xs text-[#777b86] sm:col-span-2">Για να εμφανιστεί σωστά η ηλικία στην πρόσκληση, συμπλήρωσε και το έτος γέννησης του παιδιού.</p>{[["childName","Όνομα παιδιού","text"],["birthdayDate","Ημερομηνία γέννησης","date"],["partyDate","Ημερομηνία γιορτής","date"],["startTime","Ώρα έναρξης","time"],["locationText","Τοποθεσία","text"],["mapsUrl","Σύνδεσμος Google Maps (προαιρετικό)","url"],["phone","Τηλέφωνο","tel"]].map(([name,label,type])=><label key={name} className="grid min-w-0 gap-1.5 text-sm font-medium">{label}<input name={name} type={type} required={!(name==="mapsUrl"||name==="phone")} className="min-h-12 w-full min-w-0 max-w-full rounded-xl border border-stone-300 px-3 font-normal"/></label>)}<InvitationImageUpload/><label className="grid min-w-0 gap-1.5 text-sm font-medium sm:col-span-2">Κείμενο πρόσκλησης<textarea name="invitationText" rows={3} defaultValue="Σε περιμένω να γιορτάσουμε μαζί τα γενέθλιά μου! 🎈" className="w-full min-w-0 max-w-full rounded-xl border border-stone-300 p-3 font-normal"/></label>{error&&<p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}</p>}<button disabled={busy} className="mt-2 min-h-12 rounded-full bg-[#8072ad] px-6 font-semibold text-white disabled:opacity-70 sm:col-span-2 sm:justify-self-start">{busy?"Δημιουργία…":"Δημιούργησε την πρόσκληση"}</button></form></section></main>;
}
