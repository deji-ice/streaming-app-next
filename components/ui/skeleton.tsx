import { cn } from "@/lib/utils"

/** Soft opacity pulse on the muted surface; the pulse stops under reduced motion. */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-skeleton rounded-media bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
