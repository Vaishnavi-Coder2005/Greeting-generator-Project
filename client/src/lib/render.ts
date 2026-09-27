import type { Occasion, ThemeKey } from "@/data/occasions";
import type { GreetingData } from "@/data/fields";

export type Format = "square" | "story";
export const SIZES: Record<Format, [number, number]> = { square: [1080, 1080], story: [1080, 1920] };

interface ThemeStyle {
  headline: string;
  text: string;
  accent: string;
  veil: string; // rgb triplet for legibility glow
  dark?: boolean;
}

export const THEMES: Record<ThemeKey, ThemeStyle> = {
  diwali: { headline: "#8A2A0B", text: "#3D2412", accent: "#C56A12", veil: "255,246,228" },
  holi: { headline: "#A3195B", text: "#2F2440", accent: "#D58A00", veil: "255,255,255" },
  newyear: { headline: "#F2CD78", text: "#F4EFE2", accent: "#E2B857", veil: "14,26,58", dark: true },
  birthday: { headline: "#B83B2E", text: "#3A2A26", accent: "#C98A1E", veil: "255,242,232" },
  anniversary: { headline: "#9F1239", text: "#3B1F24", accent: "#B07F3F", veil: "255,244,242" },
  harvest: { headline: "#8F430A", text: "#33260F", accent: "#3F7D2B", veil: "255,248,230" },
  devotional: { headline: "#9E220E", text: "#3B1D0E", accent: "#C47E12", veil: "255,244,226" },
  eid: { headline: "#0E5A43", text: "#16322A", accent: "#A8822A", veil: "250,252,244" },
  christmas: { headline: "#9D1C1C", text: "#1F3326", accent: "#1F6B3A", veil: "255,255,255" },
  national: { headline: "#C0520B", text: "#1B2B4A", accent: "#13803D", veil: "255,255,255" },
  floral: { headline: "#8E3B50", text: "#3A2A2C", accent: "#5F7D4D", veil: "255,249,243" },
  royal: { headline: "#EBC97D", text: "#F3ECD9", accent: "#D4AF5F", veil: "10,52,40", dark: true },
  toran: { headline: "#8A3B0C", text: "#2F2A12", accent: "#3E7A2A", veil: "255,249,234" },
  lotus: { headline: "#8D2F5F", text: "#3A2638", accent: "#B98237", veil: "255,244,240" },
};

export const artUrl = (theme: ThemeKey, format: Format) => `./art/${theme}-${format === "square" ? "sq" : "st"}.jpg`;
export const thumbUrl = (theme: ThemeKey) => `./art/${theme}-th.jpg`;

/** Designs offered for an occasion: its own art + two versatile alternates */
export function designsFor(o: Occasion): ThemeKey[] {
  const alts: ThemeKey[] = ["floral", "royal", "lotus", "toran"];
  const list: ThemeKey[] = [o.theme];
  for (const a of alts) if (!list.includes(a) && list.length < 3) list.push(a);
  return list;
}

/* ------------------------------------------------------------------
 * TEMPLATES
 * Each occasion offers 5 templates built from 4 layout styles:
 *  - art        full illustrated background (Traditional / Festive / Celebratory / Classic)
 *  - premium    dark jewel-tone background, gold frame (Premium / Elegant)
 *  - corporate  clean white card with illustrated header band (Corporate / Professional)
 *  - minimal    quiet paper background, fine border (Minimal / Modern)
 * To add a style: add it to TemplateStyle, handle it in paintBackground()
 * and safeArea(), then list it in templatesFor().
 * ------------------------------------------------------------------ */
export type TemplateStyle = "art" | "premium" | "corporate" | "minimal";
export interface Template {
  id: string;
  style: TemplateStyle;
  art: ThemeKey;
  /** i18n key for the template name, e.g. "tpl.premium" */
  label: string;
}

