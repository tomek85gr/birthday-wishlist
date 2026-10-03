/* eslint-disable @next/next/no-img-element */
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Gift as GiftIcon, GripVertical, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { Gift } from "@/lib/types";

type Props = {
  gift: Gift;
  disabled?: boolean;
  onEdit: () => void;
  onUnclaim: () => void;
  onDelete: () => void;
};

function retailerLabel(gift: Gift) {
  if (gift.retailer === "skroutz") return "Skroutz";
  if (gift.retailer === "jumbo") return "Jumbo";
  if (gift.url) {
    try {
      return new URL(gift.url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  }
  return "";
}

export function SortableGiftCard({ gift, disabled = false, onEdit, onUnclaim, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: gift.id, disabled });
  const verticalTransform = transform ? { ...transform, x: 0 } : null;
  const retailer = retailerLabel(gift);

  return <article
    ref={setNodeRef}
    style={{ transform: CSS.Transform.toString(verticalTransform), transition, zIndex: isDragging ? 10 : undefined }}
    className={`grid grid-cols-[40px_44px_minmax(0,1fr)_80px] items-center gap-2 rounded-2xl border border-stone-100 bg-white p-2 ${isDragging ? "relative opacity-70 shadow-lg ring-2 ring-[#cbbde8]" : ""}`}
  >
    <button
      type="button"
      {...attributes}
      {...listeners}
      aria-label={`Σύρε για αλλαγή σειράς: ${gift.title}`}
      title="Σύρε για αλλαγή σειράς"
      className={`grid size-10 place-items-center rounded-lg text-[#918aa2] touch-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7d6cb1] ${disabled ? "cursor-wait opacity-40" : "cursor-grab active:cursor-grabbing hover:bg-[#f5f2fa]"}`}
    ><GripVertical size={20} aria-hidden="true"/></button>

    <div className="size-11 shrink-0 overflow-hidden rounded-xl bg-[#fff8f1]">
      {gift.imageUrl
        ? <img src={gift.imageUrl.startsWith("data:image/jpeg;base64,") ? `/api/gift-image/${gift.id}?v=${encodeURIComponent(gift.updatedAt)}` : gift.imageUrl} alt={gift.title} className="h-full w-full object-contain p-1"/>
        : <div aria-hidden="true" className="grid h-full place-items-center text-[#c5a97c]"><GiftIcon size={22}/></div>}
    </div>

    <div className="min-w-0 py-0.5">
      <h3 className="break-words text-sm font-semibold leading-5 text-[#343448]">{gift.title}</h3>
      {(gift.priceText || retailer) && <p className="mt-1 break-words text-xs leading-4 text-[#777b86]">{[gift.priceText, retailer].filter(Boolean).join(" · ")}</p>}
      <p className={`safe-wrap mt-1 text-xs leading-4 ${gift.claimedAt ? "text-[#527060]" : "text-[#777b86]"}`}>
        {gift.claimedAt ? <>Κρατήθηκε{gift.claimedByEmail && <> · {gift.claimedByEmail}</>}{gift.claimedWithEmail && <><br/>Με συνοδό · {gift.claimedWithEmail}</>}</> : "Ελεύθερο για κράτηση"}
      </p>
    </div>

    <div className="grid w-20 grid-cols-2 grid-rows-2 place-items-center gap-0" aria-label="Ενέργειες δώρου">
      <button type="button" title="Επεξεργασία" aria-label={`Επεξεργασία: ${gift.title}`} onClick={onEdit} className="grid size-10 place-items-center rounded-full text-[#625887] hover:bg-[#f2ecfa] focus-visible:outline-2 focus-visible:outline-[#7d6cb1]"><Pencil size={16}/></button>
      {gift.claimedAt ? <button type="button" title="Ακύρωση κράτησης" aria-label={`Ακύρωση κράτησης: ${gift.title}`} onClick={onUnclaim} className="grid size-10 place-items-center rounded-full text-[#427c68] hover:bg-[#eff8f2] focus-visible:outline-2 focus-visible:outline-[#7d6cb1]"><RotateCcw size={16}/></button> : <span aria-hidden="true" className="size-10"/>}
      <button type="button" title="Διαγραφή" aria-label={`Διαγραφή: ${gift.title}`} onClick={onDelete} className="grid size-10 place-items-center rounded-full text-red-600 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-[#7d6cb1]"><Trash2 size={16}/></button>
      <span aria-hidden="true" className="size-10"/>
    </div>
  </article>;
}
