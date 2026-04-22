import type { CardDefinition } from "@/lib/game/types";

type Props = {
  card: CardDefinition;
  onSelect: (card: CardDefinition) => void;
  onHoverCard?: (card: CardDefinition | null) => void;
  disabled?: boolean;
};

const toneClassMap: Record<string, string> = {
  red: "from-red-950 to-zinc-900 border-red-500/40 hover:border-red-400",
  orange:
    "from-orange-950/80 to-zinc-900 border-orange-500/40 hover:border-orange-400",
  gold: "from-yellow-950/70 to-zinc-900 border-yellow-500/40 hover:border-yellow-400",
  blue: "from-blue-950/60 to-zinc-900 border-blue-500/40 hover:border-blue-400",
  gray: "from-zinc-800 to-zinc-950 border-zinc-600 hover:border-zinc-400",
};

function rangeText(card: CardDefinition) {
  if (card.rangeMax < 0) return "비타격";
  return `${card.rangeMin}~${card.rangeMax}`;
}

function rowsText(card: CardDefinition) {
  if (card.targetRows.length === 0) return "없음";
  return card.targetRows.join(",");
}

function poseText(card: CardDefinition) {
  if (!card.nextPose) return "-";
  if (card.nextPose === "stand") return "서기";
  if (card.nextPose === "crouch") return "숙이기";
  return "공중";
}

export function ActionCard({
  card,
  onSelect,
  onHoverCard,
  disabled = false,
}: Props) {
  const toneClass = toneClassMap[card.color] ?? toneClassMap.gray;

  return (
    <button
      type="button"
      onClick={() => onSelect(card)}
      onMouseEnter={() => onHoverCard?.(card)}
      onMouseLeave={() => onHoverCard?.(null)}
      disabled={disabled}
      className={`relative z-40 w-[260px] shrink-0 rounded-md border bg-gradient-to-b ${toneClass} p-4 text-left transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-40 sm:w-[300px] sm:p-5`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-sm border border-white/10 bg-black/30 px-3 py-1 text-lg font-black tracking-[0.12em] text-white">
            {card.order}
          </div>
          <div className="text-[11px] font-black tracking-[0.22em] text-zinc-300 uppercase">
            {card.groupLabel}
          </div>
        </div>

        {card.tensionCost ? (
          <div className="rounded-sm border border-yellow-500/40 bg-yellow-950/40 px-2 py-1 text-[11px] font-black text-yellow-200">
            T {card.tensionCost}
          </div>
        ) : null}
      </div>

      <div className="mb-3 text-2xl font-black leading-tight text-white">
        {card.title}
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {card.tags.map((tag) => (
          <span
            key={`${card.id}-${tag}`}
            className="rounded-sm border border-white/10 bg-black/30 px-2 py-1 text-[11px] font-bold tracking-[0.04em] text-zinc-200"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mb-4 min-h-[90px] text-sm leading-6 text-zinc-200">
        {card.description}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
        <div className="rounded-sm border border-white/10 bg-black/20 px-2 py-1">
          전진: {card.advance > 0 ? `+${card.advance}` : card.advance}
        </div>
        <div className="rounded-sm border border-white/10 bg-black/20 px-2 py-1">
          밀어내기: {card.push > 0 ? `+${card.push}` : card.push}
        </div>
        <div className="rounded-sm border border-white/10 bg-black/20 px-2 py-1">
          공격 범위: {rangeText(card)}
        </div>
        <div className="rounded-sm border border-white/10 bg-black/20 px-2 py-1">
          타격 줄: {rowsText(card)}
        </div>
        <div className="rounded-sm border border-white/10 bg-black/20 px-2 py-1 col-span-2">
          선택 후 자세: {poseText(card)}
        </div>
      </div>
    </button>
  );
}