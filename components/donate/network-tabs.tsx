"use client";

import { Children, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { DonateChain } from "@/lib/donate";
import { cn } from "@/lib/utils";

import { ChainLogo } from "./chain-logo";

/**
 * Phones get one network at a time with a switch on top, so the page stays short. From md up
 * every card sits side by side and the switch is hidden. Children are the cards, in the same
 * order as `tabs`; they stay Server Components, so their QR codes are still built on the server.
 */
export function NetworkTabs({
  tabs,
  children,
}: {
  tabs: readonly { chain: DonateChain; name: string }[];
  children: ReactNode;
}) {
  const [active, setActive] = useState(0);
  const cards = Children.toArray(children);

  return (
    <div>
      {tabs.length > 1 ? (
        <div role="group" aria-label="Choose a network" className="mb-4 grid grid-cols-2 gap-2 md:hidden">
          {tabs.map((tab, index) => (
            <Button
              key={tab.chain}
              type="button"
              variant={index === active ? "default" : "outline"}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
            >
              <ChainLogo chain={tab.chain} />
              {tab.name}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((card, index) => (
          <div key={tabs[index]?.chain ?? index} className={cn(index === active ? "block" : "hidden", "md:block")}>
            {card}
          </div>
        ))}
      </div>
    </div>
  );
}