export function templatesFor(o: Occasion): Template[] {
  const [own, alt] = designsFor(o);
  const personal = o.category === "occasion";
  const t = (style: TemplateStyle, art: ThemeKey, label: string): Template => ({ id: `${style}-${art}`, style, art, label: `tpl.${label}` });
  return personal
    ? [t("art", own, "celebratory"), t("premium", own, "elegant"), t("corporate", own, "professional"), t("minimal", own, "modern"), t("art", alt, "classic")]
    : [t("art", own, "traditional"), t("premium", own, "premium"), t("corporate", own, "corporate"), t("minimal", own, "minimal"), t("art", alt, "festive")];
}

/** Light-background colours for themes whose art is dark */
const LIGHT_OVERRIDE: Partial<Record<ThemeKey, ThemeStyle>> = {
  newyear: { headline: "#1B2A5E", text: "#1E2433", accent: "#B8912F", veil: "255,255,255" },
  royal: { headline: "#0F4C3A", text: "#1F2A26", accent: "#B08A3A", veil: "255,255,255" },
};
const lightStyle = (k: ThemeKey): ThemeStyle => LIGHT_OVERRIDE[k] ?? THEMES[k];

/** Jewel-tone gradient for premium templates, chosen by theme family */
function premiumTone(k: ThemeKey): [string, string] {
  if (["diwali", "devotional", "toran", "harvest"].includes(k)) return ["#5E1712", "#220605"];
  if (["anniversary", "lotus", "floral", "birthday", "holi"].includes(k)) return ["#4C1440", "#1B0617"];
  if (k === "newyear") return ["#1A2A5C", "#070C22"];
  return ["#0F4A3A", "#05201A"];
}
const PREMIUM_STYLE: ThemeStyle = { headline: "#EACB82", text: "#F6EFDF", accent: "#D6B062", veil: "0,0,0", dark: true };

export function styleFor(tpl: Template): ThemeStyle {
  if (tpl.style === "art") return THEMES[tpl.art];
  if (tpl.style === "premium") return PREMIUM_STYLE;
  return lightStyle(tpl.art);
}

const imgCache = new Map<string, Promise<HTMLImageElement>>();
export function loadImage(src: string): Promise<HTMLImageElement> {
  if (!imgCache.has(src)) {
    imgCache.set(
      src,
      new Promise((resolve, reject) => {
        const img = new Image();
        if (!src.startsWith("data:")) img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => {
          imgCache.delete(src);
          reject(new Error("image load failed"));
        };
        img.src = src;
      }),
    );
  }
  return imgCache.get(src)!;
}

export interface RenderInput {
  occasion: Occasion;
  template: Template;
  format: Format;
  data: GreetingData;
  headline: string;
  message: string;
  signoff: string;
  milestone?: string; // already formatted "25th Anniversary"
  fonts: { display: string; body: string };
  latinHeadline: boolean;
  rtl: boolean;
  tallScript: boolean; // scripts needing more line height
}

function coverDraw(ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number) {
  const r = Math.max(W / img.width, H / img.height);
  const w = img.width * r;
  const h = img.height * r;
  ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width <= maxW || !cur) cur = test;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxW) last = last.slice(0, -1);
    kept[maxLines - 1] = `${last.trimEnd()}…`;
    return kept;
  }
  return lines;
}

interface Block {
  h: number;
  draw: (y: number) => void;
}

