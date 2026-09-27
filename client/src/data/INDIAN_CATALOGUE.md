# Indian Languages, Festivals & Important Days Catalogue

The QR Greeting Generator keeps the catalogue data in two source files:

- `client/src/i18n/languages.ts` — 22 Scheduled languages + the supplied regional/local/tribal language list.
- `client/src/data/occasions.ts` — personal occasions, festivals, religious categories, harvest festivals, national days and important days.

## Occasion fields

Each occasion can contain:

- `id`: unique stable identifier used by routes and generated cards.
- `name`: one clean display name.
- `alternativeNames`: aliases such as `Bakrid`, `Eid al-Adha`, `Deepavali`, etc.
- `category`: `occasion`, `festival`, `national`, `important`, `hindu`, `islamic`, `christian`, `sikh`, `buddhist`, `jain`, `parsi`, `harvest`, or `regional`.
- `fieldSet`: controls the form fields.
- `theme`: controls the existing card artwork.
- `months`: approximate Gregorian months used by the Coming Up section.
- `regions`: search/filter metadata.
- `keywords`: extra search terms.
- `date`: fixed/known Gregorian date when applicable.
- `supportedLanguages`: optional future targeting list for language-specific templates.

## Adding a new language

Add one object to `LANGUAGES` in `languages.ts`.

For a new translated UI, also add a locale JSON file under `client/src/i18n/locales/` and register/use its code through the existing i18n system. If a locale is not translated yet, the app falls back to English rather than breaking.

## Adding a festival or important day

Add one object to `OCCASIONS` in `occasions.ts`. Give it a unique `id`. Put aliases in `alternativeNames` instead of creating duplicate UI entries.

Example:

```ts
{
  id: "example-festival",
  name: "Example Festival",
  alternativeNames: ["Example Parva"],
  headline: "Happy Example Festival",
  message: "Wishing you happiness and prosperity.",
  category: "regional",
  fieldSet: "festival",
  theme: "floral",
  months: [8],
  regions: ["Maharashtra"],
  keywords: ["example", "example parva"],
  date: "15 August",
}
```

Search, filters, the Coming Up list, creation routes and the existing greeting renderer automatically consume the catalogue.
