import { create } from "zustand";
import { findThemeOption, ThemeId, ThemeOption } from "../features/settings/themeOptions";
import { getSavedThemePreference, saveThemePreference } from "../services/themePreference";
import { ThemeColors } from "../theme/theme";

type ThemeState = {
  selectedTheme: ThemeId;
  palette: ThemeColors;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setTheme: (theme: ThemeOption) => Promise<ThemeOption>;
};

const defaultTheme = findThemeOption("system");

export const useThemeStore = create<ThemeState>((set) => ({
  selectedTheme: defaultTheme.id,
  palette: defaultTheme.palette,
  isHydrated: false,
  hydrate: async () => {
    const themeId = await getSavedThemePreference();
    const theme = findThemeOption(themeId);

    set({
      selectedTheme: theme.id,
      palette: theme.palette,
      isHydrated: true,
    });
  },
  setTheme: async (theme) => {
    const savedThemeId = await saveThemePreference(theme.id);
    const savedTheme = findThemeOption(savedThemeId);

    set({
      selectedTheme: savedTheme.id,
      palette: savedTheme.palette,
      isHydrated: true,
    });

    return savedTheme;
  },
}));
