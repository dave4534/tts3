import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { VoiceSelector } from "@/components/VoiceSelector";
import { Button } from "@/components/ui/button";
import type { Voice } from "@/lib/api";

interface VoiceSheetProps {
  open: boolean;
  onClose: () => void;
  voices: Voice[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onConfirm: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function VoiceSheet({
  open,
  onClose,
  voices,
  selectedId,
  onSelect,
  onConfirm,
  loading,
  disabled,
}: VoiceSheetProps) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        aria-hidden
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-sheet-title"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl shadow-xl transition-transform duration-200 ease-out",
          "bg-[var(--app-sidebar-bg)]"
        )}
        style={{ borderColor: "var(--app-border)" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--app-border)" }}>
          <h2 id="voice-sheet-title" className="text-base font-semibold" style={{ color: "var(--app-text)" }}>
            Choose a voice
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm hover:opacity-80"
            style={{ color: "var(--app-text-muted)" }}
          >
            Cancel
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-safe">
          <VoiceSelector
            voices={voices}
            selectedId={selectedId}
            onSelect={onSelect}
            loading={loading}
            disabled={disabled}
            className="gap-3"
          />
        </div>
        <div className="shrink-0 border-t p-4 pb-safe" style={{ borderColor: "var(--app-border)" }}>
          <Button
            onClick={onConfirm}
            disabled={!selectedId || disabled || (() => {
          const v = voices.find((x) => x.id === selectedId);
          return !v || v.enabled === false || (v.enabled == null && !v.preview_url);
        })()}
            className="w-full rounded-full bg-teal-600 py-6 text-base font-medium text-white hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700"
          >
            Select
          </Button>
        </div>
      </div>
    </>
  );
}
