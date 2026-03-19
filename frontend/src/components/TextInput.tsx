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
        style={{ backgroundColor: "transparent", color: "var(--app-text)", paddingLeft: 0, paddingRight: 0 }}
        className={cn(
          "textarea-scroll w-full resize-none border-0 px-0 py-3 text-base transition-colors app-placeholder outline-none",
          "placeholder:opacity-70",
          "disabled:cursor-not-allowed disabled:opacity-60",
          overLimit && "ring-2 ring-red-400 ring-inset dark:ring-red-500"
        )}
      />
    </div>
  );
}

export { MAX_WORDS, countWords };
