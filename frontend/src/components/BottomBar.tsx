import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/AudioPlayer";
import { cn } from "@/lib/utils";
import { Sparkles, Download } from "lucide-react";
import { useCallback, useState } from "react";

type BottomBarStatus = "idle" | "converting" | "complete";

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

function isWarmingUp(progressState: string, progress: number): boolean {
  return (
    progressState === "queued" ||
    progressState === "warming_up" ||
    (progressState === "processing" && progress === 0)
  );
}

export function BottomBar({
  status,
  canConvert,
  onConvert,
  progress = 0,
  progressState = "queued",
  downloadUrl,
  wordCount = 0,
}: BottomBarProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!downloadUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(downloadUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "speech.mp3";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }, [downloadUrl]);

  const convertingLabel = isWarmingUp(progressState, progress)
    ? "Warming up"
    : `Generating ${progress}%`;

  return (
    <footer
      className={cn(
        "fixed bottom-0 left-0 z-10 shrink-0 border-t right-0 min-[600px]:right-80 lg:right-96 relative"
      )}
      style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-sidebar-bg)" }}
      role="contentinfo"
    >
      {status === "complete" && downloadUrl && (
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          aria-label="Download MP3"
          className="absolute top-6 right-6 shrink-0 p-1 transition-opacity hover:opacity-70 disabled:opacity-50"
          style={{ color: "var(--app-text-muted)" }}
        >
          <Download className="size-5" />
        </button>
      )}
      <div
        className={cn(
          "flex w-full items-center gap-4 px-4 py-3 sm:px-6",
          status === "complete" ? "justify-center" : "justify-end"
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
          <div
            className={cn(
              "relative flex h-9 min-w-[180px] shrink-0 items-center justify-center overflow-hidden rounded-full px-6 text-sm font-medium",
              "bg-teal-600 text-white dark:bg-teal-600"
            )}
          >
            <div
              className="absolute inset-y-0 left-0 bg-teal-500/80 transition-[width] duration-300 ease-out dark:bg-teal-500/80"
              style={{ width: isWarmingUp(progressState, progress) ? "0%" : `${progress}%` }}
            />
            <span className="relative z-10">{convertingLabel}</span>
          </div>
        )}

        {status === "complete" && downloadUrl && (
          <div className="flex w-[80%] max-w-full items-center gap-4">
            <AudioPlayer src={downloadUrl} className="min-w-0 flex-1" />
          </div>
        )}
      </div>
    </footer>
  );
}
