import type { CardDefinition } from "@/lib/game/types";

type Props = {
  card: CardDefinition;
  onSelect: (card: CardDefinition) => void;
};

const toneClassMap: Record<string, string> = {
  red: "from-red-950 to-zinc-900 border-red-500/40 hover:border-red-400",
  orange: "from-orange-950/80 to-zinc-900 border-orange-500/40 hover:border-orange-400",
  gold: "from-yellow-950/70 to-zinc-900 border-yellow-500/40 hover:border-yellow-400",
  blue: "from-blue-950/60 to-zinc-900 border-blue-500/40 hover:border-blue-400",
  gray: "from-zinc-800 to-zinc-950 border-zinc-600 hover:border-zinc-400",
};

export function ActionCard({ card, onSelect }: Props) {
  const toneClass = toneClassMap[card.color] ?? toneClassMap.gray;

  return (
    <button
      onClick={() => onSelect(card)}
      className={`group w-[260px] shrink-0 border bg-gradient-to-b ${toneClass} p-4 text-left transition hover:-translate-y-1 [clip-path:polygon(0_0,100%_0,96%_100%,0_100%)] sm:w-[300px] sm:p-5`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="border border-white/10 bg-black/30 px-3 py-1 text-lg font-black tracking-[0.12em] text-white">
            {card.order}
          </div>
          <div className="text-[11px] font-black tracking-[0.22em] text-zinc-300 uppercase">{card.groupLabel}</div>
        </div>
        <div className="text-sm font-black text-zinc-400">{card.order}</div>
      </div>

      <div className="mb-3 text-2xl font-black leading-tight text-white">{card.title}</div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {card.tags.map((tag) => (
          <span
            key={`${card.id}-${tag}`}
            className="border border-white/10 bg-black/30 px-2 py-1 text-[11px] font-bold tracking-[0.04em] text-zinc-200"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mb-4 min-h-[132px] text-sm leading-6 text-zinc-200">{card.description}</div>

      <div className="mb-2 text-xs font-black tracking-[0.2em] text-zinc-400">결과 태그</div>

      <div className="flex flex-wrap gap-2">
        {card.resultTags.length > 0 ? (
          card.resultTags.map((tag) => (
            <span
              key={`${card.id}-result-${tag}`}
              className="border border-yellow-500/30 bg-yellow-950/40 px-2 py-1 text-xs font-black tracking-[0.08em] text-yellow-100"
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="border border-zinc-700 bg-black/20 px-2 py-1 text-xs font-black text-zinc-400">
            없음
          </span>
        )}
      </div>
    </button>
  );
}