import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_HTML_BYTES = 512 * 1024;
const MAX_REDIRECTS = 4;

function privateIp(ip: string) {
  if (ip.includes(":")) {
    const value = ip.toLowerCase();
    if (value.startsWith("::ffff:")) {
      const mapped = value.slice(7);
      if (mapped.includes(".")) return privateIp(mapped);
      const words = mapped.split(":");
      if (words.length === 2) {
        const high = parseInt(words[0], 16);
        const low = parseInt(words[1], 16);
        if (Number.isFinite(high) && Number.isFinite(low)) return privateIp(`${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`);
      }
    }
    return value === "::" || value === "::1" || value.startsWith("fe80:") || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("ff");
  }
  const [a, b] = ip.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

async function validateTarget(value: string) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("invalid_url");
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) throw new Error("private_host");
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => privateIp(address))) throw new Error("private_host");
  return url;
}

function decodeEntities(value: string) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const code = entity[1]?.toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return ({ amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" } as Record<string, string>)[entity.toLowerCase()] ?? match;
  }).replace(/\s+/g, " ").trim();
}

function extract(html: string, baseUrl: string) {
  const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => {
    const attrs = [...match[0].matchAll(/([\w:-]+)\s*=\s*(?:(["'])(.*?)\2|([^\s>]+))/gi)];
    const values = Object.fromEntries(attrs.map((attr) => [attr[1].toLowerCase(), decodeEntities(attr[3] ?? attr[4] ?? "")]));
    const key = (values.property || values.name || values.itemprop || "").toLowerCase();
    return [key, values.content || ""] as const;
  });
  const pick = (...keys: string[]) => tags.find(([key, value]) => keys.includes(key) && value)?.[1] ?? "";
  const titleTag = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const title = pick("og:title", "twitter:title", "title", "name") || decodeEntities(titleTag.replace(/<[^>]*>/g, ""));
  const description = pick("og:description", "twitter:description", "description");
  let image = pick("og:image", "og:image:url", "twitter:image", "twitter:image:src", "image");
  try {
    const imageUrl = new URL(image, baseUrl);
    image = ["http:", "https:"].includes(imageUrl.protocol) ? imageUrl.toString() : "";
  } catch {
    image = "";
  }
  const amount = pick("product:price:amount", "og:price:amount", "price:amount", "price");
  const currency = pick("product:price:currency", "og:price:currency", "price:currency");
  return { title, description, image, price: amount ? `${amount}${currency ? ` ${currency}` : ""}` : "" };
}

export async function previewMetadata(raw: string) {
  try {
    let target = await validateTarget(raw);
    let response: Response | undefined;
    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
      response = await fetch(target, {
        redirect: "manual",
        signal: AbortSignal.timeout(7000),
        headers: { Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1" },
      });
      if (response.status < 300 || response.status >= 400) break;
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location || redirects === MAX_REDIRECTS) throw new Error("redirect_limit");
      target = await validateTarget(new URL(location, target).toString());
    }

    const contentType = (response?.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (!response?.ok || !["text/html", "application/xhtml+xml"].includes(contentType)) throw new Error("not_html");
    const reader = response.body?.getReader();
    if (!reader) throw new Error("empty_response");
    const decoder = new TextDecoder();
    let bytes = 0;
    let html = "";
    while (bytes < MAX_HTML_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      html += decoder.decode(value, { stream: true });
      if (bytes >= MAX_HTML_BYTES) {
        await reader.cancel();
        break;
      }
    }
    const metadata = extract(html, target.toString());
    if (!metadata.title && !metadata.image && !metadata.description && !metadata.price) throw new Error("no_metadata");
    return { ok: true as const, ...metadata, domain: target.hostname };
  } catch {
    return { ok: false as const };
  }
}
