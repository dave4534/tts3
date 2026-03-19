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
  placeholder = "Paste your text here...",
  disabled,
  className,
  "data-testid": testId,
}: TextInputProps) {
  const wordCount = countWords(value);
  const overLimit = wordCount > MAX_WORDS;

  return (
    <div className={cn("relative", className)}>
      <textarea
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={8}
        className={cn(
          "w-full rounded-xl border bg-white px-4 py-3 pr-32 text-base transition-colors placeholder:text-stone-400",
          "focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400",
          "disabled:cursor-not-allowed disabled:opacity-60",
          overLimit ? "border-red-400" : "border-stone-200"
        )}
      />
      <p
        className={cn(
          "absolute bottom-3 right-3 text-sm tabular-nums",
          overLimit ? "text-red-600 font-medium" : "text-stone-500"
        )}
      >
        {wordCount.toLocaleString()} / {MAX_WORDS.toLocaleString()} words
      </p>
    </div>
  );
}

export { MAX_WORDS, countWords };
