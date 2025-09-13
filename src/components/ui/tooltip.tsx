import * as React from "react"

// No-op tooltip stubs to avoid runtime issues with duplicate React during development
// They render children without activating Radix logic.

type ProviderProps = { children?: React.ReactNode }

const TooltipProvider: React.FC<ProviderProps> = ({ children }) => <>{children}</>

const Tooltip: React.FC<ProviderProps> = ({ children }) => <>{children}</>

interface TriggerProps {
  children?: React.ReactNode
  asChild?: boolean
  [key: string]: any
}

const TooltipTrigger = React.forwardRef<any, TriggerProps>(({ children }, _ref) => <>{children}</>)
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<HTMLDivElement, { [key: string]: any }>(() => null)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
