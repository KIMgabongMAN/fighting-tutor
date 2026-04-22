import type { CardDefinition, DuelOutcome } from "@/lib/game/types";

type Props = {
  playerCard: CardDefinition;
  enemyCard: CardDefinition;
  outcome: DuelOutcome;
};

function outcomeText(outcome: DuelOutcome) {
  if (outcome === "player") return "GOOD";
  if (outcome === "enemy") return "BAD";
  return "PASS";
}

export function DuelOverlay({ playerCard, enemyCard, outcome }: Props) {
  const leftClass =
    outcome === "player"
      ? "duel-card-left-win"
      : outcome === "enemy"
      ? "duel-card-left-lose"
      : "duel-card-left-pass";

  const rightClass =
    outcome === "enemy"
      ? "duel-card-right-win"
      : outcome === "player"
      ? "duel-card-right-lose"
      : "duel-card-right-pass";

  return (
    <>
      <style jsx>{`
        @keyframes dimIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes cardLeftWin {
          0% { opacity: 0; transform: translate(-44vw, 0) scale(0.92) rotate(-10deg); }
          22% { opacity: 1; transform: translate(-10vw, 0) scale(1) rotate(-4deg); }
          68% { transform: translate(-50%, 0) scale(1.18) rotate(0deg); }
          100% { opacity: 1; transform: translate(-50%, 0) scale(1.18) rotate(0deg); }
        }

        @keyframes cardLeftLose {
          0% { opacity: 0; transform: translate(-44vw, 0) scale(0.92) rotate(-10deg); }
          22% { opacity: 1; transform: translate(-10vw, 0) scale(1) rotate(-4deg); }
          100% { opacity: 0; transform: translate(-62vw, 0) scale(0.8) rotate(-10deg); }
        }

        @keyframes cardLeftPass {
          0% { opacity: 0; transform: translate(-44vw, 0) scale(0.92) rotate(-10deg); }
          22% { opacity: 1; transform: translate(-10vw, 0) scale(1) rotate(-4deg); }
          100% { opacity: 0; transform: translate(-26vw, 0) scale(0.9) rotate(-6deg); }
        }

        @keyframes cardRightWin {
          0% { opacity: 0; transform: translate(44vw, 0) scale(0.92) rotate(10deg); }
          22% { opacity: 1; transform: translate(10vw, 0) scale(1) rotate(4deg); }
          68% { transform: translate(-50%, 0) scale(1.18) rotate(0deg); }
          100% { opacity: 1; transform: translate(-50%, 0) scale(1.18) rotate(0deg); }
        }

        @keyframes cardRightLose {
          0% { opacity: 0; transform: translate(44vw, 0) scale(0.92) rotate(10deg); }
          22% { opacity: 1; transform: translate(10vw, 0) scale(1) rotate(4deg); }
          100% { opacity: 0; transform: translate(62vw, 0) scale(0.8) rotate(10deg); }
        }

        @keyframes cardRightPass {
          0% { opacity: 0; transform: translate(44vw, 0) scale(0.92) rotate(10deg); }
          22% { opacity: 1; transform: translate(10vw, 0) scale(1) rotate(4deg); }
          100% { opacity: 0; transform: translate(26vw, 0) scale(0.9) rotate(6deg); }
        }

        @keyframes captionShow {
          0%, 65% { opacity: 0; transform: translateY(-20px) scale(0.95); }
          76% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(10px) scale(0.98); }
        }

        .dim { animation: dimIn 0.18s ease forwards; }
        .duel-card-left-win { animation: cardLeftWin 2.2s cubic-bezier(0.22, 0.9, 0.22, 1) forwards; }
        .duel-card-left-lose { animation: cardLeftLose 2.2s cubic-bezier(0.22, 0.9, 0.22, 1) forwards; }
        .duel-card-left-pass { animation: cardLeftPass 2.2s cubic-bezier(0.22, 0.9, 0.22, 1) forwards; }
        .duel-card-right-win { animation: cardRightWin 2.2s cubic-bezier(0.22, 0.9, 0.22, 1) forwards; }
        .duel-card-right-lose { animation: cardRightLose 2.2s cubic-bezier(0.22, 0.9, 0.22, 1) forwards; }
        .duel-card-right-pass { animation: cardRightPass 2.2s cubic-bezier(0.22, 0.9, 0.22, 1) forwards; }
        .caption { animation: captionShow 2.2s cubic-bezier(0.22, 0.9, 0.22, 1) forwards; }
      `}</style>

      <div className="pointer-events-none absolute inset-0 z-[120] overflow-hidden">
        <div className="dim absolute inset-0 bg-black/62 backdrop-blur-[1px]" />

        <div className="absolute left-1/2 top-1/2 z-10 h-0 w-0">
          <div className={`absolute top-1/2 ${leftClass}`}>
            <OverlayCard card={playerCard} side="player" />
          </div>

          <div className={`absolute top-1/2 ${rightClass}`}>
            <OverlayCard card={enemyCard} side="enemy" />
          </div>
        </div>

        <div className="absolute inset-x-0 top-[15%] flex justify-center">
          <div
            className={`caption border px-8 py-3 text-center text-2xl font-black tracking-[0.18em] border-white/30 bg-black/75 ${
              outcome === "player"
                ? "text-yellow-200"
                : outcome === "enemy"
                ? "text-red-300"
                : "text-zinc-100"
            } sm:text-4xl`}
          >
            {outcomeText(outcome)}
          </div>
        </div>
      </div>
    </>
  );
}

function OverlayCard({
  card,
  side,
}: {
  card: CardDefinition;
  side: "player" | "enemy";
}) {
  const borderTone =
    side === "player"
      ? "border-yellow-400/60 bg-zinc-950/95"
      : "border-red-400/60 bg-zinc-950/95";

  return (
    <div
      className={`w-[240px] -translate-x-1/2 -translate-y-1/2 border p-4 shadow-[0_0_40px_rgba(0,0,0,0.45)] sm:w-[300px] sm:p-5 ${borderTone}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="border border-white/10 bg-black/30 px-3 py-1 text-base font-black text-white sm:text-lg">
          {card.order}
        </div>
        <div className="text-xs font-black tracking-[0.18em] text-zinc-400">
          {card.groupLabel}
        </div>
      </div>

      <div className="mb-3 text-xl font-black leading-tight text-white sm:text-2xl">
        {card.title}
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {card.tags.slice(0, 4).map((tag) => (
          <span
            key={`${card.id}-${tag}`}
            className="border border-white/10 bg-black/30 px-2 py-1 text-[10px] font-bold text-zinc-200 sm:text-[11px]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="text-xs leading-5 text-zinc-300 sm:text-sm">{card.description}</div>
    </div>
  );
}