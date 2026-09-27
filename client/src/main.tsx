import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if (!window.location.hash) {
  window.location.hash = "#/";
}

createRoot(document.getElementById("root")!).render(<App />);

// Progressive Web App: cache the app for fast repeat visits (production only)
if (import.meta.env.PROD && window.self === window.top) {
  window.addEventListener("load", () => {
    try {
      // throws in sandboxed contexts — the app works fine without it
      navigator.serviceWorker?.register("./sw.js").catch(() => {});
    } catch {
      /* ignore */
    }
  });
}
