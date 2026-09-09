import accentPalette from '../../interface/appearance/accent-palette.json';
import {
  APPEARANCE_MODES,
  DENSITIES,
  PRESENTATION_PREFERENCES_STORAGE_KEY,
  SURFACE_STYLES,
} from './presentation-preferences';

const bootConfig = {
  storageKey: PRESENTATION_PREFERENCES_STORAGE_KEY,
  modes: APPEARANCE_MODES,
  densities: DENSITIES,
  surfaceStyles: SURFACE_STYLES,
  accents: Object.fromEntries(accentPalette.accents.map((accent) => [accent.id, accent.color])),
};

const serialized = JSON.stringify(bootConfig).replaceAll('<', '\\u003c');

/**
 * Runs during document parsing, before React hydration. It only prevents an
 * avoidable presentation flash. The authoritative client resolver later
 * re-applies Space policy constraints and the active InterfaceTheme.
 */
export const APPEARANCE_BOOT_SCRIPT = `
(function () {
  try {
    var c = ${serialized};
    var root = document.documentElement;
    var parsed = null;
    try {
      var raw = window.localStorage.getItem(c.storageKey);
      parsed = raw ? JSON.parse(raw) : null;
    } catch (_) {}
    var pref = parsed && parsed.schema_version === 1 ? parsed : null;
    var mode = pref && c.modes.indexOf(pref.mode) >= 0 ? pref.mode : 'system';
    var dark = mode === 'dark' || (mode === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.dataset.koaliColorScheme = dark ? 'dark' : 'light';
    if (pref && c.densities.indexOf(pref.density) >= 0) root.dataset.koaliDensity = pref.density;
    var surfaceStyle = pref && (pref.surface_style || pref.surfaceStyle);
    if (surfaceStyle && c.surfaceStyles.indexOf(surfaceStyle) >= 0) root.dataset.koaliSurfaceStyle = surfaceStyle;
    if (pref && typeof pref.accent === 'string' && c.accents[pref.accent]) {
      root.dataset.koaliAccent = pref.accent;
      root.style.setProperty('--koali-accent', c.accents[pref.accent]);
    }
  } catch (_) {}
})();`;
