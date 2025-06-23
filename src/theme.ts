import { createTheme } from "@mui/material/styles";
import { colors, radii, spacing, fontSizes } from "./tokens";

const theme = createTheme({
  spacing: spacing.sm,
  palette: {
    mode: "light",
    primary: {
      main: colors.primary,
    },
    secondary: {
      main: colors.secondary,
    },
    background: {
      default: colors.background,
    },
    text: {
      primary: colors.text,
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    fontSize: fontSizes.md,
    h6: { fontSize: fontSizes.lg },
  },
  shape: {
    borderRadius: radii.md,
  },
});

export default theme;
