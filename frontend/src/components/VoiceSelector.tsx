import { useEffect, useRef, useState } from "react";
import { getPreviewUrl, type Voice } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Play, Pause, Check } from "lucide-react";

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
      <div className={cn("text-stone-500 text-sm", className)}>
        Loading voices...
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
        className
      )}
      role="listbox"
      aria-label="Select a voice"
    >
      {voices.map((v) => {
        const isSelected = selectedId === v.id;
        return (
          <div
            key={v.id}
            role="option"
            aria-selected={isSelected}
            tabIndex={disabled ? -1 : 0}
            onClick={() => onSelect(v.id)}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(v.id);
              }
            }}
            className={cn(
              "flex flex-col rounded-xl border-2 p-4 text-left transition-all min-h-[120px] bg-white",
              "hover:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300/50",
              disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              isSelected
                ? "border-teal-600 shadow-sm"
                : "border-stone-200"
            )}
          >
            <div className="flex justify-end mb-2 min-h-6">
              {isSelected ? (
                <div className="flex size-6 items-center justify-center rounded-full bg-teal-600 text-white">
                  <Check className="size-3.5" strokeWidth={3} />
                </div>
              ) : (
                <div className="size-6" aria-hidden />
              )}
            </div>
            <div className="mt-auto flex items-end justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-stone-900 truncate">{v.name}</p>
                <p className="text-sm text-stone-600 truncate">{v.description}</p>
              </div>
              {v.preview_url && (
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
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-stone-600 shadow-sm hover:bg-white hover:text-teal-600"
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
