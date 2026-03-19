import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ConvertingSpinner } from "@/components/ConvertingSpinner";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

type BottomBarStatus = "idle" | "converting" | "complete";

const progressStateLabels: Record<string, string> = {
  queued: "Queued",
  warming_up: "Warming up",
  processing: "Converting",
};

interface BottomBarProps {
  status: BottomBarStatus;
  canConvert: boolean;
  onConvert: () => void;
  progress?: number;
  progressState?: string;
  downloadUrl?: string;
  wordCount?: number;
}

const MAX_WORDS = 20_000;

export function BottomBar({
  status,
  canConvert,
  onConvert,
  progress = 0,
  progressState = "queued",
  downloadUrl,
  wordCount = 0,
}: BottomBarProps) {
  const stateLabel = progressStateLabels[progressState] ?? "Converting";

  return (
    <footer
      className={cn(
        "fixed bottom-0 left-0 z-10 shrink-0 border-t right-0 min-[600px]:right-80 lg:right-96"
      )}
      style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-sidebar-bg)" }}
      role="contentinfo"
    >
      <div
        className={cn(
          "flex w-full items-center gap-4 px-4 py-3 sm:px-6",
          status === "complete" ? "justify-start" : "justify-end"
        )}
      >
        {status === "idle" && (
          <>
            <p
              className="text-sm tabular-nums"
              style={{ color: "var(--app-text-muted)" }}
            >
              {wordCount.toLocaleString()} / {MAX_WORDS.toLocaleString()} words
            </p>
            <Button
            size="lg"
            disabled={!canConvert}
            onClick={onConvert}
            className={cn(
              "h-9 min-w-[180px] rounded-full px-6 text-sm font-medium",
              "bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700"
            )}
          >
            <Sparkles className="mr-2 size-4" />
            Generate Speech
          </Button>
          </>
        )}

        {status === "converting" && (
          <>
            <p
              className="text-sm font-medium min-w-0 truncate"
              style={{ color: "var(--app-text-muted)" }}
            >
              {stateLabel}… {progress}%
            </p>
            <div
              className={cn(
                "flex h-9 min-w-[180px] shrink-0 items-center justify-center rounded-full px-6",
                "bg-teal-600 dark:bg-teal-600"
              )}
            >
              <ConvertingSpinner progress={progress} />
            </div>
          </>
        )}

        {status === "complete" && downloadUrl && (
          <div className="flex w-full min-w-0 flex-1 items-center gap-4">
            <AudioPlayer src={downloadUrl} className="min-w-0 flex-1" />
          </div>
        )}
      </div>
    </footer>
  );
}
