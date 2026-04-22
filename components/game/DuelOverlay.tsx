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
  return (
    <div className="pointer-events-none absolute inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
      <div className="absolute top-[14%] rounded-xl border border-white/20 bg-black/70 px-8 py-3 text-4xl font-black text-white shadow-2xl">
        {outcomeText(outcome)}
      </div>
      <div className="grid w-full max-w-6xl grid-cols-2 gap-8 px-10">
        <OverlayCard card={playerCard} highlight={outcome === "player"} color="red" />
        <OverlayCard card={enemyCard} highlight={outcome === "enemy"} color="yellow" />
      </div>
    </div>
  );
}

function OverlayCard({ card, highlight, color }: { card: CardDefinition; highlight: boolean; color: "red" | "yellow" }) {
  const tone = color === "red" ? "border-red-500/50" : "border-yellow-500/50";
  return (
    <div className={`rounded-2xl border bg-zinc-950/95 p-5 shadow-[0_0_30px_rgba(0,0,0,0.45)] ${tone} ${highlight ? "scale-105" : "opacity-75"}`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="rounded-md border border-white/10 bg-black/30 px-3 py-1 text-2xl font-black">{card.order}</div>
        <div className="text-xs font-black tracking-[0.18em] text-zinc-400">{card.groupLabel}</div>
      </div>
      <div className="mb-3 text-3xl font-black text-white">{card.title}</div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {card.tags.map((tag) => (
          <span key={`${card.id}-${tag}`} className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-[11px] font-bold text-zinc-200">{tag}</span>
        ))}
      </div>
      <div className="text-sm leading-6 text-zinc-300">{card.description}</div>
    </div>
  );
}
