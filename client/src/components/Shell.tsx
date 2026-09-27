import type { ReactNode } from "react";
import { Link } from "wouter";
import { Globe, ChevronDown, Repeat } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Header() {
  const { lang, t } = useI18n();
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link href={`/${lang.code}`} data-testid="link-home" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        </Link>
        <Link
          href={`/choose/${lang.code}`}
          data-testid="button-change-language"
          aria-label={t("lang.change")}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Globe className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>{lang.native}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-border/70 bg-card/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-start">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Repeat className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          {t("footer.repeat")}
        </p>
      </div>
    </footer>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
