import { Switch, Route, Router, Redirect, useParams, useLocation } from "wouter";
import { useEffect } from "react";
import { save } from "@/lib/persist";
import QrAdminPage from "@/pages/QrAdminPage";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { StoreProvider } from "@/lib/store";
import { LANGUAGE_MAP } from "@/i18n/languages";
import LanguagePage from "@/pages/LanguagePage";
import HomePage from "@/pages/HomePage";
import CreatePage from "@/pages/CreatePage";
import ResultPage from "@/pages/ResultPage";

function WithLang({ children }: { children: React.ReactNode }) {
  const { lang } = useParams<{ lang: string }>();
  useEffect(() => {
    if (LANGUAGE_MAP[lang]) save("lang", lang);
  }, [lang]);
  if (!LANGUAGE_MAP[lang]) return <Redirect to="/" />;
  return <I18nProvider code={lang}>{children}</I18nProvider>;
}

function ScrollToTop() {
  const [loc] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loc]);
  return null;
}

function AppRouter() {
  return (
    <>
    <ScrollToTop />
    <Switch>
      <Route path="/" component={LanguagePage} />
      <Route path="/choose/:cur" component={LanguagePage} />
      <Route path="/qr" component={QrAdminPage} />
      <Route path="/:lang/create/:id/done">
        <WithLang>
          <ResultPage />
        </WithLang>
      </Route>
      <Route path="/:lang/create/:id">
        <WithLang>
          <CreatePage />
        </WithLang>
      </Route>
      <Route path="/:lang">
        <WithLang>
          <HomePage />
        </WithLang>
      </Route>
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StoreProvider>
          <Toaster />
          <Router hook={useHashLocation}>
            <AppRouter />
          </Router>
        </StoreProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
