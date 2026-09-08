import { en, type Dictionary } from "./dictionaries/en";
import { vi } from "./dictionaries/vi";
import type { Locale } from "./config";

const dictionaries: Record<Locale, Dictionary> = {
  en,
  vi,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.en;
}
