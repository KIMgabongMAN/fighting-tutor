import type { CardDefinition } from "@/lib/game/types";

type Props = {
  card: CardDefinition;
  onSelect: (card: CardDefinition) => void;
  onHoverCard?: (card: CardDefinition | null) => void;
  disabled?: boolean;
};

const toneClassMap: Record<string, string> = {
  red: "from-red-950/95 to-zinc-950 border-red-500/40 hover:border-red-400",
  orange: "from-orange-950/95 to-zinc-950 border-orange-500/40 hover:border-orange-400",
  gold: "from-yellow-950/80 to-zinc-950 border-yellow-500/40 hover:border-yellow-400",
  blue: "from-blue-950/85 to-zinc-950 border-blue-500/40 hover:border-blue-400",
  gray: "from-zinc-800/95 to-zinc-950 border-zinc-600 hover:border-zinc-400",
};

function rangeText(card: CardDefinition) {
  if (card.rangeMax < 0) return "비타격";
  return `${card.rangeMin}~${card.rangeMax}`;
}

function rowsText(card: CardDefinition) {
  if (card.targetRows.length === 0) return "없음";
  return card.targetRows.join(".");
}

export function ActionCard({ card, onSelect, onHoverCard, disabled = false }: Props) {
  const toneClass = toneClassMap[card.color] ?? toneClassMap.gray;

  return (
    <button
      type="button"
      onClick={() => onSelect(card)}
      onMouseEnter={() => onHoverCard?.(card)}
      onMouseLeave={() => onHoverCard?.(null)}
      disabled={disabled}
      className={`w-[250px] shrink-0 rounded-xl border bg-gradient-to-b ${toneClass} p-4 text-left transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-40`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-md border border-white/10 bg-black/30 px-3 py-1 text-2xl font-black text-white">
            {card.order}
          </div>
          <div className="text-xs font-black tracking-[0.22em] text-zinc-400">{card.groupLabel}</div>
        </div>
        {card.tensionCost ? (
          <div className="rounded-md border border-yellow-500/40 bg-yellow-950/40 px-2 py-1 text-[11px] font-black text-yellow-200">
            T {card.tensionCost}
          </div>
        ) : null}
      </div>

      <div className="mb-2 text-[32px] font-black leading-none text-white">{card.title}</div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {card.tags.map((tag) => (
          <span key={`${card.id}-${tag}`} className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-[11px] font-bold text-zinc-200">
            {tag}
          </span>
        ))}
      </div>

      <p className="mb-4 min-h-[68px] text-sm leading-6 text-zinc-200">{card.description}</p>

      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
        <div className="rounded-md border border-white/10 bg-black/20 px-2 py-2">전진: {card.advance > 0 ? `+${card.advance}` : card.advance}</div>
        <div className="rounded-md border border-white/10 bg-black/20 px-2 py-2">밀어내기: {card.push > 0 ? `+${card.push}` : card.push}</div>
        <div className="rounded-md border border-white/10 bg-black/20 px-2 py-2">공격 범위: {rangeText(card)}</div>
        <div className="rounded-md border border-white/10 bg-black/20 px-2 py-2">타격 줄: {rowsText(card)}</div>
      </div>
    </button>
  );
}
