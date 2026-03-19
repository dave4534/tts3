import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

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
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "w-full",
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-6 transition-colors",
          "cursor-pointer",
          isDragging
            ? "border-teal-400 bg-teal-50/50"
            : "border-stone-300 bg-stone-50/50 hover:border-stone-400",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-teal-100 text-teal-600">
          <Upload className="size-5" />
        </div>
        <p className="text-sm text-stone-600">
          Drag & drop a .txt or .pdf file or{" "}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            disabled={disabled}
            className="font-medium text-teal-600 underline hover:text-teal-700"
          >
            Choose file
          </button>
        </p>
      </div>
    </div>
  );
}
