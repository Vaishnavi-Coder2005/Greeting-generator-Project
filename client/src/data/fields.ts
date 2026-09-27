import type { FieldSet } from "./occasions";

export type FieldKey =
  | "recipient"
  | "years"
  | "photo"
  | "senderPhoto"
  | "senderName"
  | "company"
  | "phone"
  | "logo"
  | "message";

export interface FieldDef {
  key: FieldKey;
  type: "text" | "tel" | "textarea" | "image";
  /** i18n key prefix, e.g. "f.birthdayName" → .label / .ph */
  i18n: string;
  required?: boolean;
  max?: number;
  group: "recipient" | "sender" | "message";
  /** photo drawn as round portrait vs logo drawn as-is */
  shape?: "round" | "logo";
}

const sender: FieldDef[] = [
  { key: "senderName", type: "text", i18n: "f.senderName", required: true, max: 40, group: "sender" },
  { key: "company", type: "text", i18n: "f.company", max: 50, group: "sender" },
  { key: "phone", type: "tel", i18n: "f.phone", max: 20, group: "sender" },
  { key: "logo", type: "image", i18n: "f.logo", group: "sender", shape: "logo" },
];
/** Optional sender photograph (for occasions where the main photo is the recipient) */
const senderPhoto: FieldDef = { key: "senderPhoto", type: "image", i18n: "f.senderPhoto", group: "sender", shape: "round" };
const message: FieldDef = { key: "message", type: "textarea", i18n: "f.message", max: 200, group: "message" };

/**
 * Field configuration per occasion type. Add a new FieldSet here to
 * create a new kind of form — the UI and renderer adapt automatically.
 */
export const FIELD_SETS: Record<FieldSet, FieldDef[]> = {
  festival: [
    ...sender,
    senderPhoto,
    message,
  ],
  birthday: [
    { key: "recipient", type: "text", i18n: "f.birthdayName", required: true, max: 40, group: "recipient" },
    { key: "photo", type: "image", i18n: "f.personPhoto", group: "recipient", shape: "round" },
    ...sender,
    senderPhoto,
    message,
  ],
  anniversary: [
    { key: "recipient", type: "text", i18n: "f.coupleNames", required: true, max: 50, group: "recipient" },
    { key: "years", type: "text", i18n: "f.years", max: 12, group: "recipient" },
    { key: "photo", type: "image", i18n: "f.couplePhoto", group: "recipient", shape: "round" },
    ...sender,
    senderPhoto,
    message,
  ],
  wedding: [
    { key: "recipient", type: "text", i18n: "f.coupleNames", required: true, max: 50, group: "recipient" },
    { key: "photo", type: "image", i18n: "f.couplePhoto", group: "recipient", shape: "round" },
    ...sender,
    senderPhoto,
    message,
  ],
  business: [
    { key: "recipient", type: "text", i18n: "f.recipientBusiness", required: true, max: 50, group: "recipient" },
    { key: "years", type: "text", i18n: "f.years", max: 12, group: "recipient" },
    { key: "photo", type: "image", i18n: "f.recipientPhoto", group: "recipient", shape: "round" },
    ...sender,
    senderPhoto,
    message,
  ],
  personal: [
    { key: "recipient", type: "text", i18n: "f.recipientName", required: true, max: 40, group: "recipient" },
    { key: "photo", type: "image", i18n: "f.personPhoto", group: "recipient", shape: "round" },
    ...sender,
    senderPhoto,
    message,
  ],
  work: [
    { key: "recipient", type: "text", i18n: "f.recipientName", required: true, max: 40, group: "recipient" },
    { key: "years", type: "text", i18n: "f.workYears", max: 12, group: "recipient" },
    { key: "photo", type: "image", i18n: "f.personPhoto", group: "recipient", shape: "round" },
    ...sender,
    senderPhoto,
    message,
  ],
  general: [
    { key: "recipient", type: "text", i18n: "f.recipientOptional", max: 40, group: "recipient" },
    { key: "photo", type: "image", i18n: "f.recipientPhoto", group: "recipient", shape: "round" },
    ...sender,
    senderPhoto,
    message,
  ],
};

export type GreetingData = Partial<Record<FieldKey, string>>;
