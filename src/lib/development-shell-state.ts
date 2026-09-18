import baseState from '../../config/development-shell-state.base.json';
import type { ShellState } from '@/types/contracts';

/**
 * Static fallback used only when no active runtime projection exists.
 *
 * KS4.3 intentionally keeps this base in JSON so the development ecosystem
 * compiler and the Next presentation fallback share one source of truth.
 */
export const developmentShellState = baseState as unknown as ShellState;
