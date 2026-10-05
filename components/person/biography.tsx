"use client";

import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";

import { focusRing } from "@/components/ds/classes";
import { cn } from "@/lib/utils";

/** Rough size where six lines are exceeded on most screens; only used until the first measurement. */
const LONG_TEXT_CHARS = 330;

export interface BiographyProps {
  /** Paragraphs, already split on blank lines. */
  paragraphs: string[];
  className?: string;
}

/**
 * Biography clamped to six lines with a Read more / Show less toggle.
 *
 * Collapsed, the paragraphs are shown as one clamped block (clamping several
 * block children is not reliable across browsers) and the full text stays in
 * the DOM. Expanded, they render as separate paragraphs. The toggle is only
 * shown when the text really overflows six lines; until that is measured the
 * text length decides, so long biographies do not shift on hydration.
 */
export function Biography({ paragraphs, className }: BiographyProps) {
  const textId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const clampRef = useRef<HTMLParagraphElement>(null);
  const joined = paragraphs.join(" ");

  const [expanded, setExpanded] = useState(false);
  const [canToggle, setCanToggle] = useState(joined.length > LONG_TEXT_CHARS);

  useEffect(() => {
    const clamped = clampRef.current;
    if (!clamped) return;
    const measure = () => setCanToggle(clamped.scrollHeight > clamped.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(clamped);
    return () => observer.disconnect();
  }, [expanded, joined]);

  if (paragraphs.length === 0) return null;

  const collapse = () => {
    setExpanded(false);
    // Keep the reader at the biography instead of further down the page.
    requestAnimationFrame(() => {
      const box = boxRef.current;
      if (box && box.getBoundingClientRect().top < 72) box.scrollIntoView({ block: "start", behavior: "auto" });
    });
  };

  return (
    <div ref={boxRef} className={cn("scroll-mt-20", className)}>
      <h2 className="sr-only">Biography</h2>
      <div id={textId} className="max-w-[65ch] text-base leading-[1.6] text-foreground">
        {expanded ? (
          <div className="space-y-4">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <p ref={clampRef} className="line-clamp-6">
            {joined}
          </p>
        )}
      </div>
      {canToggle || expanded ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={textId}
          onClick={() => (expanded ? collapse() : setExpanded(true))}
          className={cn(
            "-ml-3 mt-1 inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors duration-150 ease-out hover:text-primary active:scale-[0.98]",
            focusRing,
          )}
        >
          {expanded ? "Show less" : "Read more"}
          {expanded ? <CaretUpIcon size={16} aria-hidden="true" /> : <CaretDownIcon size={16} aria-hidden="true" />}
        </button>
      ) : null}
    </div>
  );
}
