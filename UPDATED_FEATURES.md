#  Greetings — Indian Catalogue Update

Updated:
- Complete language selector catalogue: 87 unique entries (22 Scheduled languages + requested regional/local/tribal languages).
- Searchable language selector continues to use the existing mobile-first UI.
- Expanded occasion catalogue to 175 unique entries.
- Added religious categories: Hindu, Islamic, Christian, Sikh, Buddhist, Jain, Parsi/Zoroastrian.
- Added Harvest/Agricultural and Important Days categories.
- Added aliases/alternative names so duplicate festival names resolve to one canonical occasion.
- Added dates for fixed-date important days and major national/state days.
- Occasion search now searches alternative names and dates.
- Added `INDIAN_CATALOGUE.md` explaining the data structure and how to extend it.
- Existing greeting renderer, templates, uploads, download and sharing flows are preserved.

Important:
- The language registry is complete as requested, but existing locale JSON files do not contain full translations for every newly added regional/tribal language. Those languages use the application's existing English fallback until a locale file is added.
- Festival cards use the existing renderer/themes; adding a catalogue entry does not require a new component.
