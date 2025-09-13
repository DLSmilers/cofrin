import * as React from "react"

interface TooltipProps {
  children: React.ReactNode
}

interface TooltipProviderProps {
  children: React.ReactNode
  delayDuration?: number
}

interface TooltipTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface TooltipContentProps {
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  className?: string
  hidden?: boolean
  [key: string]: any
}

const TooltipProvider = ({ children }: TooltipProviderProps) => {
  return <>{children}</>
}

const Tooltip = ({ children }: TooltipProps) => {
  return <>{children}</>
}

const TooltipTrigger = ({ children }: TooltipTriggerProps) => {
  return <>{children}</>
}

const TooltipContent = ({ children }: TooltipContentProps) => {
  return <>{children}</>
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
}
