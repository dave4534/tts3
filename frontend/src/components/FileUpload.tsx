import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

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

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";

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

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className={cn(
          "rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700",
          "hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        Upload .txt or .pdf
      </button>
      <span className="text-xs text-muted-foreground">(max {MAX_MB} MB)</span>
    </div>
  );
}
