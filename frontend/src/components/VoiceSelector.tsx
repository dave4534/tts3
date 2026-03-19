import { useEffect, useRef, useState } from "react";
import { getPreviewUrl, type Voice } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Play, Pause, Check } from "lucide-react";
import { AVATAR_COLORS } from "./SelectedVoicePill";

interface VoiceSelectorProps {
  voices: Voice[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function VoiceSelector({
  voices,
  selectedId,
  onSelect,
  loading,
  disabled,
  className,
}: VoiceSelectorProps) {
  if (loading) {
    return (
      <div className={cn("text-sm", className)} style={{ color: "var(--app-text-muted)" }}>
        Loading voices...
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      role="listbox"
      aria-label="Select a voice"
    >
      {voices.map((v, i) => {
        const isSelected = selectedId === v.id;
        const isVoiceDisabled = v.enabled === false || (v.enabled == null && !v.preview_url);
        const isDisabled = disabled || isVoiceDisabled;
        const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
        return (
          <div
            key={v.id}
            role="option"
            aria-selected={isSelected}
            aria-disabled={isVoiceDisabled}
            tabIndex={isDisabled ? -1 : 0}
            onClick={(e) => {
              if (isVoiceDisabled) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              onSelect(v.id);
            }}
            onKeyDown={(e) => {
              if (isDisabled || isVoiceDisabled) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(v.id);
              }
            }}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all",
              "focus:outline-none focus:ring-2 focus:ring-stone-300/50 dark:focus:ring-neutral-500/50",
              isVoiceDisabled
                ? "cursor-not-allowed opacity-50 pointer-events-none"
                : "cursor-pointer hover:border-stone-400 dark:hover:border-neutral-600",
              disabled && !isVoiceDisabled && "cursor-not-allowed opacity-60",
              isSelected && "shadow-sm"
            )}
            style={{
              backgroundColor: "var(--app-surface)",
              borderColor: isSelected ? "var(--app-accent)" : "var(--app-border)",
              color: "var(--app-text)",
            }}
          >
            <div
              className={cn(
                "size-10 shrink-0 rounded-full",
                avatarColor
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1" style={{ color: "var(--app-text)" }}>
              <p className="font-semibold truncate">{v.name}</p>
              <p className="text-sm truncate" style={{ color: "var(--app-text-muted)" }}>{v.description}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {isSelected && (
                <div className="flex size-6 items-center justify-center rounded-full bg-teal-600 text-white">
                  <Check className="size-3.5" strokeWidth={3} />
                </div>
              )}
              {v.preview_url && v.enabled !== false && (
                <PreviewButton voiceId={v.id} voiceName={v.name} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PreviewButton({
  voiceId,
  voiceName,
}: {
  voiceId: string;
  voiceName: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const play = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  return (
    <>
      <audio ref={audioRef} src={getPreviewUrl(voiceId)} preload="none" />
      <button
        type="button"
        onClick={play}
        className="flex size-9 shrink-0 items-center justify-center rounded-full shadow-sm hover:opacity-90"
        style={{
          backgroundColor: "var(--app-sidebar-bg)",
          color: "var(--app-accent)",
        }}
        aria-label={`Preview ${voiceName}`}
      >
        {isPlaying ? (
          <Pause className="size-4 fill-current" />
        ) : (
          <Play className="size-4 fill-current ml-0.5" />
        )}
      </button>
    </>
  );
}
