import { Gem } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Pro gem — Lucide “gem” (ISC)
 * https://lucide.dev/icons/gem
 */
type ProDiamondProps = {
  className?: string;
};

export default function ProDiamond({ className }: ProDiamondProps) {
  return (
    <Gem
      className={cn(
        "h-3.5 w-3.5 shrink-0 -translate-y-[1.5px] text-[var(--surface-coral)]",
        className,
      )}
      strokeWidth={2}
      aria-hidden
    />
  );
}
