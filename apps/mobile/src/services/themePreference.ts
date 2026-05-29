import AsyncStorage from "@react-native-async-storage/async-storage";
import { findThemeOption, ThemeId } from "../features/settings/themeOptions";

const THEME_PREFERENCE_KEY = "atomic.themePreference";

export async function getSavedThemePreference(): Promise<ThemeId> {
  const savedTheme = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
  return findThemeOption(savedTheme).id;
}

export async function saveThemePreference(themeId: ThemeId): Promise<ThemeId> {
  const normalizedTheme = findThemeOption(themeId).id;
  await AsyncStorage.setItem(THEME_PREFERENCE_KEY, normalizedTheme);
  return normalizedTheme;
}
