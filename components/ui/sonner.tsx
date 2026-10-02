"use client"

import { Toaster as Sonner } from "sonner"

import { Z } from "@/lib/z"

type ToasterProps = React.ComponentProps<typeof Sonner>

/*
  Themed dark Toaster: surface 2 + hairline, 16px radius, flat (sonner's
  default box-shadow is cleared). The group-[.toaster] selectors out-rank
  sonner's own stylesheet. Bottom offset comes from --toast-offset-bottom in
  globals.css so toasts clear the mobile tab bar.
*/
const Toaster = ({ toastOptions, style, offset, mobileOffset, ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={{ zIndex: Z.toast, ...style }}
      offset={offset ?? { bottom: "var(--toast-offset-bottom)" }}
      mobileOffset={mobileOffset ?? { bottom: "var(--toast-offset-bottom)" }}
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-panel group-[.toaster]:border-border group-[.toaster]:bg-popover group-[.toaster]:font-sans group-[.toaster]:text-popover-foreground group-[.toaster]:[box-shadow:none]",
          title: "group-[.toast]:font-medium",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:rounded-full group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:rounded-full group-[.toast]:bg-accent group-[.toast]:text-foreground",
          closeButton:
            "group-[.toast]:border-border group-[.toast]:bg-popover group-[.toast]:text-foreground",
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
