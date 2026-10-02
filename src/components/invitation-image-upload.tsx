/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";

const MAX_IMAGE_BYTES = 320_000;
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

function toJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

export function InvitationImageUpload({ initialValue = "", name = "childImageUrl", label = "Φωτογραφία πρόσκλησης (προαιρετικό)" }: { initialValue?: string; name?: string; label?: string }) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function chooseImage(file?: File) {
    if (!file) return;
    setError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Επίλεξε εικόνα PNG, JPG ή WebP.");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError("Η εικόνα πρέπει να είναι μικρότερη από 15 MB.");
      return;
    }

    setBusy(true);
    try {
      const source = await createImageBitmap(file);
      let canvas = document.createElement("canvas");
      const scale = Math.min(1, 1400 / Math.max(source.width, source.height));
      canvas.width = Math.max(1, Math.round(source.width * scale));
      canvas.height = Math.max(1, Math.round(source.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("canvas");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      source.close();

      let blob: Blob | null = null;
      for (const quality of [0.84, 0.76, 0.66, 0.56, 0.46]) {
        blob = await toJpeg(canvas, quality);
        if (blob && blob.size <= MAX_IMAGE_BYTES) break;
        if (canvas.width > 800) {
          const smaller = document.createElement("canvas");
          smaller.width = Math.round(canvas.width * 0.78);
          smaller.height = Math.round(canvas.height * 0.78);
          smaller.getContext("2d")?.drawImage(canvas, 0, 0, smaller.width, smaller.height);
          canvas = smaller;
        }
      }
      if (!blob || blob.size > MAX_IMAGE_BYTES) throw new Error("size");

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("read"));
        reader.onerror = () => reject(new Error("read"));
        reader.readAsDataURL(blob);
      });
      setValue(dataUrl);
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setError("Δεν μπορέσαμε να επεξεργαστούμε την εικόνα. Δοκίμασε ένα αρχείο PNG ή JPG μικρότερο από 15 MB.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="grid gap-2 text-sm font-medium sm:col-span-2">
    <span>{label}</span>
    <input type="hidden" name={name} value={value} />
    <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void chooseImage(event.target.files?.[0])} className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 py-2 font-normal file:mr-3 file:rounded-full file:border-0 file:bg-[#f2ecfa] file:px-3 file:py-1 file:font-semibold file:text-[#625887]" aria-label="Ανέβασε φωτογραφία πρόσκλησης" />
    <span className="text-xs font-normal text-[#777b86]">PNG, JPG ή WebP · έως 15 MB (η εικόνα μικραίνει αυτόματα)</span>
    {busy && <span role="status" className="text-xs text-[#625887]">Επεξεργασία εικόνας…</span>}
    {error && <span role="alert" className="text-xs text-red-700">{error}</span>}
    {value && <div className="flex items-center gap-3 rounded-xl bg-[#fff8f1] p-3">
      <img src={value} alt="Προεπισκόπηση φωτογραφίας πρόσκλησης" className="size-16 rounded-lg bg-white object-cover" />
      <button type="button" onClick={() => setValue("")} className="min-h-11 rounded-full border border-stone-300 bg-white px-4 text-sm font-semibold">Αφαίρεση φωτογραφίας</button>
    </div>}
  </div>;
}
