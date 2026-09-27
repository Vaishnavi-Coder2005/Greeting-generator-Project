/**
 * COMPLETE INDIAN LANGUAGE REGISTRY
 * Includes the 22 languages in the Eighth Schedule plus the regional/local/tribal
 * languages supplied for the QR Greeting Generator.
 *
 * `code` is an internal stable id. `native` is the display name and `regions`
 * is searchable metadata. Missing UI/greeting translations safely fall back to
 * English until a locale file is added.
 */
export type Script =
  | "latin"
  | "devanagari"
  | "bengali"
  | "gujarati"
  | "gurmukhi"
  | "oriya"
  | "tamil"
  | "telugu"
  | "kannada"
  | "malayalam"
  | "arabic"
  | "nastaliq"
  | "olchiki";

export interface Language {
  code: string;
  name: string;
  native: string;
  script: Script;
  regions: string;
  rtl?: boolean;
  popular?: boolean;
}

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", native: "English", script: "latin", regions: "All India", popular: true },
  { code: "as", name: "Assamese", native: "অসমীয়া", script: "bengali", regions: "Assam" },
  { code: "bn", name: "Bengali", native: "বাংলা", script: "bengali", regions: "West Bengal, Tripura, Assam", popular: true },
  { code: "brx", name: "Bodo", native: "बड़ो", script: "devanagari", regions: "Assam" },
  { code: "doi", name: "Dogri", native: "डोगरी", script: "devanagari", regions: "Jammu & Kashmir, Himachal Pradesh" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", script: "gujarati", regions: "Gujarat", popular: true },
  { code: "hi", name: "Hindi", native: "हिन्दी", script: "devanagari", regions: "All India; North, Central and West India", popular: true },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", script: "kannada", regions: "Karnataka", popular: true },
  { code: "ks", name: "Kashmiri", native: "كٲشُر", script: "arabic", regions: "Jammu & Kashmir", rtl: true },
  { code: "kok", name: "Konkani", native: "कोंकणी", script: "devanagari", regions: "Goa, Maharashtra, Karnataka, Kerala" },
  { code: "mai", name: "Maithili", native: "मैथिली", script: "devanagari", regions: "Bihar, Jharkhand" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", script: "malayalam", regions: "Kerala, Lakshadweep", popular: true },
  { code: "mni", name: "Manipuri / Meitei", native: "মৈতৈলোন্", script: "bengali", regions: "Manipur" },
  { code: "mr", name: "Marathi", native: "मराठी", script: "devanagari", regions: "Maharashtra, Goa", popular: true },
  { code: "ne", name: "Nepali", native: "नेपाली", script: "devanagari", regions: "Sikkim, Darjeeling, North Bengal" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ", script: "oriya", regions: "Odisha" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", script: "gurmukhi", regions: "Punjab, Chandigarh", popular: true },
  { code: "sa", name: "Sanskrit", native: "संस्कृतम्", script: "devanagari", regions: "All India" },
  { code: "sat", name: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ", script: "olchiki", regions: "Jharkhand, Odisha, West Bengal" },
  { code: "sd", name: "Sindhi", native: "سنڌي", script: "arabic", regions: "Gujarat, Maharashtra, Rajasthan", rtl: true },
  { code: "ta", name: "Tamil", native: "தமிழ்", script: "tamil", regions: "Tamil Nadu, Puducherry", popular: true },
  { code: "te", name: "Telugu", native: "తెలుగు", script: "telugu", regions: "Andhra Pradesh, Telangana", popular: true },
  { code: "ur", name: "Urdu", native: "اردو", script: "nastaliq", regions: "Telangana, Uttar Pradesh, Bihar, Jammu & Kashmir", rtl: true },
  { code: "hne", name: "Haryanvi", native: "Haryanvi", script: "devanagari", regions: "Haryana" },
  { code: "raj", name: "राजस्थानी", native: "राजस्थानी", script: "devanagari", regions: "Rajasthan" },
  { code: "marw", name: "मारवाड़ी", native: "मारवाड़ी", script: "devanagari", regions: "Rajasthan" },
  { code: "mew", name: "मेवाड़ी", native: "मेवाड़ी", script: "devanagari", regions: "Rajasthan" },
  { code: "mewt", name: "मेवाती", native: "मेवाती", script: "devanagari", regions: "Haryana, Rajasthan" },
  { code: "braj", name: "ब्रज", native: "ब्रज", script: "devanagari", regions: "Uttar Pradesh, Rajasthan" },
  { code: "awa", name: "अवधी", native: "अवधी", script: "devanagari", regions: "Uttar Pradesh" },
  { code: "bho", name: "भोजपुरी", native: "भोजपुरी", script: "devanagari", regions: "Bihar, Uttar Pradesh, Jharkhand" },
  { code: "mag", name: "मगही", native: "मगही", script: "devanagari", regions: "Bihar, Jharkhand" },
  { code: "bnd", name: "बुंदेली", native: "बुंदेली", script: "devanagari", regions: "Madhya Pradesh, Uttar Pradesh" },
  { code: "bag", name: "बघेली", native: "बघेली", script: "devanagari", regions: "Madhya Pradesh, Uttar Pradesh" },
  { code: "hne2", name: "छत्तीसगढ़ी", native: "छत्तीसगढ़ी", script: "devanagari", regions: "Chhattisgarh" },
  { code: "gbh", name: "गढ़वाली", native: "गढ़वाली", script: "devanagari", regions: "Uttarakhand" },
  { code: "kum", name: "कुमाऊँनी", native: "कुमाऊँनी", script: "devanagari", regions: "Uttarakhand" },
  { code: "kang", name: "कांगड़ी", native: "कांगड़ी", script: "devanagari", regions: "Himachal Pradesh" },
  { code: "pah", name: "पहाड़ी", native: "पहाड़ी", script: "devanagari", regions: "Himachal Pradesh, Uttarakhand, Jammu & Kashmir" },
  { code: "bhil", name: "भीली", native: "भीली", script: "devanagari", regions: "Rajasthan, Gujarat, Madhya Pradesh, Maharashtra" },
  { code: "bhilodi", name: "भीलोड़ी", native: "भीलोड़ी", script: "devanagari", regions: "Rajasthan, Gujarat, Madhya Pradesh" },
  { code: "lad", name: "ལ་དྭགས་ཀྱི་སྐད།", native: "ལ་དྭགས་ཀྱི་སྐད།", script: "devanagari", regions: "Ladakh" },
  { code: "balti", name: "بلتی", native: "بلتی", script: "arabic", regions: "Ladakh" },
  { code: "varh", name: "वऱ्हाडी", native: "वऱ्हाडी", script: "devanagari", regions: "Maharashtra" },
  { code: "kha", name: "खानदेशी", native: "खानदेशी", script: "devanagari", regions: "Maharashtra" },
  { code: "ahir", name: "अहिराणी", native: "अहिराणी", script: "devanagari", regions: "Maharashtra" },
  { code: "malv", name: "मालवणी", native: "मालवणी", script: "devanagari", regions: "Maharashtra, Goa" },
  { code: "kac", name: "કચ્છી", native: "કચ્છી", script: "gujarati", regions: "Gujarat, Rajasthan" },
  { code: "paw", name: "पावरी", native: "पावरी", script: "devanagari", regions: "Madhya Pradesh, Maharashtra, Gujarat" },
  { code: "war", name: "वारली", native: "वारली", script: "devanagari", regions: "Maharashtra, Gujarat" },
  { code: "tcy", name: "ತುಳು", native: "ತುಳು", script: "kannada", regions: "Coastal Karnataka, Kerala" },
  { code: "kod", name: "ಕೊಡವ ತಕ್ಕ್", native: "ಕೊಡವ ತಕ್ಕ್", script: "kannada", regions: "Karnataka" },
  { code: "bad", name: "ಬಡಗ", native: "ಬಡಗ", script: "kannada", regions: "Tamil Nadu, Nilgiris" },
  { code: "tod", name: "தோடா", native: "தோடா", script: "tamil", regions: "Tamil Nadu, Nilgiris" },
  { code: "iru", name: "இருளா", native: "இருளா", script: "tamil", regions: "Tamil Nadu, Kerala" },
  { code: "kurm", name: "குறும்பா", native: "குறும்பா", script: "tamil", regions: "Tamil Nadu, Kerala, Karnataka" },
  { code: "lamb", name: "लंबाडी", native: "लंबाडी", script: "devanagari", regions: "Rajasthan, Gujarat, Maharashtra, Telangana, Karnataka" },
  { code: "gon", name: "गोंडी", native: "गोंडी", script: "devanagari", regions: "Madhya Pradesh, Maharashtra, Chhattisgarh, Telangana" },
  { code: "sam", name: "ସମ୍ବଲପୁରୀ", native: "ସମ୍ବଲପୁରୀ", script: "oriya", regions: "Odisha" },
  { code: "ho", name: "ᱦᱚ", native: "ᱦᱚ", script: "olchiki", regions: "Jharkhand, Odisha" },
  { code: "mun", name: "ᱢᱩᱱᱰᱟᱨᱤ", native: "ᱢᱩᱱᱰᱟᱨᱤ", script: "olchiki", regions: "Jharkhand, Odisha" },
  { code: "kru", name: "कुड़ुख", native: "कुड़ुख", script: "devanagari", regions: "Jharkhand, Chhattisgarh, Odisha" },
  { code: "kha2", name: "ଖଡ଼ିଆ", native: "ଖଡ଼ିଆ", script: "oriya", regions: "Jharkhand, Odisha" },
  { code: "bhu", name: "भूमिज", native: "भूमिज", script: "devanagari", regions: "Jharkhand, Odisha, West Bengal" },
  { code: "kui", name: "କୁଇ", native: "କୁଇ", script: "oriya", regions: "Odisha" },
  { code: "kond", name: "କନ୍ଧ", native: "କନ୍ଧ", script: "oriya", regions: "Odisha" },
  { code: "nag", name: "नागपुरी", native: "नागपुरी", script: "devanagari", regions: "Jharkhand" },
  { code: "kha3", name: "Khasi", native: "Khasi", script: "latin", regions: "Meghalaya" },
  { code: "garo", name: "A·chik", native: "A·chik", script: "latin", regions: "Meghalaya" },
  { code: "mizo", name: "Mizo", native: "Mizo", script: "latin", regions: "Mizoram" },
  { code: "kokb", name: "Kokborok", native: "Kokborok", script: "latin", regions: "Tripura" },
  { code: "kar", name: "Karbi", native: "Karbi", script: "latin", regions: "Assam" },
  { code: "dim", name: "Dimasa", native: "Dimasa", script: "latin", regions: "Assam" },
  { code: "mis", name: "Mishing", native: "Mishing", script: "latin", regions: "Assam" },
  { code: "ao", name: "Ao", native: "Ao", script: "latin", regions: "Nagaland" },
  { code: "ang", name: "Angami", native: "Angami", script: "latin", regions: "Nagaland" },
  { code: "sumi", name: "Sumi", native: "Sumi", script: "latin", regions: "Nagaland" },
  { code: "kon", name: "Konyak", native: "Konyak", script: "latin", regions: "Nagaland" },
  { code: "chak", name: "𑄌𑄇𑄴𑄟𑄳𑄦", native: "𑄌𑄇𑄴𑄟𑄳𑄦", script: "latin", regions: "Tripura, Mizoram, Arunachal Pradesh" },
  { code: "hmar", name: "Hmar", native: "Hmar", script: "latin", regions: "Manipur, Mizoram, Assam" },
  { code: "tang", name: "Tangkhul", native: "Tangkhul", script: "latin", regions: "Manipur" },
  { code: "rong", name: "Rongmei", native: "Rongmei", script: "latin", regions: "Manipur, Nagaland, Assam" },
  { code: "adi", name: "Adi", native: "Adi", script: "latin", regions: "Arunachal Pradesh" },
  { code: "apa", name: "Apatani", native: "Apatani", script: "latin", regions: "Arunachal Pradesh" },
  { code: "nyi", name: "Nyishi", native: "Nyishi", script: "latin", regions: "Arunachal Pradesh" },
  { code: "monp", name: "Monpa", native: "Monpa", script: "latin", regions: "Arunachal Pradesh" },
  { code: "wan", name: "Wancho", native: "Wancho", script: "latin", regions: "Arunachal Pradesh" },
];

export const LANGUAGE_MAP: Record<string, Language> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l]),
);

