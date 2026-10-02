import * as React from "react"
import Link from "next/link"
import {
  CaretLeftIcon,
  CaretRightIcon,
  DotsThreeIcon,
} from "@phosphor-icons/react/dist/ssr"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    aria-label="Pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row flex-wrap items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type LinkHref = React.ComponentProps<typeof Link>["href"]

type PaginationLinkProps = {
  isActive?: boolean
  /** When set, renders a real next/link anchor (preferred: crawlable, works without JS). */
  href?: LinkHref
  /** Disabled state: a non-interactive span (with href) or a disabled button. */
  disabled?: boolean
  /** Passed to next/link when href is set. */
  prefetch?: boolean | null
  scroll?: boolean
  replace?: boolean
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>
} & Pick<ButtonProps, "size"> &
  Omit<React.ComponentProps<"a">, "href" | "ref" | "onClick">

/**
 * Renders next/link when `href` is given, a <button type="button"> otherwise
 * (legacy onClick-driven callers keep working). Active page uses the primary
 * pill and aria-current="page".
 */
const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  href,
  disabled,
  prefetch,
  scroll,
  replace,
  onClick,
  children,
  ...props
}: PaginationLinkProps) => {
  const ariaDisabled = props["aria-disabled"]
  const isDisabled =
    disabled === true || ariaDisabled === true || ariaDisabled === "true"

  const classes = cn(
    buttonVariants({
      variant: isActive ? "default" : "ghost",
      size,
    }),
    "tabular-nums",
    isDisabled && "pointer-events-none opacity-50",
    className
  )

  if (href !== undefined) {
    if (isDisabled) {
      return (
        <span
          {...(props as React.HTMLAttributes<HTMLSpanElement>)}
          aria-disabled="true"
          className={classes}
        >
          {children}
        </span>
      )
    }
    return (
      <Link
        {...props}
        href={href}
        prefetch={prefetch}
        scroll={scroll}
        replace={replace}
        onClick={onClick}
        aria-current={isActive ? "page" : undefined}
        className={classes}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      type="button"
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      onClick={onClick}
      disabled={isDisabled}
      aria-current={isActive ? "page" : undefined}
      className={classes}
    >
      {children}
    </button>
  )
}
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-3", className)}
    {...props}
  >
    <CaretLeftIcon aria-hidden="true" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-3", className)}
    {...props}
  >
    <span>Next</span>
    <CaretRightIcon aria-hidden="true" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn(
      "flex h-11 w-11 items-center justify-center text-subtle-foreground",
      className
    )}
    {...props}
  >
    <DotsThreeIcon size={20} aria-hidden="true" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
