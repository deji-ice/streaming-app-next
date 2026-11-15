/**
 * When the donation popup may open. Pure rules plus a tiny localStorage record, so the
 * rules can be tested without a browser. Nothing here is sent anywhere: the popup only
 * remembers, in this browser, how many pages were viewed and when it may show again.
 *
 * To make it more or less frequent, change DONATE_PROMPT below.
 */
export const DONATE_PROMPT = {
  /** Page views in this browser before the first popup, so nobody sees it on arrival. */
  minViews: 5,
  /** How long someone stays on a page before the popup opens. */
  delayMs: 20_000,
  /** Quiet time after each answer, in days. */
  snoozeDays: { later: 14, copied: 90, never: 365 },
} as const;

export type PromptChoice = keyof typeof DONATE_PROMPT.snoozeDays;

export interface PromptState {
  views: number;
  /** Epoch ms; the popup stays closed until then. */
  snoozeUntil: number;
}

export const PROMPT_STORAGE_KEY = "ssx-donate-v1";

const DAY_MS = 86_400_000;

/**
 * Pages where the popup never opens: the donate page itself, sign-in, and the movie and
 * series pages (they hold the player, and nobody should be interrupted mid-film).
 * The /movie and /series list pages are fine.
 */
const EXCLUDED_PATHS = [/^\/donate(\/|$)/, /^\/auth(\/|$)/, /^\/(movie|series)\/[^/]+/];

export function isPromptPath(pathname: string): boolean {
  return !EXCLUDED_PATHS.some((pattern) => pattern.test(pathname));
}

export function isDue(state: PromptState, now: number): boolean {
  return state.views >= DONATE_PROMPT.minViews && now >= state.snoozeUntil;
}

export function afterChoice(state: PromptState, choice: PromptChoice, now: number): PromptState {
  return { ...state, snoozeUntil: now + DONATE_PROMPT.snoozeDays[choice] * DAY_MS };
}

const EMPTY: PromptState = { views: 0, snoozeUntil: 0 };

export function readState(): PromptState {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(PROMPT_STORAGE_KEY) ?? "null");
    if (parsed && typeof parsed === "object") {
      const { views, snoozeUntil } = parsed as Record<string, unknown>;
      if (typeof views === "number" && typeof snoozeUntil === "number") {
        return { views, snoozeUntil };
      }
    }
  } catch {
    // Missing, corrupt or blocked storage: start from nothing.
  }
  return { ...EMPTY };
}

export function writeState(state: PromptState): void {
  try {
    localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage blocked (private mode): the popup then follows the page-view rule on every visit.
  }
}
