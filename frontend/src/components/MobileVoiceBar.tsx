import { cn } from "@/lib/utils";
import { SelectedVoicePill } from "@/components/SelectedVoicePill";
import { ChevronRight } from "lucide-react";

interface MobileVoiceBarProps {
  voiceName: string;
  voiceIndex: number;
  onChangeVoice: () => void;
  disabled?: boolean;
  className?: string;
}

export function MobileVoiceBar({
  voiceName,
  voiceIndex,
  onChangeVoice,
  disabled,
  className,
}: MobileVoiceBarProps) {
  return (
    <button
      type="button"
      onClick={onChangeVoice}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
        "hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
      style={{
        borderColor: "var(--app-border)",
        backgroundColor: "var(--app-surface)",
        color: "var(--app-text)",
      }}
    >
      <div className="min-w-0 flex-1">
        <SelectedVoicePill name={voiceName} index={voiceIndex} fullWidth className="border-0 px-0 py-0 bg-transparent" />
      </div>
      <span className="text-sm font-medium" style={{ color: "var(--app-accent)" }}>
        Change voice
      </span>
      <ChevronRight className="size-4 shrink-0" style={{ color: "var(--app-text-muted)" }} />
    </button>
  );
}
