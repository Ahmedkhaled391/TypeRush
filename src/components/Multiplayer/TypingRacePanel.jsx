import { useEffect, useRef } from "react";
import Stats from "../Lessons/Stats";
import { TextDisplayContainer } from "../ui/TextDisplayContainer";
import { createInitialTypingState } from "../../services/typingMetrics";

function formatPressedKey(key) {
  if (!key) return "None";
  if (key === " ") return "Space";
  return key;
}

function TypingRacePanel({
  playerName = "Player",
  lessonText = "",
  typingState,
  isLocalPlayer = false,
  isInputEnabled = false,
  onTypingChange,
  statusLabel = "Waiting",
}) {
  const panelRef = useRef(null);
  const safeState = createInitialTypingState(typingState);

  useEffect(() => {
    if (isLocalPlayer && isInputEnabled) {
      panelRef.current?.focus();
    }
  }, [isInputEnabled, isLocalPlayer]);

  useEffect(() => {
    const panel = panelRef.current;
    const cursor = panel?.querySelector('[data-typing-cursor="true"]');
    if (!panel || !cursor) return;

    const panelRect = panel.getBoundingClientRect();
    const cursorRect = cursor.getBoundingClientRect();
    const cursorTop = cursorRect.top - panelRect.top + panel.scrollTop;
    const targetTop = Math.max(0, cursorTop - panel.clientHeight / 2);
    panel.scrollTo({ top: targetTop, behavior: "smooth" });
  }, [safeState.currentCharIndex, safeState.typedText, lessonText]);

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200/70 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#10141b] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
      <header className="shrink-0 border-b border-slate-200/70 bg-white/90 p-3 sm:p-4 dark:border-white/10 dark:bg-transparent">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
              {isLocalPlayer ? "Local Player" : "Opponent"}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-brand-heading">
              {playerName}
            </h2>
          </div>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-vibrant-mint-green">
            {statusLabel}
          </span>
        </div>

        <Stats
          title=""
          wpm={safeState.wpm}
          accuracy={safeState.accuracy}
          progress={safeState.progress}
          compact
        />

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/5 p-2">
            <p className="text-xs text-brand-muted">Position</p>
            <p className="mt-1 text-lg font-bold text-brand-heading">
              {safeState.currentCharIndex}/{lessonText.length}
            </p>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <p className="text-xs text-brand-muted">Key</p>
            <p className="mt-1 truncate text-lg font-bold text-brand-heading">
              {formatPressedKey(safeState.pressedKey)}
            </p>
          </div>
        </div>
      </header>

      <TextDisplayContainer
        lessonText={lessonText}
        typingState={safeState}
        containerRef={panelRef}
        onKeyDown={isLocalPlayer && isInputEnabled ? onTypingChange : undefined}
        variant="multiplayer"
        isInputEnabled={isLocalPlayer && isInputEnabled}
        ariaLabel={`${playerName} typing race panel`}
      />
    </article>
  );
}

export default TypingRacePanel;
