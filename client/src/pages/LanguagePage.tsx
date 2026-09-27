import { useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Search, Check, ChevronRight, X, RotateCcw } from "lucide-react";
import { LANGUAGES, LANGUAGE_MAP, type Language } from "@/i18n/languages";
import { load } from "@/lib/persist";
import titles from "@/i18n/lang-titles.json";
import { norm } from "@/lib/i18n";

const T = titles as Record<string, { title: string; search: string; popular: string; all: string; none: string }>;

export default function LanguagePage() {
  const params = useParams<{ cur?: string }>();
  const cur = params.cur;
  const ui = T[cur ?? "en"] ?? T.en;
  const [, navigate] = useLocation();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const n = norm(q);
    if (!n) return LANGUAGES;
    return LANGUAGES.filter((l) => norm(`${l.name} ${l.native} ${l.regions} ${l.code}`).includes(n));
  }, [q]);

  const popular = LANGUAGES.filter((l) => l.popular);
  const last = !cur ? LANGUAGE_MAP[load<string>("lang", "")] : undefined;
  const choose = (l: Language) => navigate(`/${l.code}`);

  // A few rotating native greetings to signal multilingual support
  const marquee = ["en", "hi", "mr", "ta", "bn", "te", "gu", "kn", "ml", "pa", "or", "ur"]
    .map((c) => T[c]?.title)
    .filter(Boolean);

  return (
    <div className="min-h-[100dvh] bg-background paper-grain">
      <div className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col px-4 pb-10 pt-6 sm:px-6 sm:pt-10">
        <div className="flex items-center justify-between">
          {cur && (
            <button
              onClick={() => navigate(`/${cur}`)}
              data-testid="button-close-language"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-secondary"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-8 sm:mt-12">
          <p className="text-xs font-semibold text-primary/80" dir="ltr">1 / 3</p>
          <h1 className="mt-2 text-xl font-bold leading-tight text-foreground sm:text-2xl" data-testid="text-language-title">
            {ui.title}
          </h1>
          <div className="relative mt-2 h-6 overflow-hidden text-sm text-muted-foreground" aria-hidden="true">
            <div className="flex animate-[langscroll_28s_linear_infinite] gap-6 whitespace-nowrap">
              {[...marquee, ...marquee].map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        {last && (
          <button
            onClick={() => choose(last)}
            data-testid="button-continue-last-language"
            className="mt-6 flex w-full items-center gap-3 rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 text-start transition hover:border-primary"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <RotateCcw className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-lg font-bold text-foreground" lang={last.code}>{last.native}</span>
              <span className="block text-xs text-muted-foreground" dir="ltr">{last.name}</span>
            </span>
            <ChevronRight className="h-5 w-5 text-primary rtl:rotate-180" />
          </button>
        )}

        <label className="relative mt-6 block">
          <span className="sr-only">{ui.search}</span>
          <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={ui.search}
            data-testid="input-language-search"
            className="h-14 w-full rounded-2xl border border-border bg-card pe-12 ps-12 text-base text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            autoComplete="off"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute end-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
              aria-label="Clear"
              data-testid="button-clear-language-search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>

        {!q && (
          <section className="mt-7">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{ui.popular}</h2>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
              {popular.map((l) => (
                <LangTile key={l.code} l={l} active={l.code === cur} onClick={() => choose(l)} big />
              ))}
            </div>
          </section>
        )}

        <section className="mt-7">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{ui.all}</h2>
          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground" data-testid="text-no-language">
              {ui.none}
            </p>
          ) : (
            <ul className="overflow-hidden rounded-2xl border border-border bg-card">
              {filtered.map((l, i) => (
                <li key={l.code} className={i ? "border-t border-border/70" : ""}>
                  <button
                    onClick={() => choose(l)}
                    data-testid={`button-language-${l.code}`}
                    className="flex min-h-[60px] w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-secondary/70 focus-visible:bg-secondary focus-visible:outline-none"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-lg font-semibold text-primary" aria-hidden="true">
                      {firstGrapheme(l.native)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold text-foreground" dir={l.rtl ? "rtl" : "ltr"}>
                        {l.native}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {l.name} · {l.regions}
                      </span>
                    </span>
                    {l.code === cur ? <Check className="h-5 w-5 text-primary" /> : <ChevronRight className="h-5 w-5 text-muted-foreground rtl:rotate-180" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function LangTile({ l, active, onClick, big }: { l: Language; active: boolean; onClick: () => void; big?: boolean }) {
  return (
    <button
      onClick={onClick}
      data-testid={`button-popular-language-${l.code}`}
      className={`group flex flex-col items-start rounded-2xl border p-3.5 text-start transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        active ? "border-primary bg-primary/5" : "border-border bg-card"
      }`}
    >
      <span className={`${big ? "text-xl" : "text-lg"} font-bold leading-tight text-foreground`} dir={l.rtl ? "rtl" : "ltr"}>
        {l.native}
      </span>
      <span className="mt-0.5 text-xs text-muted-foreground">{l.name}</span>
    </button>
  );
}

function firstGrapheme(s: string) {
  try {
    const Seg = (Intl as unknown as { Segmenter?: new (l?: string, o?: { granularity: string }) => { segment: (s: string) => Iterable<{ segment: string }> } }).Segmenter;
    if (Seg) {
      const first = Array.from(new Seg(undefined, { granularity: "grapheme" }).segment(s))[0];
      if (first) return first.segment;
    }
  } catch {
    /* ignore */
  }
  return s.slice(0, 1);
}
