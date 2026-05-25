import { TypingTextDisplay } from "../Lessons/Practise";

export function TextDisplayContainer({
  lessonText,
  typingState,
  containerRef,
  onKeyDown,
  variant = "solo", // "solo" or "multiplayer"
  isInputEnabled = true,
  ariaLabel = "",
}) {
  const baseClasses = "outline-none cursor-text";

  const variantClasses = {
    solo: "rounded-2xl p-10 bg-slate-100 dark:bg-[#10141b] text-slate-700 dark:text-slate-500 container mx-auto mt-10",
    multiplayer:
      "min-h-0 flex-1 overflow-y-auto hidden-scrollbar p-4 text-slate-500 sm:p-6",
  };

  const focusClasses =
    variant === "multiplayer" && isInputEnabled
      ? "ring-1 ring-emerald-400/30"
      : "";

  const containerClasses = [
    baseClasses,
    variantClasses[variant] || variantClasses.solo,
    focusClasses,
  ]
    .filter(Boolean)
    .join(" ");

  const tabIndex =
    variant === "multiplayer" && isInputEnabled
      ? 0
      : variant === "multiplayer"
        ? -1
        : 0;

  const ariaProps = ariaLabel ? { "aria-label": ariaLabel } : {};

  return (
    <div
      ref={containerRef}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      className={containerClasses}
      {...ariaProps}
    >
      <TypingTextDisplay
        lessonText={lessonText}
        typingState={typingState}
        className={
          variant === "multiplayer"
            ? "text-2xl leading-relaxed md:text-3xl"
            : ""
        }
      />
    </div>
  );
}
