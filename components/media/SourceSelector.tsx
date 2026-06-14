"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STREAM_PROVIDERS } from "@/lib/stream-providers";

interface SourceSelectorProps {
  value: string;
  onChange: (id: string) => void;
}

/**
 * Row of streaming sources the user can switch between. Because the player is a
 * cross-origin iframe, we can't detect whether a source actually loaded — so
 * this also serves as the "try another source" fallback. iOS-friendly sources
 * are flagged so iPhone users know which to reach for first.
 */
export default function SourceSelector({ value, onChange }: SourceSelectorProps) {
  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs text-muted-foreground">
        Source not working? Try another below. On iPhone, pick a source marked
        <span className="mx-1 font-medium text-foreground">iOS</span>.
      </p>
      <div className="flex flex-wrap gap-2">
        {STREAM_PROVIDERS.map((provider) => {
          const isActive = provider.id === value;
          return (
            <Button
              key={provider.id}
              size="sm"
              variant={isActive ? "default" : "outline"}
              onClick={() => onChange(provider.id)}
              aria-pressed={isActive}
            >
              {provider.label}
              {provider.iosFriendly && (
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className="ml-2 px-1.5 py-0 text-[10px]"
                >
                  iOS
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
