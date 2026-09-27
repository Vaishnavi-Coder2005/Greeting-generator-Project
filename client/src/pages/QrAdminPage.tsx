import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode, BarChart3, ExternalLink } from "lucide-react";
import { API_BASE } from "@/lib/queryClient";

/**
 * QR ADMIN (open  /#/qr )
 * Generates the print-ready QR code for the desk item.
 * The QR encodes  <your-domain>/go  — a server redirect whose destination
 * is set by QR_TARGET in .env, so the printed code never has to change.
 */
interface Stats {
  scans: number;
  greetings: number;
  byOccasion: Record<string, number>;
  byLanguage: Record<string, number>;
  since: string;
  qrTarget: string;
  publicUrl: string;
}

export default function QrAdminPage() {
  const origin = window.location.origin + window.location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "");
  const [url, setUrl] = useState(`${origin}/go`);
  const [stats, setStats] = useState<Stats | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/stats`)
      .then((r) => r.json())
      .then((s: Stats) => {
        setStats(s);
        if (s.publicUrl) setUrl(`${s.publicUrl.replace(/\/$/, "")}/go`);
      })
      .catch(() => {});
  }, []);

  const draw = async (canvas: HTMLCanvasElement, size: number) => {
    await QRCode.toCanvas(canvas, url, { width: size, margin: 2, errorCorrectionLevel: "H", color: { dark: "#0F3D2E", light: "#FFFFFF" } });
  };

  useEffect(() => {
    if (canvasRef.current && url) draw(canvasRef.current, 320).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const downloadPng = async () => {
    const c = document.createElement("canvas");
    await draw(c, 2048);
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = "greeting-qr.png";
    a.click();
  };

  const downloadSvg = async () => {
    const svg = await QRCode.toString(url, { type: "svg", margin: 2, errorCorrectionLevel: "H", color: { dark: "#0F3D2E", light: "#FFFFFF" } });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    a.download = "greeting-qr.svg";
    a.click();
  };

  const top = (m: Record<string, number>) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="min-h-[100dvh] bg-background paper-grain">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="mt-8 flex items-center gap-2 text-2xl font-bold text-foreground">
          <QrCode className="h-6 w-6 text-primary" /> QR code for the desk item
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Print this QR once. It opens <code className="rounded bg-secondary px-1">/go</code>, which redirects to the greeting generator. To change the destination later, edit
          <code className="mx-1 rounded bg-secondary px-1">QR_TARGET</code> in <code className="rounded bg-secondary px-1">.env</code> — no reprinting needed.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-[340px_1fr]">
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <canvas ref={canvasRef} className="mx-auto h-auto w-full max-w-[320px]" data-testid="canvas-qr" />
            <p className="mt-2 text-sm font-semibold text-foreground">Scan to create your greeting</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={downloadPng} data-testid="button-qr-png" className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                <Download className="h-4 w-4" /> PNG (print)
              </button>
              <button onClick={downloadSvg} data-testid="button-qr-svg" className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-border bg-card text-sm font-semibold text-foreground">
                <Download className="h-4 w-4" /> SVG (vector)
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block rounded-2xl border border-border bg-card p-4">
              <span className="text-sm font-semibold text-foreground">URL encoded in the QR</span>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                data-testid="input-qr-url"
                className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
              <span className="mt-2 block text-xs text-muted-foreground">
                Use your live domain, e.g. https://greetings.yourcompany.in/go. Set PUBLIC_URL in .env to pre-fill this. Current redirect target:{" "}
                <b>{stats?.qrTarget ?? "/#/"}</b>
              </span>
              <a href={url} target="_blank" rel="noopener" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Test the link <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </label>

            <div className="rounded-2xl border border-border bg-card p-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <BarChart3 className="h-4 w-4 text-primary" /> Usage since server start
              </h2>
              {stats ? (
                <>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-secondary p-3">
                      <div className="text-2xl font-bold tabular-nums text-foreground">{stats.scans}</div>
                      <div className="text-xs text-muted-foreground">QR scans (/go)</div>
                    </div>
                    <div className="rounded-xl bg-secondary p-3">
                      <div className="text-2xl font-bold tabular-nums text-foreground">{stats.greetings}</div>
                      <div className="text-xs text-muted-foreground">Greetings generated</div>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
                    <div>
                      <div className="mb-1 text-xs font-semibold text-muted-foreground">Top occasions</div>
                      {top(stats.byOccasion).map(([k, v]) => (
                        <div key={k} className="flex justify-between border-b border-border/50 py-1"><span>{k}</span><span className="tabular-nums">{v}</span></div>
                      ))}
                      {!Object.keys(stats.byOccasion).length && <div className="text-muted-foreground">—</div>}
                    </div>
                    <div>
                      <div className="mb-1 text-xs font-semibold text-muted-foreground">Top languages</div>
                      {top(stats.byLanguage).map(([k, v]) => (
                        <div key={k} className="flex justify-between border-b border-border/50 py-1"><span>{k}</span><span className="tabular-nums">{v}</span></div>
                      ))}
                      {!Object.keys(stats.byLanguage).length && <div className="text-muted-foreground">—</div>}
                    </div>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Stats are available when the Node server is running.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
