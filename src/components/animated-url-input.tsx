"use client";

import { useEffect, useState } from "react";

const examples = ["π.χ. skroutz.gr/...", "π.χ. toys.gr/...", "π.χ. moustakastoys.gr/..."];

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function AnimatedUrlInput({ value, onChange }: Props) {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (value || motionPreference.matches) return;

    let fadeTimer: number | undefined;
    const interval = window.setInterval(() => {
      setPlaceholderVisible(false);
      fadeTimer = window.setTimeout(() => {
        setExampleIndex(index => (index + 1) % examples.length);
        setPlaceholderVisible(true);
      }, 140);
    }, 2600);

    return () => {
      window.clearInterval(interval);
      if (fadeTimer !== undefined) window.clearTimeout(fadeTimer);
    };
  }, [value]);

  return <input
    name="url"
    type="url"
    value={value}
    onChange={event => { if (!event.target.value) setPlaceholderVisible(true); onChange(event.target.value); }}
    placeholder={value ? "" : examples[exampleIndex]}
    className={`min-h-11 w-full min-w-0 max-w-full rounded-xl border px-3 font-normal placeholder:transition-opacity placeholder:duration-150 motion-reduce:placeholder:transition-none ${placeholderVisible ? "placeholder:opacity-100" : "placeholder:opacity-0"}`}
  />;
}