export async function renderGreeting(canvas: HTMLCanvasElement, input: RenderInput, outScale = 1) {
  const [W, H] = SIZES[input.format];
  canvas.width = Math.round(W * outScale);
  canvas.height = Math.round(H * outScale);
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(outScale, 0, 0, outScale, 0, 0);
  const tpl = input.template;
  const th = styleFor(tpl);
  const { data } = input;
  const isStory = input.format === "story";

  // --- assets
  let [bg, photo, logo, senderPhoto] = await Promise.all([
    loadImage(artUrl(tpl.art, input.format)).catch(() => null),
    data.photo ? loadImage(data.photo).catch(() => null) : Promise.resolve(null),
    data.logo ? loadImage(data.logo).catch(() => null) : Promise.resolve(null),
    data.senderPhoto ? loadImage(data.senderPhoto).catch(() => null) : Promise.resolve(null),
  ]);
  // Festival greetings have no recipient: the sender's photo becomes the main portrait
  if (!photo && senderPhoto && input.occasion.fieldSet === "festival") {
    photo = senderPhoto;
    senderPhoto = null;
  }

  // --- fonts
  const headFam = input.latinHeadline ? `italic 700 {s}px "Playfair Display"` : `700 {s}px "${input.fonts.display}"`;
  const bodyFam = (w: number, s: number) => `${w} ${s}px "${input.fonts.body}", "Satoshi", "Noto Sans", sans-serif`;
  const headFont = (s: number) => `${headFam.replace("{s}", String(s))}, "${input.fonts.body}", "Satoshi", serif`;
  const allText = [input.headline, input.message, input.signoff, data.recipient, data.senderName, data.company, data.phone, input.milestone].filter(Boolean).join(" ");
  try {
    await Promise.all([
      document.fonts.load(headFont(80), allText),
      document.fonts.load(bodyFam(400, 30), allText),
      document.fonts.load(bodyFam(700, 30), allText),
      document.fonts.load(bodyFam(500, 30), allText),
    ]);
  } catch {
    /* fall back silently */
  }

  // --- background + safe text area (depends on template style)
  const safe = paintBackground(ctx, tpl, th, bg, W, H, isStory);
  const cx = W / 2;

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.direction = input.rtl ? "rtl" : "ltr";
  const lh = input.tallScript ? 1.6 : 1.3;
  const headLh = input.tallScript ? 1.55 : input.latinHeadline ? 1.12 : 1.35;

  const build = (s: number): Block[] => {
    const blocks: Block[] = [];
    const gap = (n: number): Block => ({ h: n * s, draw: () => {} });
    const base = isStory ? 1.18 : 1;

    if (logo) {
      const maxH = (photo ? 76 : 104) * s * base;
      const maxW = 330 * s * base;
      const r = Math.min(maxH / logo.height, maxW / logo.width);
      const lw = logo.width * r;
      const lhh = logo.height * r;
      const pad = 14 * s;
      blocks.push({
        h: lhh + pad * 2,
        draw: (y) => {
          ctx.save();
          ctx.fillStyle = "rgba(255,255,255,0.92)";
          ctx.shadowColor = "rgba(0,0,0,0.12)";
          ctx.shadowBlur = 18 * s;
          ctx.shadowOffsetY = 4 * s;
          roundRect(ctx, cx - lw / 2 - pad, y, lw + pad * 2, lhh + pad * 2, 18 * s);
          ctx.fill();
          ctx.restore();
          ctx.drawImage(logo, cx - lw / 2, y + pad, lw, lhh);
        },
      });
      blocks.push(gap(26));
    }

    if (photo) {
      const d = (isStory ? 300 : logo ? 196 : 220) * s;
      const ring = 7 * s;
      blocks.push({
        h: d + ring * 2,
        draw: (y) => drawRoundPhoto(ctx, photo, cx, y + ring + d / 2, d, ring, th.accent, s),
      });
      blocks.push(gap(24));
    }

    // headline
    let hs = (input.latinHeadline ? 96 : 76) * s * base;
    ctx.font = headFont(hs);
    let hLines = wrap(ctx, input.headline, safe.w, 3);
    while (hLines.some((l) => ctx.measureText(l).width > safe.w) && hs > 30) {
      hs -= 4;
      ctx.font = headFont(hs);
      hLines = wrap(ctx, input.headline, safe.w, 3);
    }
    const hsFinal = hs;
    const hLinesFinal = hLines;
    blocks.push({
      h: hLinesFinal.length * hsFinal * headLh,
      draw: (y) => {
        ctx.font = headFont(hsFinal);
        ctx.fillStyle = th.headline;
        hLinesFinal.forEach((l, i) => ctx.fillText(l, cx, y + hsFinal * (i + 0.95) * headLh - hsFinal * (headLh - 1) * 0.5));
      },
    });

    if (data.recipient?.trim()) {
      const rs = 56 * s * base;
      ctx.font = bodyFam(700, rs);
      const rl = wrap(ctx, data.recipient.trim(), safe.w, 2);
      blocks.push(gap(14));
      blocks.push({
        h: rl.length * rs * lh,
        draw: (y) => {
          ctx.font = bodyFam(700, rs);
          ctx.fillStyle = th.text;
          rl.forEach((l, i) => ctx.fillText(l, cx, y + rs * (i + 1) * lh - rs * (lh - 1) * 0.6));
        },
      });
    }
    if (input.milestone?.trim()) {
      const ms = 28 * s * base;
      blocks.push(gap(6));
      blocks.push({
        h: ms * lh,
        draw: (y) => {
          ctx.font = bodyFam(600, ms);
          ctx.fillStyle = th.accent;
          ctx.fillText(input.milestone!.trim(), cx, y + ms * lh - ms * (lh - 1) * 0.6);
        },
      });
    }

    // ornament
    blocks.push(gap(18));
    blocks.push({
      h: 20 * s,
      draw: (y) => {
        const my = y + 10 * s;
        ctx.strokeStyle = th.accent;
        ctx.fillStyle = th.accent;
        ctx.lineWidth = 2 * s;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(cx - 90 * s, my);
        ctx.lineTo(cx - 16 * s, my);
        ctx.moveTo(cx + 16 * s, my);
        ctx.lineTo(cx + 90 * s, my);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, my - 8 * s);
        ctx.lineTo(cx + 8 * s, my);
        ctx.lineTo(cx, my + 8 * s);
        ctx.lineTo(cx - 8 * s, my);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      },
    });
    blocks.push(gap(18));

    if (input.message.trim()) {
      const ms = 32 * s * base;
      ctx.font = bodyFam(500, ms);
      const ml = wrap(ctx, input.message.trim(), safe.w * 0.94, isStory ? 7 : 5);
      blocks.push({
        h: ml.length * ms * lh,
        draw: (y) => {
          ctx.font = bodyFam(500, ms);
          ctx.fillStyle = th.text;
          ml.forEach((l, i) => ctx.fillText(l, cx, y + ms * (i + 1) * lh - ms * (lh - 1) * 0.6));
        },
      });
      blocks.push(gap(26));
    }

    if (senderPhoto) {
      const d = 118 * s * base;
      blocks.push({
        h: d + 8 * s,
        draw: (y) => drawRoundPhoto(ctx, senderPhoto, cx, y + 4 * s + d / 2, d, 5 * s, th.accent),
      });
      blocks.push(gap(12));
    }

    // sign-off
    const ss = 26 * s * base;
    blocks.push({
      h: ss * lh,
      draw: (y) => {
        ctx.font = bodyFam(400, ss);
        ctx.fillStyle = th.text;
        ctx.globalAlpha = 0.8;
        ctx.fillText(input.signoff, cx, y + ss * lh - ss * (lh - 1) * 0.6);
        ctx.globalAlpha = 1;
      },
    });
    if (data.senderName?.trim()) {
      const ns = 40 * s * base;
      ctx.font = bodyFam(700, ns);
      const nl = wrap(ctx, data.senderName.trim(), safe.w, 2);
      blocks.push({
        h: nl.length * ns * lh,
        draw: (y) => {
          ctx.font = bodyFam(700, ns);
          ctx.fillStyle = th.headline;
          nl.forEach((l, i) => ctx.fillText(l, cx, y + ns * (i + 1) * lh - ns * (lh - 1) * 0.6));
        },
      });
    }
    if (data.company?.trim()) {
      const cs = 29 * s * base;
      ctx.font = bodyFam(600, cs);
      const cl = wrap(ctx, data.company.trim(), safe.w, 2);
      blocks.push({
        h: cl.length * cs * lh,
        draw: (y) => {
          ctx.font = bodyFam(600, cs);
          ctx.fillStyle = th.text;
          cl.forEach((l, i) => ctx.fillText(l, cx, y + cs * (i + 1) * lh - cs * (lh - 1) * 0.6));
        },
      });
    }
    if (data.phone?.trim()) {
      const ps = 26 * s * base;
      blocks.push(gap(2));
      blocks.push({
        h: ps * lh,
        draw: (y) => {
          ctx.save();
          ctx.direction = "ltr";
          ctx.font = `500 ${ps}px "Satoshi", sans-serif`;
          ctx.fillStyle = th.text;
          ctx.globalAlpha = 0.85;
          const txt = data.phone!.trim();
          const tw = ctx.measureText(txt).width;
          const iy = y + ps * lh - ps * (lh - 1) * 0.6;
          drawPhoneIcon(ctx, cx - tw / 2 - ps * 0.75, iy - ps * 0.38, ps * 0.62, th.text);
          ctx.fillText(txt, cx + ps * 0.3, iy);
          ctx.restore();
        },
      });
    }
    return blocks;
  };

  let s = tpl.style === "art" ? 1 : 1.15;
  let blocks = build(s);
  const total = (b: Block[]) => b.reduce((a, x) => a + x.h, 0);
  while (total(blocks) > safe.h && s > 0.5) {
    s -= 0.04;
    blocks = build(s);
  }
  let y = safe.y + Math.max(0, (safe.h - total(blocks)) / 2);
  for (const b of blocks) {
    b.draw(y);
    y += b.h;
  }

  return canvas;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPhoneIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  // simple handset glyph (lucide "phone" path scaled from 24px)
  const p = new Path2D(
    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
  );
  ctx.save();
  ctx.translate(x - size / 2, y - size / 2);
  ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.stroke(p);
  ctx.restore();
}

