import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { FilePlus } from "lucide-react";

const MAX_MB = 10;
const ACCEPT = ".txt,.pdf";

interface FileUploadProps {
  onFileSelect: (file: File, text: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  onError,
  disabled,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      if (file.size > MAX_MB * 1024 * 1024) {
        onError(`File too large. Please upload a file under ${MAX_MB} MB.`);
        return;
      }

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "txt" && ext !== "pdf") {
        onError("Please upload a .txt or .pdf file.");
        return;
      }

      if (ext === "txt") {
        const reader = new FileReader();
        reader.onload = () => {
          onFileSelect(file, reader.result as string);
        };
        reader.onerror = () => {
          onError("We couldn't read the file. Try pasting the text directly.");
        };
        reader.readAsText(file);
      } else {
        onFileSelect(file, "");
      }
    },
    [onFileSelect, onError]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";
      processFile(file);
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [disabled, processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  return (
    <div
      data-upload-zone
      className={cn(
        "fixed left-4 right-4 z-[9] flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-6 transition-colors min-[600px]:left-6 min-[600px]:right-[calc(20rem+1.5rem)] lg:right-[calc(24rem+1.5rem)]",
        "cursor-pointer hover:border-opacity-80",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
      style={{
        bottom: "calc(52px + 40px)",
        backgroundColor: isDragging ? "var(--app-upload-zone-bg-drag)" : "var(--app-upload-zone-bg)",
        borderColor: isDragging ? "var(--app-upload-zone-border-drag)" : "var(--app-upload-zone-border)",
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />
      <div
        className="flex size-12 items-center justify-center rounded-lg"
        style={{ backgroundColor: "var(--app-surface)", color: "var(--app-text)" }}
      >
        <FilePlus className="size-6" strokeWidth={2} />
      </div>
      <p className="text-center text-sm font-semibold" style={{ color: "var(--app-text)" }}>
        Click to upload, or drag and drop
      </p>
      <p className="text-center text-sm" style={{ color: "var(--app-text-muted)" }}>
        .txt or .pdf files up to {MAX_MB}MB each
      </p>
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>
          or
        </span>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
        disabled={disabled}
        className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
        style={{
          borderColor: "var(--app-border)",
          color: "var(--app-text)",
        }}
      >
        Choose file
      </button>
    </div>
  );
}
