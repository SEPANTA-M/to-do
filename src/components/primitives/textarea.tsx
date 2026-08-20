import * as React from "react";
import { cn } from "@/lib/utils";
import { FIELD_CLASS, FIELD_STYLE } from "@/lib/surfaces";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded border border-neutral-300 px-3 py-2 text-sm",
          FIELD_CLASS,
          "placeholder:text-neutral-500 dark:placeholder:text-neutral-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
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
Textarea.displayName = "Textarea";

export { Textarea };