/** Circular photo with accent ring; auto centre-crops any aspect ratio */
function drawRoundPhoto(ctx: CanvasRenderingContext2D, img: HTMLImageElement, pcx: number, pcy: number, d: number, ring: number, accent: string, s = 1) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 24 * s;
  ctx.beginPath();
  ctx.arc(pcx, pcy, d / 2 + ring, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.arc(pcx, pcy, d / 2 + ring * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(pcx, pcy, d / 2 - ring * 0.2, 0, Math.PI * 2);
  ctx.clip();
  const r = Math.max(d / img.width, d / img.height);
  ctx.drawImage(img, pcx - (img.width * r) / 2, pcy - (img.height * r) / 2, img.width * r, img.height * r);
  ctx.restore();
}

type Rect = { x: number; y: number; w: number; h: number };

/** Paints the template background and returns the safe area for text */
function paintBackground(
  ctx: CanvasRenderingContext2D,
  tpl: Template,
  th: ThemeStyle,
  bg: HTMLImageElement | null,
  W: number,
  H: number,
  isStory: boolean,
): Rect {
  if (tpl.style === "premium") {
    const [c1, c2] = premiumTone(tpl.art);
    const g = ctx.createRadialGradient(W / 2, H * 0.45, 40, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    if (bg) {
      // faint motif texture from the illustration
      ctx.save();
      ctx.globalAlpha = 0.13;
      ctx.globalCompositeOperation = "screen";
      coverDraw(ctx, bg, W, H);
      ctx.restore();
    }
    // gold double frame with corner diamonds
    const o1 = 34;
    const o2 = 50;
    ctx.save();
    ctx.strokeStyle = th.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(o1, o1, W - o1 * 2, H - o1 * 2);
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(o2, o2, W - o2 * 2, H - o2 * 2);
    ctx.globalAlpha = 1;
    ctx.fillStyle = th.accent;
    for (const [x, y] of [[o1, o1], [W - o1, o1], [o1, H - o1], [W - o1, H - o1]]) {
      ctx.beginPath();
      ctx.moveTo(x, y - 14);
      ctx.lineTo(x + 14, y);
      ctx.lineTo(x, y + 14);
      ctx.lineTo(x - 14, y);
      ctx.closePath();
      ctx.fill();
    }
    // top & bottom flourish
    for (const y of [o2 + 46, H - o2 - 46]) drawFlourish(ctx, W / 2, y, 150, th.accent);
    ctx.restore();
    return isStory ? { x: W * 0.12, y: H * 0.12, w: W * 0.76, h: H * 0.74 } : { x: W * 0.13, y: H * 0.15, w: W * 0.74, h: H * 0.7 };
  }

  if (tpl.style === "corporate") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, W, H);
    const bandH = isStory ? H * 0.25 : H * 0.27;
    if (bg) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, bandH);
      ctx.clip();
      const r = W / bg.width;
      ctx.drawImage(bg, 0, 0, W, bg.height * r);
      ctx.restore();
      const fade = ctx.createLinearGradient(0, bandH * 0.45, 0, bandH);
      fade.addColorStop(0, "rgba(255,255,255,0)");
      fade.addColorStop(1, "rgba(255,255,255,1)");
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, W, bandH + 1);
    }
    // footer bar in brand colours
    const fb = isStory ? 26 : 20;
    ctx.fillStyle = th.headline;
    ctx.fillRect(0, H - fb, W, fb);
    ctx.fillStyle = th.accent;
    ctx.fillRect(0, H - fb - 6, W, 6);
    // left rule
    ctx.fillStyle = th.accent;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(W / 2 - 40, bandH + (isStory ? 10 : 4), 80, 4);
    ctx.globalAlpha = 1;
    return isStory
      ? { x: W * 0.1, y: bandH + 40, w: W * 0.8, h: H - bandH - 170 }
      : { x: W * 0.1, y: bandH + 24, w: W * 0.8, h: H - bandH - 110 };
  }

  if (tpl.style === "minimal") {
    ctx.fillStyle = "#FBF8F2";
    ctx.fillRect(0, 0, W, H);
    const tint = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, Math.max(W, H) * 0.7);
    tint.addColorStop(0, "rgba(255,255,255,0.9)");
    tint.addColorStop(1, "rgba(240,232,216,0.55)");
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.strokeStyle = th.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(44, 44, W - 88, H - 88);
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    ctx.strokeRect(58, 58, W - 116, H - 116);
    ctx.restore();
    // small motif medallion taken from the illustration's corner
    if (bg) {
      const d = isStory ? 150 : 120;
      const mx = W / 2;
      const my = isStory ? 150 : 118;
      ctx.save();
      ctx.beginPath();
      ctx.arc(mx, my, d / 2, 0, Math.PI * 2);
      ctx.clip();
      const sw = bg.width * 0.34;
      ctx.drawImage(bg, 0, 0, sw, sw, mx - d / 2, my - d / 2, d, d);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(mx, my, d / 2 + 5, 0, Math.PI * 2);
      ctx.strokeStyle = th.accent;
      ctx.lineWidth = 2;
      ctx.stroke();
      return isStory ? { x: W * 0.12, y: my + d / 2 + 60, w: W * 0.76, h: H - (my + d / 2 + 60) - 150 } : { x: W * 0.13, y: my + d / 2 + 34, w: W * 0.74, h: H - (my + d / 2 + 34) - 100 };
    }
    return isStory ? { x: W * 0.12, y: H * 0.12, w: W * 0.76, h: H * 0.74 } : { x: W * 0.13, y: H * 0.13, w: W * 0.74, h: H * 0.72 };
  }

  // art (illustrated) template
  ctx.fillStyle = th.dark ? "#0d2a22" : "#fbf6ec";
  ctx.fillRect(0, 0, W, H);
  if (bg) coverDraw(ctx, bg, W, H);
  const safe = isStory
    ? { x: W * 0.1, y: H * 0.19, w: W * 0.8, h: H * 0.6 }
    : { x: W * 0.135, y: H * 0.19, w: W * 0.73, h: H * 0.61 };
  // legibility veil
  const cx = W / 2;
  const cy = safe.y + safe.h / 2;
  const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(safe.w, safe.h) * 0.62);
  g.addColorStop(0, `rgba(${th.veil},0.72)`);
  g.addColorStop(0.65, `rgba(${th.veil},0.45)`);
  g.addColorStop(1, `rgba(${th.veil},0)`);
  ctx.fillStyle = g;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, (safe.h / safe.w) * 1.05);
  ctx.translate(-cx, -cy);
  ctx.fillRect(0, 0, W, H * 2);
  ctx.restore();
  return safe;
}

function drawFlourish(ctx: CanvasRenderingContext2D, x: number, y: number, half: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.6;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(x - half, y);
  ctx.quadraticCurveTo(x - half / 2, y - 12, x - 18, y);
  ctx.moveTo(x + half, y);
  ctx.quadraticCurveTo(x + half / 2, y - 12, x + 18, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
