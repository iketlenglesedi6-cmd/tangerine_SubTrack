export function InlineFeedback({
  message,
  tone = "neutral",
  className = "",
}: {
  message: string;
  tone?: "neutral" | "error" | "success";
  className?: string;
}) {
  const toneClassName = {
    neutral: "text-[#57534E]",
    error: "text-red-800",
    success: "text-emerald-900",
  }[tone];

  return (
    <p role="status" aria-live="polite" className={`text-sm ${toneClassName} ${className}`}>
      {message}
    </p>
  );
}