export const SCRIPT_FONTS: Record<Script, { display: string; body: string; google: string[] }> = {
  latin: { display: "Playfair Display", body: "Satoshi", google: ["Playfair+Display:ital,wght@0,600;0,700;1,600;1,700"] },
  devanagari: { display: "Noto Serif Devanagari", body: "Noto Sans Devanagari", google: ["Noto+Serif+Devanagari:wght@600;700", "Noto+Sans+Devanagari:wght@400;500;600;700"] },
  bengali: { display: "Noto Serif Bengali", body: "Noto Sans Bengali", google: ["Noto+Serif+Bengali:wght@600;700", "Noto+Sans+Bengali:wght@400;500;600;700"] },
  gujarati: { display: "Noto Serif Gujarati", body: "Noto Sans Gujarati", google: ["Noto+Serif+Gujarati:wght@600;700", "Noto+Sans+Gujarati:wght@400;500;600;700"] },
  gurmukhi: { display: "Noto Serif Gurmukhi", body: "Noto Sans Gurmukhi", google: ["Noto+Serif+Gurmukhi:wght@600;700", "Noto+Sans+Gurmukhi:wght@400;500;600;700"] },
  oriya: { display: "Noto Serif Oriya", body: "Noto Sans Oriya", google: ["Noto+Serif+Oriya:wght@600;700", "Noto+Sans+Oriya:wght@400;500;600;700"] },
  tamil: { display: "Noto Serif Tamil", body: "Noto Sans Tamil", google: ["Noto+Serif+Tamil:wght@600;700", "Noto+Sans+Tamil:wght@400;500;600;700"] },
  telugu: { display: "Noto Serif Telugu", body: "Noto Sans Telugu", google: ["Noto+Serif+Telugu:wght@600;700", "Noto+Sans+Telugu:wght@400;500;600;700"] },
  kannada: { display: "Noto Serif Kannada", body: "Noto Sans Kannada", google: ["Noto+Serif+Kannada:wght@600;700", "Noto+Sans+Kannada:wght@400;500;600;700"] },
  malayalam: { display: "Noto Serif Malayalam", body: "Noto Sans Malayalam", google: ["Noto+Serif+Malayalam:wght@600;700", "Noto+Sans+Malayalam:wght@400;500;600;700"] },
  arabic: { display: "Noto Naskh Arabic", body: "Noto Naskh Arabic", google: ["Noto+Naskh+Arabic:wght@400;500;600;700"] },
  nastaliq: { display: "Noto Nastaliq Urdu", body: "Noto Nastaliq Urdu", google: ["Noto+Nastaliq+Urdu:wght@400;500;600;700"] },
  olchiki: { display: "Noto Sans Ol Chiki", body: "Noto Sans Ol Chiki", google: ["Noto+Sans+Ol+Chiki:wght@400;500;600;700"] },
};
