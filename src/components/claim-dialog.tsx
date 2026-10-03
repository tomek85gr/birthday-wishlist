/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { Gift, X } from "lucide-react";

type ClaimStatus = "" | "loading" | "success" | "conflict" | "invalid" | "error";

export function ClaimDialog({ giftId, title, imageUrl, priceText, updatedAt }: { giftId: string; title: string; imageUrl: string | null; priceText: string | null; updatedAt: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [coBuyerEmail, setCoBuyerEmail] = useState("");
  const [showCoBuyerEmail, setShowCoBuyerEmail] = useState(false);
  const [status, setStatus] = useState<ClaimStatus>("");
  const [claimed, setClaimed] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLElement>(null);

  useEffect(() => {
    if (open) dialog.current?.querySelector<HTMLInputElement>("input")?.focus();
  }, [open]);

  function closeDialog() {
    setOpen(false);
    trigger.current?.focus();
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    try {
      const response = await fetch(`/api/gifts/${encodeURIComponent(giftId)}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, coBuyerEmail }),
      });
      const result = await response.json() as { status?: ClaimStatus };
      const nextStatus = result.status;
      if (nextStatus === "success") setClaimed(true);
      setStatus(nextStatus === "success" || nextStatus === "conflict" || nextStatus === "invalid" ? nextStatus : "error");
    } catch {
      setStatus("error");
    }
  }

  function keyboard(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeDialog();
      return;
    }
    if (e.key !== "Tab") return;
    const controls = [...e.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled])')];
    if (!controls.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return <>
    {claimed ? <span className="inline-flex min-h-12 items-center rounded-full bg-[#eff8f2] px-5 text-sm font-semibold text-[#527060]">Το έχει αναλάβει κάποιος ✓</span> : <button ref={trigger} type="button" onClick={() => { setOpen(true); setStatus(""); }} className="min-h-12 rounded-full bg-[#f0c97d] px-5 font-semibold text-[#403a32] transition hover:bg-[#e9bb64]">Θα το πάρω εγώ!</button>}
    {open && <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#20233480] p-0 sm:items-center sm:p-4" onMouseDown={e => { if (e.target === e.currentTarget) closeDialog(); }}>
      <section ref={dialog} onKeyDown={keyboard} role="dialog" aria-modal="true" aria-labelledby="claim-title" className="w-full max-w-md rounded-t-[28px] bg-white p-6 shadow-xl sm:rounded-[28px]">
        <div className="mb-4 flex items-center justify-between"><h2 id="claim-title" className="serif text-2xl">Κράτηση δώρου</h2><button type="button" aria-label="Κλείσιμο" onClick={closeDialog} className="grid size-11 place-items-center rounded-full hover:bg-stone-100"><X/></button></div>
        {status === "success" ? <div role="status" className="rounded-2xl bg-[#eff8f2] p-5"><p className="serif text-xl font-bold">Τέλεια! Το δώρο κρατήθηκε 🎉</p><p className="mt-2 text-sm text-[#58625a]">Δεν χρειάζεται να κάνεις κάτι άλλο εδώ.</p><button type="button" className="mt-5 min-h-11 rounded-full bg-[#427c68] px-5 font-semibold text-white" onClick={closeDialog}>Έγινε</button></div>
          : status === "conflict" ? <div role="alert" className="rounded-2xl bg-[#fff4df] p-5">Ωχ! Κάποιος μόλις πρόλαβε αυτό το δώρο. Διάλεξε ένα άλλο 💛</div>
            : status === "error" ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">Δεν ολοκληρώθηκε η κράτηση. Δοκίμασε ξανά σε λίγο.</p>
              : <><div className="mb-5 flex items-center gap-4 rounded-2xl bg-[#fff8f1] p-4"><div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-[#c58c70]">{imageUrl ? <img src={imageUrl.startsWith("data:image/jpeg;base64,") ? `/api/gift-image/${giftId}?v=${encodeURIComponent(updatedAt)}` : imageUrl} alt="" className="h-full w-full object-contain p-1"/> : <Gift size={28} aria-hidden="true"/>}</div><div className="min-w-0"><p className="font-semibold leading-6">{title}</p>{priceText && <p className="mt-1 text-sm text-[#777b86]">{priceText}</p>}</div></div><p className="mb-5 text-sm leading-6 text-[#72788a]">Θα κρατήσουμε αυτό το δώρο για εσάς ώστε να μην το επιλέξει κάποιος άλλος.</p><form onSubmit={submit}>
                <label htmlFor={`claim-email-${giftId}`} className="mb-2 block text-sm font-semibold">Email</label>
                <input id={`claim-email-${giftId}`} type="email" required maxLength={254} autoComplete="email" value={email} onChange={e => { setEmail(e.target.value); if (status === "invalid") setStatus(""); }} className="min-h-12 w-full min-w-0 max-w-full rounded-xl border border-stone-300 px-4" aria-invalid={status === "invalid"}/>
                {status === "invalid" && <p role="alert" className="mt-2 text-sm text-red-800">Συμπλήρωσε έγκυρες και διαφορετικές διευθύνσεις email.</p>}
                {!showCoBuyerEmail ? <button type="button" onClick={() => setShowCoBuyerEmail(true)} className="mt-3 min-h-11 text-sm font-medium text-[#625887] underline underline-offset-4 hover:text-[#443966]">Θα το αγοράσω μαζί με κάποιον άλλο</button> : <>
                  <label htmlFor={`claim-co-email-${giftId}`} className="mb-2 mt-4 block text-sm font-semibold">Email ατόμου που θα το αγοράσει μαζί σου (προαιρετικό)</label>
                  <input id={`claim-co-email-${giftId}`} type="email" maxLength={254} autoComplete="email" value={coBuyerEmail} onChange={e => { setCoBuyerEmail(e.target.value); if (status === "invalid") setStatus(""); }} className="min-h-12 w-full min-w-0 max-w-full rounded-xl border border-stone-300 px-4" aria-invalid={status === "invalid"}/>
                  <p className="mt-2 text-xs leading-5 text-[#777b86]">Τα email χρησιμοποιούνται μόνο για την κράτηση και δεν εμφανίζονται στους υπόλοιπους καλεσμένους. Βεβαιώσου ότι ο/η συνοδός συμφωνεί να καταχωρίσεις το email του/της.</p>
                  <button type="button" onClick={() => { setShowCoBuyerEmail(false); setCoBuyerEmail(""); }} className="mt-2 min-h-10 text-sm text-[#777b86] underline underline-offset-4">Αφαίρεση δεύτερου email</button>
                </>}
                <button type="submit" disabled={status === "loading"} className="mt-5 min-h-12 w-full rounded-full bg-[#8072ad] font-semibold text-white disabled:opacity-60">{status === "loading" ? "Γίνεται κράτηση…" : "Κράτηση δώρου"}</button>
              </form></>}
      </section>
    </div>}
  </>;
}
