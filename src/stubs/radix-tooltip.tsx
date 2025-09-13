import * as React from "react";

// Lightweight stubs for @radix-ui/react-tooltip to avoid runtime issues
// They preserve structure but do not implement tooltip behavior.

export const Provider: React.FC<{ children?: React.ReactNode } & Record<string, any>> = ({ children }) => <>{children}</>;
export const Root: React.FC<{ children?: React.ReactNode } & Record<string, any>> = ({ children }) => <>{children}</>;
export const Trigger = React.forwardRef<any, { children?: React.ReactNode } & Record<string, any>>(({ children }, _ref) => <>{children}</>);
Trigger.displayName = "Trigger";
export const Content = React.forwardRef<HTMLDivElement, Record<string, any>>((_props, _ref) => null);
Content.displayName = "Content";
