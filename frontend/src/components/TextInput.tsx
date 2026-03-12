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
  "data-testid"?: string;
}

export function TextInput({
  value,
  onChange,
  placeholder = "Paste your text here or upload a file...",
  disabled,
  className,
  "data-testid": testId,
}: TextInputProps) {
  const wordCount = countWords(value);
  const overLimit = wordCount > MAX_WORDS;

  return (
    <div className={cn("space-y-1", className)}>
      <textarea
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={8}
        className={cn(
          "w-full rounded-xl border bg-white/80 px-4 py-3 text-base transition-colors placeholder:text-muted-foreground/70",
          "focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400",
          "disabled:cursor-not-allowed disabled:opacity-60",
          overLimit ? "border-red-400" : "border-stone-200"
        )}
      />
      <p
        className={cn(
          "text-sm tabular-nums",
          overLimit ? "text-red-600 font-medium" : "text-muted-foreground"
        )}
      >
        {wordCount.toLocaleString()} / {MAX_WORDS.toLocaleString()} words
      </p>
    </div>
  );
}

export { MAX_WORDS, countWords };
