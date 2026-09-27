import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import en from "@/i18n/locales/en.json";
import { LANGUAGE_MAP, SCRIPT_FONTS, type Language, type Script } from "@/i18n/languages";
import type { Occasion } from "@/data/occasions";

type Dict = Record<string, string>;
const EN = en as Dict;

// Lazy-load every locale file (code-split per language)
const loaders = import.meta.glob<{ default: Dict }>("../i18n/locales/*.json");

const cache: Record<string, Dict> = { en: EN };
export async function loadDict(code: string): Promise<Dict> {
  if (cache[code]) return cache[code];
  const loader = loaders[`../i18n/locales/${code}.json`];
  if (!loader) return EN;
  const mod = await loader();
  cache[code] = mod.default;
  return mod.default;
}

const loadedScripts = new Set<Script>();
export function ensureScriptFonts(script: Script) {
  if (loadedScripts.has(script)) return;
  loadedScripts.add(script);
  const fams = SCRIPT_FONTS[script].google;
  const href = `https://fonts.googleapis.com/css2?${fams.map((f) => `family=${f}`).join("&")}&display=swap`;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

export function format(str: string, vars?: Record<string, string | number>) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

interface I18nCtx {
  lang: Language;
  ready: boolean;
  t: (key: string, vars?: Record<string, string | number>) => string;
  occ: (o: Occasion, field: "name" | "headline" | "message") => string;
  fonts: { display: string; body: string };
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ code, children }: { code: string; children: ReactNode }) {
  const lang = LANGUAGE_MAP[code] ?? LANGUAGE_MAP.en;
  const [dict, setDict] = useState<Dict>(cache[lang.code] ?? EN);
  const [ready, setReady] = useState(!!cache[lang.code]);

  useEffect(() => {
    let alive = true;
    ensureScriptFonts("latin");
    ensureScriptFonts(lang.script);
    if (cache[lang.code]) {
      setDict(cache[lang.code]);
      setReady(true);
    } else {
      setReady(false);
      loadDict(lang.code).then((d) => {
        if (!alive) return;
        setDict(d);
        setReady(true);
      });
    }
    const f = SCRIPT_FONTS[lang.script];
    const root = document.documentElement;
    root.lang = lang.code;
    root.dir = lang.rtl ? "rtl" : "ltr";
    root.style.setProperty("--font-script", `'${f.body}'`);
    root.style.setProperty("--font-display-ui", lang.script === "latin" ? "'Playfair Display'" : `'${f.display}'`);
    return () => {
      alive = false;
    };
  }, [lang.code, lang.script, lang.rtl]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => format(dict[key] ?? EN[key] ?? key, vars),
    [dict],
  );
  const occ = useCallback(
    (o: Occasion, field: "name" | "headline" | "message") => dict[`occ.${o.id}.${field}`] ?? o[field],
    [dict],
  );
  const fonts = useMemo(() => {
    const f = SCRIPT_FONTS[lang.script];
    return { display: f.display, body: f.body };
  }, [lang.script]);

  const value = useMemo(() => ({ lang, ready, t, occ, fonts }), [lang, ready, t, occ, fonts]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n outside provider");
  return c;
}

/** Normalise text for search (lower-case, strip accents/punctuation) */
export function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'`".,()/&-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
