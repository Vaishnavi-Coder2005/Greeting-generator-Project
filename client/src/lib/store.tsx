import { createContext, useContext, useState, type ReactNode } from "react";
import type { GreetingData } from "@/data/fields";
import type { Format } from "@/lib/render";
import { load, save } from "@/lib/persist";

export interface Draft {
  data: GreetingData;
  template?: string;
  format: Format;
  messageEdited?: boolean;
}

interface Store {
  /** Sender details persist across occasions within a visit (name/company/logo/phone) */
  sender: GreetingData;
  setSender: (d: GreetingData) => void;
  /** Remember sender details on this device (localStorage) */
  remember: boolean;
  setRemember: (v: boolean) => void;
  persist: (d: GreetingData) => void;
  drafts: Record<string, Draft>;
  setDraft: (occasionId: string, d: Draft) => void;
  result: { occasionId: string; dataUrl: string; format: Format } | null;
  setResult: (r: Store["result"]) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [remember, setRememberState] = useState<boolean>(() => load("remember", true));
  const [sender, setSender] = useState<GreetingData>(() => (load("remember", true) ? load<GreetingData>("sender", {}) : {}));
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [result, setResult] = useState<Store["result"]>(null);
  return (
    <Ctx.Provider
      value={{
        sender,
        setSender,
        remember,
        setRemember: (v) => {
          setRememberState(v);
          save("remember", v);
          if (!v) save("sender", null);
        },
        persist: (d) => {
          if (!remember) return;
          const keep: GreetingData = {};
          (["senderName", "company", "phone", "logo", "senderPhoto"] as const).forEach((k) => d[k] && (keep[k] = d[k]));
          save("sender", keep);
        },
        drafts,
        setDraft: (id, d) => setDrafts((p) => ({ ...p, [id]: d })),
        result,
        setResult,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("no store");
  return c;
}
