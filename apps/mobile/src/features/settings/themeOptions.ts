import { colors, ThemeColors } from "../../theme/theme";

export type ThemeId =
  | "system"
  | "calm"
  | "forest"
  | "sunrise"
  | "ocean"
  | "lavender"
  | "rose"
  | "graphite"
  | "night"
  | "highContrast";

export type ThemeOption = {
  id: ThemeId;
  swatches: string[];
  colorScheme: "light" | "dark" | null;
  palette: ThemeColors;
};

export const themeOptions: ThemeOption[] = [
  {
    id: "system",
    swatches: ["#f7f8f4", "#2f7d5b", "#17211f"],
    colorScheme: null,
    palette: makePalette({}),
  },
  {
    id: "calm",
    swatches: ["#f7f8f4", "#2f7d5b", "#c85f46"],
    colorScheme: "light",
    palette: makePalette({}),
  },
  {
    id: "forest",
    swatches: ["#eef5ed", "#1f6b4a", "#8aa05d"],
    colorScheme: "light",
    palette: makePalette({
      ink: "#14211a",
      muted: "#637066",
      faint: "#e7f0e6",
      paper: "#f2f8f0",
      line: "#cfe0d0",
      green: "#1f6b4a",
      greenSoft: "#dcefe2",
      greenLine: "#b8dcc6",
      coral: "#8a6f3c",
      coralSoft: "#f1ead6",
      blue: "#4f7b6b",
      blueSoft: "#dcebe5",
    }),
  },
  {
    id: "sunrise",
    swatches: ["#fff6ea", "#d46a3c", "#f2b84b"],
    colorScheme: "light",
    palette: makePalette({
      ink: "#241b15",
      muted: "#7a6a5d",
      faint: "#f7ead9",
      paper: "#fff8ed",
      line: "#edd8bf",
      green: "#d46a3c",
      greenSoft: "#fae6d7",
      greenLine: "#efc5a8",
      coral: "#b84f35",
      coralSoft: "#f8ddd2",
      gold: "#b88118",
      goldSoft: "#f8e9c4",
      blue: "#84664a",
      blueSoft: "#efe4d5",
    }),
  },
  {
    id: "ocean",
    swatches: ["#eef8fb", "#237c90", "#4d9fc6"],
    colorScheme: "light",
    palette: makePalette({
      ink: "#132326",
      muted: "#607477",
      faint: "#e2f1f5",
      paper: "#f1fbfd",
      line: "#c7e1e8",
      green: "#237c90",
      greenSoft: "#d7f0f4",
      greenLine: "#abd9e3",
      coral: "#b45b57",
      coralSoft: "#f3dfdc",
      blue: "#2f6fa0",
      blueSoft: "#dcecf7",
    }),
  },
  {
    id: "lavender",
    swatches: ["#f7f2fb", "#7b5ea7", "#b38bd7"],
    colorScheme: "light",
    palette: makePalette({
      ink: "#211b28",
      muted: "#71667a",
      faint: "#eee7f4",
      paper: "#fbf7ff",
      line: "#dfd2eb",
      green: "#7b5ea7",
      greenSoft: "#ece3f6",
      greenLine: "#d4c1ea",
      coral: "#b45f7a",
      coralSoft: "#f4dde7",
      blue: "#655ca6",
      blueSoft: "#e4e1f5",
    }),
  },
  {
    id: "rose",
    swatches: ["#fff1f3", "#b84f6a", "#e58aa0"],
    colorScheme: "light",
    palette: makePalette({
      ink: "#28181d",
      muted: "#7a6369",
      faint: "#f6e5e9",
      paper: "#fff7f8",
      line: "#eccfd8",
      green: "#b84f6a",
      greenSoft: "#f6dfe6",
      greenLine: "#e8bdca",
      coral: "#c85f46",
      coralSoft: "#f7e2dc",
      blue: "#875a7a",
      blueSoft: "#eadde7",
    }),
  },
  {
    id: "graphite",
    swatches: ["#f2f3f2", "#3f4744", "#8b9490"],
    colorScheme: "light",
    palette: makePalette({
      ink: "#1c2220",
      muted: "#68716e",
      faint: "#eceeed",
      paper: "#f5f6f5",
      line: "#d8ddda",
      green: "#3f6457",
      greenSoft: "#e0ebe6",
      greenLine: "#c5d7d0",
      coral: "#8f5d4f",
      coralSoft: "#eee2de",
      blue: "#53697a",
      blueSoft: "#e2e8ed",
    }),
  },
  {
    id: "night",
    swatches: ["#111816", "#6fd39b", "#25312d"],
    colorScheme: "dark",
    palette: makePalette({
      ink: "#ecf6f0",
      muted: "#a6b5ae",
      faint: "#25312d",
      paper: "#101715",
      surface: "#17211f",
      line: "#2d3a35",
      green: "#6fd39b",
      greenSoft: "#203a2d",
      greenLine: "#315a42",
      coral: "#f09578",
      coralSoft: "#3b2822",
      gold: "#e3bd73",
      goldSoft: "#3b3422",
      blue: "#8dbce3",
      blueSoft: "#213343",
    }),
  },
  {
    id: "highContrast",
    swatches: ["#ffffff", "#0f5132", "#111111"],
    colorScheme: "light",
    palette: makePalette({
      ink: "#111111",
      muted: "#3f3f3f",
      faint: "#eeeeee",
      paper: "#ffffff",
      surface: "#ffffff",
      line: "#111111",
      green: "#0f5132",
      greenSoft: "#d9f2e2",
      greenLine: "#0f5132",
      coral: "#9f2f1f",
      coralSoft: "#f6d8d2",
      blue: "#003f7d",
      blueSoft: "#d9e9ff",
    }),
  },
];

export function findThemeOption(themeId: string | null | undefined) {
  return themeOptions.find((theme) => theme.id === themeId) ?? themeOptions[0];
}

function makePalette(overrides: Partial<ThemeColors>): ThemeColors {
  return {
    ...colors,
    ...overrides,
  };
}
