import * as React from "react";
import { cn } from "@/lib/utils";
import { FIELD_CLASS, FIELD_STYLE } from "@/lib/surfaces";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, style, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded border border-neutral-300 px-3 py-2 text-sm",
          FIELD_CLASS,
          "placeholder:text-neutral-500 dark:placeholder:text-neutral-400",
          "transition-[border-color,box-shadow] duration-fast",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black",
          "disabled:cursor-not-allowed disabled:opacity-40",
          className
        )}
        ref={ref}
        {...props}
        style={{
          ...FIELD_STYLE,
          ...style,
          backgroundColor: "var(--field)",
          color: "var(--ink)",
          opacity: 1,
        }}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
