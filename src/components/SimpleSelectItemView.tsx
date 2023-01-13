import { forwardRef, ReactNode } from "react";

export interface SimpleSelectItem {
  value: string;
  label: string;
  component: ReactNode;
}

export const SimpleSelectItemView = forwardRef<
  HTMLDivElement,
  SimpleSelectItem
>(({ value, label, component, ...others }, ref) => (
  <div ref={ref} {...others}>
    {component}
  </div>
));
SimpleSelectItemView.displayName = "SimpleSelectItem";
