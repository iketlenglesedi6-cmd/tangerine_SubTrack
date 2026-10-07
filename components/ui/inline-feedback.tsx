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
    error: "rounded-md border border-[#f1d2bd] bg-[#fff1e6] px-3 py-2 text-[#7C2D12]",
    success: "text-emerald-900",
  }[tone];

  return (
    <p role="status" aria-live="polite" className={`text-sm ${toneClassName} ${className}`}>
      {message}
    </p>
  );
}
