import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, Download, Share2, PencilLine, RefreshCcw, Loader2, Info, Repeat, Mail, Link2 } from "lucide-react";
import { SiWhatsapp, SiFacebook } from "react-icons/si";
import { OCCASION_MAP } from "@/data/occasions";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { apiRequest, API_BASE } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Shell } from "@/components/Shell";

function dataUrlToBlob(dataUrl: string) {
  const [head, b64] = dataUrl.split(",");
  const mime = head.match(/data:(.*?);/)?.[1] ?? "image/png";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

const inIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const o = OCCASION_MAP[id];
  const { t, occ, lang } = useI18n();
  const { result } = useStore();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [busy, setBusy] = useState<"" | "dl" | "wa" | "share" | "fb" | "mail" | "link">("");
  const [uploadedId, setUploadedId] = useState<string | null>(null);

  useEffect(() => {
    if (!result || result.occasionId !== id) navigate(`/${lang.code}/create/${id}`, { replace: true });
  }, [result, id, lang.code, navigate]);

  if (!o || !result || result.occasionId !== id) return null;

  const filename = `${o.id}-greeting.png`;
  const file = () => new File([dataUrlToBlob(result.dataUrl)], filename, { type: "image/png" });

  const upload = async () => {
    if (uploadedId) return uploadedId;
    const res = await apiRequest("POST", "/api/greetings", { dataUrl: result.dataUrl, filename });
    const { id: gid } = (await res.json()) as { id: string };
    setUploadedId(gid);
    return gid;
  };

  const download = async () => {
    setBusy("dl");
    try {
      if (!inIframe) {
        const url = URL.createObjectURL(dataUrlToBlob(result.dataUrl));
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      } else {
        const gid = await upload();
        window.open(`${API_BASE}/api/greetings/${gid}/download`, "_blank", "noopener");
      }
      toast({ description: t("result.downloaded") });
    } catch {
      toast({ description: t("err.generic"), variant: "destructive" });
    } finally {
      setBusy("");
    }
  };

  const shareText = occ(o, "headline");

  const nativeShare = async () => {
    const f = file();
    if (navigator.canShare && navigator.canShare({ files: [f] })) {
      await navigator.share({ files: [f], text: shareText });
      return true;
    }
    return false;
  };

  const shareWhatsApp = async () => {
    setBusy("wa");
    try {
      if (await nativeShare()) {
        toast({ description: t("result.whatsappHint") });
      } else {
        await download();
        toast({ description: t("result.shareUnsupported") });
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank", "noopener");
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") toast({ description: t("err.generic"), variant: "destructive" });
    } finally {
      setBusy("");
    }
  };

  const shareMore = async () => {
    setBusy("share");
    try {
      if (!(await nativeShare())) {
        await download();
        toast({ description: t("result.shareUnsupported") });
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") toast({ description: t("err.generic"), variant: "destructive" });
    } finally {
      setBusy("");
    }
  };

  /** Public link to the hosted image (kept on the server for 24 hours) */
  const publicLink = async () => {
    const gid = await upload();
    return new URL(`${API_BASE}/api/greetings/${gid}.png`, window.location.href).href;
  };

  const viaLink = (kind: "fb" | "mail" | "link") => async () => {
    setBusy(kind);
    try {
      const link = await publicLink();
      if (kind === "fb") window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, "_blank", "noopener");
      if (kind === "mail") window.location.href = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`${shareText}\n\n${link}`)}`;
      if (kind === "link") {
        await navigator.clipboard.writeText(link);
        toast({ description: t("result.linkCopied") });
      }
    } catch {
      toast({ description: t("err.generic"), variant: "destructive" });
    } finally {
      setBusy("");
    }
  };

  const small = "inline-flex min-h-[46px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-2 text-sm font-semibold text-foreground transition hover:bg-secondary disabled:opacity-70";

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 pb-6 pt-4 sm:px-6 sm:pt-6">
        <Link href={`/${lang.code}/create/${o.id}`} data-testid="link-back-edit" className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("form.back")}
        </Link>

        <div className="mt-2 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,380px)] md:items-center md:gap-10">
          <div className="animate-rise">
            <div className={`mx-auto overflow-hidden rounded-2xl border border-border/70 shadow-[0_24px_60px_-20px_rgba(20,60,45,0.35)] ${result.format === "square" ? "max-w-[520px]" : "max-w-[340px]"}`}>
              <img src={result.dataUrl} alt={occ(o, "headline")} className="block h-auto w-full" data-testid="img-result" />
            </div>
            <p className="mx-auto mt-3 flex max-w-[520px] items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {t("result.saveHint")}
            </p>
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold leading-tight text-foreground sm:text-[1.75rem]" data-testid="text-result-title">
              {t("result.title")}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t("result.subtitle")}</p>

            <div className="mt-5 space-y-2.5">
              <button onClick={download} disabled={!!busy} data-testid="button-download" className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 disabled:opacity-70">
                {busy === "dl" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />} {t("result.download")}
              </button>
              <button onClick={shareWhatsApp} disabled={!!busy} data-testid="button-share-whatsapp" className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1DA851] bg-card px-5 text-base font-semibold text-[#128C3E] transition hover:bg-[#25D366]/10 disabled:opacity-70">
                {busy === "wa" ? <Loader2 className="h-5 w-5 animate-spin" /> : <SiWhatsapp className="h-5 w-5" />} {t("result.whatsapp")}
              </button>
              <button onClick={shareMore} disabled={!!busy} data-testid="button-share-more" className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-[15px] font-semibold text-foreground transition hover:bg-secondary disabled:opacity-70">
                {busy === "share" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Share2 className="h-5 w-5" />} {t("result.share")}
              </button>
              <div className="flex gap-2">
                <button onClick={viaLink("fb")} disabled={!!busy} data-testid="button-share-facebook" className={small}>
                  {busy === "fb" ? <Loader2 className="h-4 w-4 animate-spin" /> : <SiFacebook className="h-4 w-4 text-[#1877F2]" />} {t("result.facebook")}
                </button>
                <button onClick={viaLink("mail")} disabled={!!busy} data-testid="button-share-email" className={small}>
                  {busy === "mail" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} {t("result.email")}
                </button>
                <button onClick={viaLink("link")} disabled={!!busy} data-testid="button-copy-link" className={small}>
                  {busy === "link" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />} {t("result.copyLink")}
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border/70 pt-4 md:justify-start">
              <Link href={`/${lang.code}/create/${o.id}`} data-testid="link-edit" className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                <PencilLine className="h-4 w-4" /> {t("result.edit")}
              </Link>
              <Link href={`/${lang.code}`} data-testid="link-create-another" className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                <RefreshCcw className="h-4 w-4" /> {t("result.another")}
              </Link>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[hsl(40_60%_93%)] p-4">
              <Repeat className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-foreground/80">{t("result.comeBack")}</p>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
