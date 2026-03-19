interface ConvertingSpinnerProps {
  progress: number;
  className?: string;
}

export function ConvertingSpinner({ progress, className }: ConvertingSpinnerProps) {
  const size = 24;
  const stroke = 2;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-label={`Converting: ${progress}%`}
    >
      {/* Spinning track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeOpacity={0.25}
        strokeDasharray={`${circumference * 0.25} ${circumference * 0.75}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="animate-spin text-white"
        style={{ animationDuration: "1.2s" }}
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="text-white transition-[stroke-dashoffset] duration-300"
      />
    </svg>
  );
}
