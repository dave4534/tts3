import { cn } from "@/lib/utils";

const MAX_WORDS = 20_000;

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  hasDragDropBelow?: boolean;
  "data-testid"?: string;
}

export function TextInput({
  value,
  onChange,
  placeholder = "Paste your text here...",
  disabled,
  className,
  hasDragDropBelow = true,
  "data-testid": testId,
}: TextInputProps) {
  const wordCount = countWords(value);
  const overLimit = wordCount > MAX_WORDS;

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col",
        className
      )}
    >
      <textarea
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          backgroundColor: "transparent",
          color: "var(--app-text)",
          paddingLeft: 0,
          paddingRight: 100,
        }}
        className={cn(
          "textarea-scroll w-full resize-none border-0 px-0 py-3 text-base transition-colors app-placeholder outline-none",
          "placeholder:opacity-70",
          "disabled:cursor-not-allowed disabled:opacity-60",
          hasDragDropBelow ? "absolute inset-0 h-full min-h-0 overflow-y-auto" : "min-h-0 flex-1",
          overLimit && "ring-2 ring-red-400 ring-inset dark:ring-red-500"
        )}
      />
    </div>
  );
}

export { MAX_WORDS, countWords };
