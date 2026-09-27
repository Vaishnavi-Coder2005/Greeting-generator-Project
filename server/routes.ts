import type { Express } from "express";
import type { Server } from "node:http";
import { randomUUID } from "node:crypto";

// Generated greetings are kept in memory (short-lived) so the browser can
// download them via a normal HTTP response and share a link on WhatsApp.
const store = new Map<string, { buf: Buffer; name: string; at: number }>();
const MAX_ITEMS = 300;
const TTL = 1000 * 60 * 60 * 24; // 24h

function prune() {
  const now = Date.now();
  store.forEach((v, k) => {
    if (now - v.at > TTL) store.delete(k);
  });
  while (store.size > MAX_ITEMS) {
    const first = store.keys().next().value;
    if (!first) break;
    store.delete(first);
  }
}

// Simple in-memory counters (reset on restart). Swap for a database or an
// analytics tool (e.g. Google Analytics / Plausible) in production.
const stats = {
  scans: 0,
  greetings: 0,
  byOccasion: {} as Record<string, number>,
  byLanguage: {} as Record<string, number>,
  since: new Date().toISOString(),
};

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  /**
   * DYNAMIC QR ENDPOINT
   * Print the QR code with the URL  https://<your-domain>/go
   * The destination is configured with the QR_TARGET environment variable,
   * so you can change where the printed QR points without reprinting it.
   */
  app.get("/go", (req, res) => {
    stats.scans++;
    const target = process.env.QR_TARGET || "/";
    const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    res.redirect(302, target + (target.includes("?") || target.includes("#") ? "" : qs));
  });

  // Anonymous usage event sent by the browser each time a greeting is generated
  app.post("/api/track", (req, res) => {
    const { occasion, language } = req.body ?? {};
    stats.greetings++;
    if (typeof occasion === "string") stats.byOccasion[occasion.slice(0, 60)] = (stats.byOccasion[occasion.slice(0, 60)] ?? 0) + 1;
    if (typeof language === "string") stats.byLanguage[language.slice(0, 10)] = (stats.byLanguage[language.slice(0, 10)] ?? 0) + 1;
    res.json({ ok: true });
  });

  app.get("/api/stats", (_req, res) => {
    res.json({ ...stats, qrTarget: process.env.QR_TARGET || "/", publicUrl: process.env.PUBLIC_URL || "" });
  });

  app.post("/api/greetings", (req, res) => {
    const { dataUrl, filename } = req.body ?? {};
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/png;base64,")) {
      return res.status(400).json({ error: "invalid image" });
    }
    const buf = Buffer.from(dataUrl.slice("data:image/png;base64,".length), "base64");
    if (buf.length > 15 * 1024 * 1024) return res.status(413).json({ error: "too large" });
    const safe = String(filename || "greeting.png").replace(/[^\w.\-]+/g, "-").slice(0, 80) || "greeting.png";
    const id = randomUUID();
    store.set(id, { buf, name: safe.endsWith(".png") ? safe : `${safe}.png`, at: Date.now() });
    prune();
    res.json({ id });
  });

  app.get("/api/greetings/:id/download", (req, res) => {
    const item = store.get(req.params.id);
    if (!item) return res.status(404).send("Not found");
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename="${item.name}"`);
    res.send(item.buf);
  });

  app.get("/api/greetings/:id.png", (req, res) => {
    const item = store.get(req.params.id);
    if (!item) return res.status(404).send("Not found");
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(item.buf);
  });

  return httpServer;
}
