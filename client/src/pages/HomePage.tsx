import { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { Search, X, ArrowRight, Sparkles, MapPin, CalendarHeart, PenLine, Share2, ChevronDown } from "lucide-react";
import { OCCASIONS, ALL_REGIONS, type Category, type Occasion } from "@/data/occasions";
import { norm, useI18n } from "@/lib/i18n";
import { thumbUrl } from "@/lib/render";
import { Shell } from "@/components/Shell";

const CATS: (Category | "all")[] = [
  "all", "occasion", "festival", "national", "important",
  "hindu", "islamic", "christian", "sikh", "buddhist", "jain", "parsi", "harvest", "regional",
];

const CATEGORY_LABELS: Record<Category, string> = {
  occasion: "Occasions",
  festival: "Festivals",
  regional: "Regional / State",
  national: "National / Widely Celebrated",
  important: "Important Days",
  hindu: "Hindu",
  islamic: "Islamic",
  christian: "Christian",
  sikh: "Sikh",
  buddhist: "Buddhist",
  jain: "Jain",
  parsi: "Parsi / Zoroastrian",
  harvest: "Harvest / Agricultural",
};

export function useRegionName() {
  const { t } = useI18n();
  return (r: string) => {
    const k = `region.${r}`;
    const v = t(k);
    return v === k ? r : v;
  };
}

export default function HomePage() {
  const { t, occ, lang } = useI18n();
  const regionName = useRegionName();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [region, setRegion] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const upcoming = useMemo(() => {
    const now = new Date();
    const m = now.getMonth() + 1;
    const next = (m % 12) + 1;
    const late = now.getDate() > 15;
    const list = OCCASIONS.filter((o) => o.months.includes(m) || o.months.includes(next));
    const score = (o: Occasion) => {
      const hasNext = o.months.includes(next);
      const hasCur = o.months.includes(m);
      let s = 0;
      if (late ? hasNext : hasCur) s += 2;
      if (o.popular) s += 1.5;
      if (o.category === "festival") s += 0.5;
      if (late && hasCur && !hasNext) s -= 1;
      return -s;
    };
    return list.sort((a, b) => score(a) - score(b)).slice(0, 10);
  }, []);

  const results = useMemo(() => {
    const n = norm(q);
    const list = OCCASIONS.filter((o) => {
      if (cat !== "all" && o.category !== cat) return false;
      if (region && !o.regions.includes(region)) return false;
      if (!n) return true;
      const hay = norm([occ(o, "name"), o.name, o.headline, occ(o, "headline"), ...(o.keywords ?? []), ...(o.alternativeNames ?? []), ...(o.date ? [o.date] : []), ...o.regions, ...o.regions.map(regionName)].join(" "));
      return n.split(" ").every((part) => hay.includes(part));
    });
    // popular first, then catalogue order
    return [...list.filter((o) => o.popular), ...list.filter((o) => !o.popular)];
  }, [q, cat, region, occ, regionName]);

  const scrollToList = () => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <Shell>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 sm:pt-8">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-[hsl(40_60%_94%)]">
          <div className="grid items-center gap-0 md:grid-cols-[1.05fr_1fr]">
            <div className="relative z-10 px-5 pb-6 pt-7 sm:px-10 sm:py-12">
              <h1 className="font-display text-[1.9rem] font-bold leading-[1.15] text-foreground sm:text-[2.6rem]" data-testid="text-hero-title">
                {t("home.heroTitle1")}
                <br />
                <span className="text-primary">{t("home.heroTitle2")}</span>
              </h1>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-foreground/75 sm:text-base">{t("home.heroText")}</p>
              <button
                onClick={scrollToList}
                data-testid="button-get-started"
                className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 active:scale-[0.98]"
              >
                {t("home.getStarted")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>
            <div className="relative h-40 sm:h-64 md:h-full md:min-h-[360px]">
              <img src="./art/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-[hsl(40_60%_94%)] via-transparent to-transparent md:bg-gradient-to-r rtl:md:bg-gradient-to-l" />
            </div>
          </div>
        </div>

        {/* Steps */}
        <ol className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { icon: CalendarHeart, k: "1" },
            { icon: PenLine, k: "2" },
            { icon: Share2, k: "3" },
          ].map(({ icon: Icon, k }) => (
            <li key={k} className="rounded-2xl border border-border/70 bg-card p-3 sm:flex sm:items-start sm:gap-3 sm:p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{k}</span>
              <div className="mt-2 sm:mt-0">
                <p className="text-[13px] font-semibold leading-snug text-foreground sm:text-sm">{t(`home.step${k}.title`)}</p>
                <p className="mt-0.5 hidden text-xs leading-relaxed text-muted-foreground sm:block">{t(`home.step${k}.desc`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Coming up */}
      {upcoming.length > 0 && (
        <section className="mx-auto mt-9 max-w-6xl px-4 sm:px-6">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[hsl(32_85%_45%)]" />
            <h2 className="text-lg font-bold text-foreground">{t("home.comingUp")}</h2>
          </div>
          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:-mx-6 sm:px-6">
            {upcoming.map((o) => (
              <OccasionCard key={o.id} o={o} lang={lang.code} className="w-[150px] shrink-0 snap-start sm:w-[180px]" testPrefix="upcoming" />
            ))}
          </div>
        </section>
      )}

      {/* All occasions */}
      <section ref={listRef} className="mx-auto mt-9 max-w-6xl scroll-mt-20 px-4 sm:px-6">
        <h2 className="text-lg font-bold text-foreground">{t("home.chooseOccasion")}</h2>

        <div className="sticky top-14 z-20 -mx-4 mt-3 bg-background/95 px-4 pb-3 pt-2 backdrop-blur sm:top-16 sm:-mx-6 sm:px-6">
          <label className="relative block">
            <span className="sr-only">{t("home.searchPlaceholder")}</span>
            <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("home.searchPlaceholder")}
              data-testid="input-occasion-search"
              className="h-12 w-full rounded-2xl border border-border bg-card pe-11 ps-12 text-[15px] text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              autoComplete="off"
              enterKeyHint="search"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label={t("home.clear")} data-testid="button-clear-occasion-search" className="absolute end-2.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary">
                <X className="h-4 w-4" />
              </button>
            )}
          </label>

          <div className="mt-2.5 flex items-center gap-2">
            <div className="-me-4 flex flex-1 gap-2 overflow-x-auto pe-4 scrollbar-none">
              {CATS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  data-testid={`button-category-${c}`}
                  className={`h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-semibold transition ${
                    cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/80 hover:bg-secondary"
                  }`}
                >
                  {c === "all" ? t("home.all") : CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <label className="relative inline-flex items-center">
              <MapPin className="pointer-events-none absolute start-3 h-4 w-4 text-primary" />
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                data-testid="select-region"
                aria-label={t("home.region")}
                className="h-9 appearance-none rounded-full border border-border bg-card pe-8 ps-8 text-[13px] font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{t("home.allRegions")}</option>
                {ALL_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {regionName(r)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-2.5 h-4 w-4 text-muted-foreground" />
            </label>
            <span className="text-xs text-muted-foreground" data-testid="text-result-count">
              {t("home.results", { count: results.length })}
            </span>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center" data-testid="status-no-occasions">
            <p className="font-semibold text-foreground">{t("home.noResults", { query: q })}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("home.noResultsHint")}</p>
            <Link href={`/${lang.code}/create/best-wishes`} className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground" data-testid="link-best-wishes">
              {t("occ.best-wishes.name") === "occ.best-wishes.name" ? "Best Wishes" : t("occ.best-wishes.name")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        ) : (
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {results.map((o, i) => (
              <OccasionCard key={o.id} o={o} lang={lang.code} testPrefix="occasion" style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }} className="animate-rise" />
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}

export function OccasionCard({
  o,
  lang,
  className = "",
  testPrefix,
  style,
}: {
  o: Occasion;
  lang: string;
  className?: string;
  testPrefix: string;
  style?: React.CSSProperties;
}) {
  const { occ } = useI18n();
  const regionName = useRegionName();
  const dark = o.theme === "newyear" || o.theme === "royal";
  const regional = o.category === "regional" && o.regions[0] !== "All India";
  return (
    <Link
      href={`/${lang}/create/${o.id}`}
      data-testid={`card-${testPrefix}-${o.id}`}
      style={style}
      className={`group relative block aspect-square overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
    >
      <img src={thumbUrl(o.theme)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className={`absolute inset-x-3 top-1/2 -translate-y-1/2 text-center ${dark ? "text-[#F2CD78]" : "text-[hsl(165_35%_14%)]"}`}>
        <span className={`inline-block rounded-xl px-2 py-1 font-display text-[15px] font-bold leading-snug sm:text-base ${dark ? "" : "bg-white/55 backdrop-blur-[2px]"}`}>{occ(o, "name")}</span>
      </div>
      {regional && (
        <span className="absolute bottom-2 start-2 max-w-[85%] truncate rounded-full bg-white/85 px-2 py-0.5 text-[10.5px] font-semibold text-[hsl(165_35%_18%)]">
          {regionName(o.regions[0])}
        </span>
      )}
    </Link>
  );
}
