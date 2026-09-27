import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, ArrowRight, Loader2, RotateCcw, Square, Smartphone, AlertCircle, Check } from "lucide-react";
import { OCCASION_MAP } from "@/data/occasions";
import { FIELD_SETS, type FieldDef, type GreetingData } from "@/data/fields";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { templatesFor, renderGreeting, type Format, type RenderInput, type Template } from "@/lib/render";
import { Shell } from "@/components/Shell";
import { apiRequest } from "@/lib/queryClient";
import { ImageUpload } from "@/components/ImageUpload";

const SENDER_KEYS = ["senderName", "company", "phone", "logo", "senderPhoto"] as const;

export default function CreatePage() {
  const { id } = useParams<{ id: string }>();
  const o = OCCASION_MAP[id];
  const i18n = useI18n();
  const { t, occ, lang, ready, fonts } = i18n;
  const store = useStore();
  const [, navigate] = useLocation();

  const fields: FieldDef[] = useMemo(() => {
    if (!o) return [];
    return FIELD_SETS[o.fieldSet].filter((f) => f.key !== "years" || o.id.includes("anniversary"));
  }, [o]);

  const draft = o ? store.drafts[o.id] : undefined;
  const [data, setData] = useState<GreetingData>(() => draft?.data ?? { ...store.sender });
  const [messageEdited, setMessageEdited] = useState(!!draft?.messageEdited);
  const templates = useMemo(() => (o ? templatesFor(o) : []), [o]);
  const [tplId, setTplId] = useState<string>(draft?.template && templates.some((x) => x.id === draft.template) ? draft.template : templates[0]?.id);
  const template: Template = templates.find((x) => x.id === tplId) ?? templates[0];
  const [format, setFormat] = useState<Format>(draft?.format ?? "square");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [busy, setBusy] = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);

  // default message follows the selected language until the user edits it
  useEffect(() => {
    if (o && ready && !messageEdited) setData((d) => ({ ...d, message: occ(o, "message") }));
  }, [o, ready, occ, messageEdited]);

  // persist the draft & sender details in memory (for Back / Edit / next occasion)
  useEffect(() => {
    if (!o) return;
    store.setDraft(o.id, { data, template: tplId, format, messageEdited });
    const s: GreetingData = {};
    SENDER_KEYS.forEach((k) => data[k] && (s[k] = data[k]));
    store.setSender(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, tplId, format, messageEdited]);

  const renderInput = (tpl: Template = template, fmt: Format = format): RenderInput | null =>
    o
      ? {
          occasion: o,
          template: tpl,
          format: fmt,
          // only the fields this occasion asks for (ignore remembered extras)
          data: Object.fromEntries(Object.entries(data).filter(([k]) => k === "message" || fields.some((f) => f.key === k))) as GreetingData,
          headline: occ(o, "headline"),
          message: data.message ?? "",
          signoff: t("card.signoff"),
          milestone: data.years?.trim() ? t(o.fieldSet === "work" ? "card.celebrating" : "card.milestone", { years: data.years.trim() }) : undefined,
          fonts,
          latinHeadline: lang.script === "latin",
          rtl: !!lang.rtl,
          tallScript: lang.script !== "latin",
        }
      : null;

  // live preview (debounced)
  useEffect(() => {
    const input = renderInput();
    if (!input || !ready) return;
    const h = setTimeout(() => {
      if (previewRef.current) renderGreeting(previewRef.current, input, 0.5).catch(() => {});
    }, 180);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, tplId, format, ready, lang.code]);

  if (!o) {
    return (
      <Shell>
        <div className="mx-auto max-w-md p-8 text-center">
          <p className="text-muted-foreground">{t("err.generic")}</p>
          <Link href={`/${lang.code}`} className="mt-4 inline-block font-semibold text-primary">
            {t("form.back")}
          </Link>
        </div>
      </Shell>
    );
  }

  const set = (k: keyof GreetingData, v: string | undefined) => {
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    for (const f of fields) {
      const v = (data[f.key] ?? "").trim();
      if (f.required && !v) e[f.key] = t("err.required", { field: t(`${f.i18n}.label`) });
      else if (f.max && f.type !== "image" && v.length > f.max) e[f.key] = t("err.tooLong", { max: f.max });
    }
    setErrors(e);
    return e;
  };

  const generate = async () => {
    const e = validate();
    const firstErr = fields.find((f) => e[f.key]);
    if (firstErr) {
      setShowSummary(true);
      document.getElementById(`field-${firstErr.key}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      (document.getElementById(`field-${firstErr.key}`) as HTMLInputElement | null)?.focus({ preventScroll: true });
      return;
    }
    setShowSummary(false);
    setBusy(true);
    try {
      const c = document.createElement("canvas");
      await renderGreeting(c, renderInput()!, 1);
      store.persist(data);
      apiRequest("POST", "/api/track", { occasion: o.id, language: lang.code }).catch(() => {});
      const url = c.toDataURL("image/png");
      store.setResult({ occasionId: o.id, dataUrl: url, format });
      navigate(`/${lang.code}/create/${o.id}/done`);
    } catch {
      setErrors({ _: t("err.generic") });
      setShowSummary(true);
    } finally {
      setBusy(false);
    }
  };

  const recipientFields = fields.filter((f) => f.group === "recipient");
  const senderFields = fields.filter((f) => f.group === "sender");
  const messageField = fields.find((f) => f.group === "message");
  const errCount = Object.values(errors).filter(Boolean).length;

  const renderField = (f: FieldDef) => {
    if (f.type === "image")
      return <ImageUpload key={f.key} id={f.key} label={t(`${f.i18n}.label`)} value={data[f.key]} onChange={(v) => set(f.key, v)} shape={f.shape ?? "logo"} />;
    const err = errors[f.key];
    const common = {
      id: `field-${f.key}`,
      value: data[f.key] ?? "",
      placeholder: t(`${f.i18n}.ph`),
      "aria-invalid": !!err,
      "aria-describedby": err ? `err-${f.key}` : undefined,
      "data-testid": `input-${f.key}`,
      className: `w-full rounded-xl border bg-card px-4 text-[15px] text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:ring-4 ${
        err ? "border-destructive focus:ring-destructive/15" : "border-border focus:border-primary focus:ring-primary/15"
      }`,
    };
    return (
      <div key={f.key}>
        <label htmlFor={`field-${f.key}`} className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-semibold text-foreground">
          <span>
            {t(`${f.i18n}.label`)}
            {f.required ? <span className="text-destructive"> *</span> : <span className="font-normal text-muted-foreground"> ({t("form.optional")})</span>}
          </span>
          {f.type === "textarea" && (
            <span className="text-xs font-normal tabular-nums text-muted-foreground" dir="ltr">
              {(data[f.key] ?? "").length}/{f.max}
            </span>
          )}
        </label>
        {f.type === "textarea" ? (
          <>
            <textarea
              {...common}
              rows={4}
              maxLength={f.max}
              onChange={(e) => {
                setMessageEdited(true);
                set(f.key, e.target.value);
              }}
              className={`${common.className} min-h-[112px] resize-y py-3 leading-relaxed`}
            />
            {messageEdited && (
              <button
                type="button"
                onClick={() => {
                  setMessageEdited(false);
                  set("message", occ(o, "message"));
                }}
                data-testid="button-reset-message"
                className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <RotateCcw className="h-3.5 w-3.5" /> {t("form.resetMessage")}
              </button>
            )}
          </>
        ) : (
          <input
            {...common}
            type={f.type === "tel" ? "tel" : "text"}
            inputMode={f.type === "tel" ? "tel" : undefined}
            maxLength={(f.max ?? 60) + 10}
            autoComplete={f.key === "senderName" ? "name" : f.key === "company" ? "organization" : f.key === "phone" ? "tel" : "off"}
            onChange={(e) => set(f.key, e.target.value)}
            className={`${common.className} h-12`}
          />
        )}
        {err && (
          <p id={`err-${f.key}`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-destructive" data-testid={`error-${f.key}`}>
            <AlertCircle className="h-4 w-4 shrink-0" /> {err}
          </p>
        )}
      </div>
    );
  };

  const section = (title: string, children: React.ReactNode) => (
    <section className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
      <h2 className="mb-4 text-[15px] font-bold text-foreground">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );

  const designPicker = (
    <section className="min-w-0 rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
      <h2 className="mb-3 text-[15px] font-bold text-foreground">{t("form.templateSection")}</h2>
      <div className="-mx-1 flex snap-x gap-2.5 overflow-x-auto px-1 pb-1" role="radiogroup" aria-label={t("form.templateSection")}>
        {templates.map((tp) => (
          <button
            key={tp.id}
            type="button"
            role="radio"
            aria-checked={tplId === tp.id}
            onClick={() => setTplId(tp.id)}
            data-testid={`button-template-${tp.id}`}
            className={`relative w-[31%] min-w-[96px] shrink-0 snap-start overflow-hidden rounded-xl border-2 text-start transition ${tplId === tp.id ? "border-primary ring-4 ring-primary/15" : "border-border/60 hover:border-border"}`}
          >
            <TemplateThumb input={renderInput(tp, "square")} ready={ready} deps={[data, lang.code]} />
            <span className="block truncate bg-card px-2 py-1.5 text-[12px] font-semibold text-foreground">{t(tp.label)}</span>
            {tplId === tp.id && (
              <span className="absolute end-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="mb-1.5 mt-4 text-sm font-semibold text-foreground">{t("form.sizeLabel")}</p>
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1" role="radiogroup" aria-label={t("form.sizeLabel")}>
        {(["square", "story"] as Format[]).map((f) => (
          <button
            key={f}
            type="button"
            role="radio"
            aria-checked={format === f}
            onClick={() => setFormat(f)}
            data-testid={`button-format-${f}`}
            className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${format === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {f === "square" ? <Square className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
            {t(`format.${f}`)}
          </button>
        ))}
      </div>
    </section>
  );

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-4 sm:px-6 sm:pt-6">
        <Link href={`/${lang.code}`} data-testid="link-back" className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("form.back")}
        </Link>
        <h1 className="mt-1 font-display text-2xl font-bold leading-tight text-foreground sm:text-[1.75rem]" data-testid="text-occasion-title">
          {occ(o, "name")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("form.subtitle")}</p>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start lg:gap-8">
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              generate();
            }}
            className="min-w-0 space-y-4"
          >
            {showSummary && errCount > 0 && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm font-medium text-destructive" data-testid="status-form-errors">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {errors._ || t("err.fix")}
              </div>
            )}
            {recipientFields.length > 0 && section(t("form.aboutRecipient"), recipientFields.map(renderField))}
            {section(t("form.aboutSender"), [
              ...senderFields.map(renderField),
              <label key="remember" className="flex cursor-pointer items-start gap-3 rounded-xl bg-secondary/70 p-3">
                <input
                  type="checkbox"
                  checked={store.remember}
                  onChange={(e) => store.setRemember(e.target.checked)}
                  data-testid="checkbox-remember"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[hsl(var(--primary))]"
                />
                <span>
                  <span className="block text-sm font-semibold text-foreground">{t("form.remember")}</span>
                  <span className="block text-xs text-muted-foreground">{t("form.rememberHint")}</span>
                </span>
              </label>,
            ])}
            {messageField && section(t("form.messageSection"), renderField(messageField))}
            <div className="lg:hidden">{designPicker}</div>

            {/* Mobile preview */}
            <section className="lg:hidden">
              <h2 className="mb-2 text-[15px] font-bold text-foreground">{t("form.preview")}</h2>
              <PreviewFrame format={format}>
                <canvas ref={previewRef} className="h-full w-full" data-testid="canvas-preview" />
              </PreviewFrame>
            </section>

            <div className="sticky bottom-0 z-20 -mx-4 border-t border-border/70 bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0">
              <button
                type="submit"
                disabled={busy}
                data-testid="button-generate"
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 active:scale-[0.99] disabled:opacity-70"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> {t("form.generating")}
                  </>
                ) : (
                  <>
                    {t("form.generate")} <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Desktop preview column */}
          <aside className="hidden min-w-0 space-y-4 lg:sticky lg:top-24 lg:block">
            <DesktopPreview format={format} renderInput={() => renderInput()} ready={ready} deps={[data, tplId, format, lang.code]} label={t("form.preview")} />
            {designPicker}
          </aside>
        </div>
      </div>
    </Shell>
  );
}

function PreviewFrame({ format, children }: { format: Format; children: React.ReactNode }) {
  return (
    <div className={`mx-auto overflow-hidden rounded-2xl border border-border/70 bg-secondary shadow-[0_12px_40px_-12px_rgba(20,60,45,0.25)] ${format === "square" ? "aspect-square w-full max-w-[440px]" : "aspect-[9/16] w-[72%] max-w-[300px]"}`}>
      {children}
    </div>
  );
}

function DesktopPreview({
  format,
  renderInput,
  ready,
  deps,
  label,
}: {
  format: Format;
  renderInput: () => RenderInput | null;
  ready: boolean;
  deps: unknown[];
  label: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const input = renderInput();
    if (!input || !ready) return;
    const h = setTimeout(() => {
      if (ref.current) renderGreeting(ref.current, input, 0.5).catch(() => {});
    }, 180);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, ready]);
  return (
    <div>
      <h2 className="mb-2 text-[15px] font-bold text-foreground">{label}</h2>
      <PreviewFrame format={format}>
        <canvas ref={ref} className="h-full w-full" data-testid="canvas-preview-desktop" />
      </PreviewFrame>
    </div>
  );
}

/** Small live thumbnail of a template using the user's own details */
function TemplateThumb({ input, ready, deps }: { input: RenderInput | null; ready: boolean; deps: unknown[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!input || !ready) return;
    const h = setTimeout(() => {
      if (ref.current) renderGreeting(ref.current, input, 0.22).catch(() => {});
    }, 450);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, ready]);
  return <canvas ref={ref} className="block aspect-square w-full bg-secondary" />;
}
