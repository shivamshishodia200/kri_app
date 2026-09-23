import { colors } from './colors';
import { spacing, radii } from './spacing';
import { typography } from './typography';
import { shadows } from './shadows';

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
};

export type Theme = typeof theme;
export { colors, spacing, radii, typography, shadows };
export default theme;
