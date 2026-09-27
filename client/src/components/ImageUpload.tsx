import { useRef, useState } from "react";
import { ImagePlus, RefreshCw, Trash2, UserRound } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

/** Downscale uploads so the canvas stays light on phones */
function toDataUrl(file: File, maxDim = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        const r = Math.min(1, maxDim / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * r);
        c.height = Math.round(img.height * r);
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL(file.type === "image/jpeg" ? "image/jpeg" : "image/png", 0.92));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({
  id,
  label,
  value,
  onChange,
  shape,
}: {
  id: string;
  label: string;
  value?: string;
  onChange: (v: string | undefined) => void;
  shape: "round" | "logo";
}) {
  const { t } = useI18n();
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const pick = async (f?: File) => {
    if (!f) return;
    setErr("");
    if (!TYPES.includes(f.type)) return setErr(t("err.fileType"));
    setBusy(true);
    try {
      onChange(await toDataUrl(f, shape === "logo" ? 800 : 1200));
    } catch {
      setErr(t("err.generic"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-foreground">
        {label} <span className="font-normal text-muted-foreground">({t("form.optional")})</span>
      </p>
      <input
        ref={ref}
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        data-testid={`input-file-${id}`}
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {value ? (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5">
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-secondary ${shape === "round" ? "rounded-full" : "rounded-xl"}`}>
            <img src={value} alt="" className={shape === "round" ? "h-full w-full object-cover" : "max-h-full max-w-full object-contain p-1"} />
          </div>
          <div className="flex flex-1 flex-wrap gap-2">
            <button type="button" onClick={() => ref.current?.click()} data-testid={`button-change-${id}`} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium hover:bg-secondary">
              <RefreshCw className="h-4 w-4" /> {t("upload.change")}
            </button>
            <button type="button" onClick={() => onChange(undefined)} data-testid={`button-remove-${id}`} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" /> {t("upload.remove")}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          data-testid={`button-upload-${id}`}
          className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-primary/25 bg-primary/[0.03] p-4 text-start transition hover:border-primary/50 hover:bg-primary/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            {shape === "round" ? <UserRound className="h-5 w-5" /> : <ImagePlus className="h-5 w-5" />}
          </span>
          <span>
            <span className="block text-sm font-semibold text-foreground">{t("upload.tap")}</span>
            <span className="block text-xs text-muted-foreground">{t("upload.hint")}</span>
          </span>
        </button>
      )}
      {err && (
        <p role="alert" className="mt-1.5 text-sm font-medium text-destructive" data-testid={`error-${id}`}>
          {err}
        </p>
      )}
    </div>
  );
}
