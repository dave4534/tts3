import { useRef } from "react";
import { getPreviewUrl, type Voice } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

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
      <div className={cn("text-muted-foreground text-sm", className)}>
        Loading voices...
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3",
        className
      )}
      role="listbox"
      aria-label="Select a voice"
    >
      {voices.map((v) => {
        const isSelected = selectedId === v.id;
        return (
          <button
            key={v.id}
            type="button"
            role="option"
            aria-selected={isSelected}
            disabled={disabled}
            onClick={() => onSelect(v.id)}
            className={cn(
              "flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all",
              "hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400/50",
              "disabled:cursor-not-allowed disabled:opacity-60",
              isSelected
                ? "border-amber-500 bg-amber-50/80 shadow-sm"
                : "border-stone-200 bg-white"
            )}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className="font-medium text-stone-900">{v.name}</span>
              {v.preview_url && (
                <PreviewButton voiceId={v.id} voiceName={v.name} />
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{v.description}</p>
          </button>
        );
      })}
    </div>
  );
}

function PreviewButton({ voiceId, voiceName }: { voiceId: string; voiceName: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  return (
    <>
      <audio ref={audioRef} src={getPreviewUrl(voiceId)} preload="none" />
      <button
        type="button"
        onClick={play}
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-amber-100 hover:text-amber-700"
        aria-label={`Preview ${voiceName}`}
      >
        <Play className="size-4 fill-current" />
      </button>
    </>
  );
}
