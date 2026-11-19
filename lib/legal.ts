/**
 * Shared facts for the Terms of Service and Privacy Policy pages.
 *
 * LEGAL_UPDATED is the "Last updated" date shown on both pages. Change it whenever the text
 * of either page changes in a way a visitor should know about.
 *
 * NEXT_PUBLIC_CONTACT_EMAIL is an optional public build variable (compiled into the page, like
 * the donate addresses in lib/donate.ts). It is the one address the legal pages give for
 * questions and for account-deletion requests. Unset or not shaped like an address, the
 * pages leave the contact line out rather than print a broken one.
 *
 * It ends up in the browser bundle and on the page, so it must be a StreamScapeX address
 * (for example contact@streamscapex.app, forwarded to the owner's inbox by Cloudflare Email
 * Routing), never a personal one.
 */
export const LEGAL_UPDATED = "November 19, 2026";
export const LEGAL_UPDATED_ISO = "2026-11-19";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// NEXT_PUBLIC_ values are inlined at build time, so this read must stay literal.
const rawContact = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

export const CONTACT_EMAIL: string | null =
  rawContact && EMAIL_PATTERN.test(rawContact) ? rawContact : null;
