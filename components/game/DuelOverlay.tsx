import type { CardDefinition, DuelOutcome } from "@/lib/game/types";

type Props = {
  playerCard: CardDefinition;
  enemyCard: CardDefinition;
  outcome: DuelOutcome;
};

function outcomeText(outcome: DuelOutcome) {
  if (outcome === "player") return "Good!";
  if (outcome === "enemy") return "Bad....";
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

  const centerGlowClass =
    outcome === "player"
      ? "duel-win-glow-player"
      : outcome === "enemy"
      ? "duel-win-glow-enemy"
      : "hidden";

  const captionColor =
    outcome === "player"
      ? "text-yellow-200"
      : outcome === "enemy"
      ? "text-red-300"
      : "text-zinc-100";

  return (
    <>
      <style jsx>{`
        @keyframes duelDimIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes duelSpark {
          0%,
          28%,
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          34% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2);
          }
          40% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.9);
          }
          48% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.6);
          }
        }

        @keyframes duelCaptionShow {
          0%,
          72% {
            opacity: 0;
            transform: translateX(-120vw) scale(0.96);
          }
          84% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          96% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(120vw) scale(0.98);
          }
        }

        @keyframes duelLeftWin {
          0% {
            opacity: 0;
            transform: translate(-48vw, 0) scale(0.92) rotate(-12deg);
          }
          30% {
            opacity: 1;
            transform: translate(-10vw, 0) scale(1) rotate(-4deg);
          }
          38% {
            transform: translate(-14vw, -8px) scale(1.02) rotate(-6deg);
          }
          48% {
            transform: translate(-8vw, 0) scale(1) rotate(-2deg);
          }
          70% {
            transform: translate(-50%, 0) scale(1.5) rotate(0deg);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1.5) rotate(0deg);
          }
        }

        @keyframes duelLeftLose {
          0% {
            opacity: 0;
            transform: translate(-48vw, 0) scale(0.92) rotate(-12deg);
          }
          30% {
            opacity: 1;
            transform: translate(-10vw, 0) scale(1) rotate(-4deg);
          }
          38% {
            transform: translate(-14vw, -8px) scale(1.02) rotate(-6deg);
          }
          48% {
            transform: translate(-8vw, 0) scale(1) rotate(-2deg);
          }
          70% {
            opacity: 1;
            transform: translate(-52vw, 0) scale(0.95) rotate(-8deg);
          }
          100% {
            opacity: 0;
            transform: translate(-64vw, 0) scale(0.84) rotate(-12deg);
          }
        }

        @keyframes duelLeftPass {
          0% {
            opacity: 0;
            transform: translate(-48vw, 0) scale(0.92) rotate(-12deg);
          }
          30% {
            opacity: 1;
            transform: translate(-10vw, 0) scale(1) rotate(-4deg);
          }
          38% {
            transform: translate(-14vw, -8px) scale(1.02) rotate(-6deg);
          }
          48% {
            transform: translate(-8vw, 0) scale(1) rotate(-2deg);
          }
          78% {
            opacity: 1;
            transform: translate(-8vw, 0) scale(1) rotate(-2deg);
          }
          100% {
            opacity: 0;
            transform: translate(-24vw, 0) scale(0.9) rotate(-6deg);
          }
        }

        @keyframes duelRightWin {
          0% {
            opacity: 0;
            transform: translate(48vw, 0) scale(0.92) rotate(12deg);
          }
          30% {
            opacity: 1;
            transform: translate(10vw, 0) scale(1) rotate(4deg);
          }
          38% {
            transform: translate(14vw, -8px) scale(1.02) rotate(6deg);
          }
          48% {
            transform: translate(8vw, 0) scale(1) rotate(2deg);
          }
          70% {
            transform: translate(-50%, 0) scale(1.5) rotate(0deg);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1.5) rotate(0deg);
          }
        }

        @keyframes duelRightLose {
          0% {
            opacity: 0;
            transform: translate(48vw, 0) scale(0.92) rotate(12deg);
          }
          30% {
            opacity: 1;
            transform: translate(10vw, 0) scale(1) rotate(4deg);
          }
          38% {
            transform: translate(14vw, -8px) scale(1.02) rotate(6deg);
          }
          48% {
            transform: translate(8vw, 0) scale(1) rotate(2deg);
          }
          70% {
            opacity: 1;
            transform: translate(52vw, 0) scale(0.95) rotate(8deg);
          }
          100% {
            opacity: 0;
            transform: translate(64vw, 0) scale(0.84) rotate(12deg);
          }
        }

        @keyframes duelRightPass {
          0% {
            opacity: 0;
            transform: translate(48vw, 0) scale(0.92) rotate(12deg);
          }
          30% {
            opacity: 1;
            transform: translate(10vw, 0) scale(1) rotate(4deg);
          }
          38% {
            transform: translate(14vw, -8px) scale(1.02) rotate(6deg);
          }
          48% {
            transform: translate(8vw, 0) scale(1) rotate(2deg);
          }
          78% {
            opacity: 1;
            transform: translate(8vw, 0) scale(1) rotate(2deg);
          }
          100% {
            opacity: 0;
            transform: translate(24vw, 0) scale(0.9) rotate(6deg);
          }
        }

        @keyframes duelGlowPlayer {
          0%,
          55% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.7);
          }
          72% {
            opacity: 0.95;
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            opacity: 0.85;
            transform: translate(-50%, -50%) scale(1.45);
          }
        }

        @keyframes duelGlowEnemy {
          0%,
          55% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.7);
          }
          72% {
            opacity: 0.95;
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            opacity: 0.85;
            transform: translate(-50%, -50%) scale(1.45);
          }
        }

        .duel-dim {
          animation: duelDimIn 0.25s ease forwards;
        }

        .duel-spark {
          animation: duelSpark 4.8s ease forwards;
        }

        .duel-caption {
          animation: duelCaptionShow 4.8s cubic-bezier(0.22, 0.9, 0.22, 1) forwards;
        }

        .duel-card-left-win {
          animation: duelLeftWin 4.8s cubic-bezier(0.22, 0.9, 0.22, 1) forwards;
        }

        .duel-card-left-lose {
          animation: duelLeftLose 4.8s cubic-bezier(0.22, 0.9, 0.22, 1) forwards;
        }

        .duel-card-left-pass {
          animation: duelLeftPass 4.8s cubic-bezier(0.22, 0.9, 0.22, 1) forwards;
        }

        .duel-card-right-win {
          animation: duelRightWin 4.8s cubic-bezier(0.22, 0.9, 0.22, 1) forwards;
        }

        .duel-card-right-lose {
          animation: duelRightLose 4.8s cubic-bezier(0.22, 0.9, 0.22, 1) forwards;
        }

        .duel-card-right-pass {
          animation: duelRightPass 4.8s cubic-bezier(0.22, 0.9, 0.22, 1) forwards;
        }

        .duel-win-glow-player {
          animation: duelGlowPlayer 4.8s ease forwards;
        }

        .duel-win-glow-enemy {
          animation: duelGlowEnemy 4.8s ease forwards;
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 z-[80] overflow-hidden">
        <div className="duel-dim absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

        <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 sm:h-[300px] sm:w-[300px]">
          <div
            className={`absolute left-1/2 top-1/2 h-[160px] w-[160px] rounded-full blur-3xl ${
              outcome === "player"
                ? "bg-yellow-400/40"
                : outcome === "enemy"
                ? "bg-red-500/35"
                : "bg-white/10"
            } ${centerGlowClass}`}
          />
        </div>

        <div className="duel-spark absolute left-1/2 top-1/2 h-[160px] w-[160px] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute left-1/2 top-1/2 h-[4px] w-[130px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white sm:w-[180px]" />
          <div className="absolute left-1/2 top-1/2 h-[4px] w-[130px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-white sm:w-[180px]" />
          <div className="absolute left-1/2 top-1/2 h-[4px] w-[90px] -translate-x-1/2 -translate-y-1/2 rotate-[15deg] bg-yellow-300 sm:w-[130px]" />
          <div className="absolute left-1/2 top-1/2 h-[4px] w-[90px] -translate-x-1/2 -translate-y-1/2 -rotate-[20deg] bg-red-400 sm:w-[130px]" />
        </div>

        <div className="absolute left-1/2 top-1/2 z-10 h-0 w-0">
          <div className={`absolute top-1/2 ${leftClass}`}>
            <OverlayCard card={playerCard} side="player" />
          </div>

          <div className={`absolute top-1/2 ${rightClass}`}>
            <OverlayCard card={enemyCard} side="enemy" />
          </div>
        </div>

        <div className="absolute inset-x-0 top-[14%] flex justify-center">
          <div
            className={`duel-caption border px-8 py-3 text-center text-2xl font-black tracking-[0.18em] border-white/30 bg-black/70 ${captionColor} sm:text-4xl`}
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
      className={`w-[230px] -translate-x-1/2 -translate-y-1/2 border p-4 shadow-[0_0_40px_rgba(0,0,0,0.45)] sm:w-[290px] sm:p-5 ${borderTone}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="border border-white/10 bg-black/30 px-3 py-1 text-base font-black text-white sm:text-lg">
          {card.order}
        </div>
        <div className="text-xs font-black tracking-[0.18em] text-zinc-400">{card.groupLabel}</div>
      </div>

      <div className="mb-3 text-xl font-black leading-tight text-white sm:text-2xl">{card.title}</div>

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