/**
 * Crypto donation addresses. Both are optional public build variables, so the addresses
 * live in the environment (.env.local, and the Cloudflare BUILD variables), never in code:
 *
 *   NEXT_PUBLIC_DONATE_SOL_ADDRESS   a Solana wallet address
 *   NEXT_PUBLIC_DONATE_ETH_ADDRESS   an Ethereum wallet address (0x...)
 *
 * An address that is missing or does not look like one is dropped. With no valid address
 * the /donate page returns 404 and the footer link is not rendered, so a half-configured
 * build never ships an empty or broken donate page.
 *
 * The format check only catches paste mistakes (a stray space, a cut-off address). It cannot
 * tell you the address is yours: send a small test amount before publishing, and use a
 * wallet made for this, not your main one.
 */
export type DonateChain = "solana" | "ethereum";

export interface DonateMethod {
  chain: DonateChain;
  name: string;
  /** The one network a donor must send on, as shown: "{assets}, {network} only." */
  network: string;
  /** What to send. */
  assets: string;
  address: string;
}

const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const ETHEREUM_ADDRESS = /^0x[0-9a-fA-F]{40}$/;

function validAddress(value: string | undefined, pattern: RegExp): string | null {
  const trimmed = value?.trim();
  return trimmed && pattern.test(trimmed) ? trimmed : null;
}

// NEXT_PUBLIC_ values are inlined at build time, so these reads must stay literal.
const solana = validAddress(process.env.NEXT_PUBLIC_DONATE_SOL_ADDRESS, SOLANA_ADDRESS);
const ethereum = validAddress(process.env.NEXT_PUBLIC_DONATE_ETH_ADDRESS, ETHEREUM_ADDRESS);

export const DONATE_METHODS: readonly DonateMethod[] = [
  ...(solana
    ? [{ chain: "solana", name: "Solana", network: "Solana network", assets: "SOL or USDC", address: solana } as const]
    : []),
  ...(ethereum
    ? [
        {
          chain: "ethereum",
          name: "Ethereum",
          network: "Ethereum mainnet",
          assets: "ETH or USDC",
          address: ethereum,
        } as const,
      ]
    : []),
];

export const hasDonations = DONATE_METHODS.length > 0;
