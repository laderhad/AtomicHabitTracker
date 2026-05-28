import { getSecureItem, setSecureItem } from "./secureStorage";

const LANGUAGE_KEY = "atomic.preferredLanguage";

export const defaultLanguage = "tr-TR";
export const supportedLanguages = ["tr-TR", "en-US"] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export function normalizeLanguage(value?: string | null): SupportedLanguage {
  if (value?.toLowerCase().startsWith("en")) {
    return "en-US";
  }

  return "tr-TR";
}

export async function getSavedLanguage() {
  const storedLanguage = await getSecureItem(LANGUAGE_KEY);
  return storedLanguage ? normalizeLanguage(storedLanguage) : null;
}

export async function saveLanguagePreference(language: string) {
  const normalizedLanguage = normalizeLanguage(language);
  await setSecureItem(LANGUAGE_KEY, normalizedLanguage);
  return normalizedLanguage;
}
