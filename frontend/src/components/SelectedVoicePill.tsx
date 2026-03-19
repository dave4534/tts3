import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "bg-teal-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-slate-500",
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-violet-500",
];

interface SelectedVoicePillProps {
  name: string;
  index: number;
  className?: string;
}

export function SelectedVoicePill({
  name,
  index,
  className,
}: SelectedVoicePillProps) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div
      className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5", className)}
      style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-surface)", color: "var(--app-text)" }}
      role="status"
      aria-label={`Selected voice: ${name}`}
    >
      <div className={cn("size-4 shrink-0 rounded-full", color)} aria-hidden />
      <span className="text-sm font-medium truncate max-w-[200px]">
        {name}
      </span>
    </div>
  );
}

export { AVATAR_COLORS };
