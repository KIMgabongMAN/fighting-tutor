import { ActionCard } from "@/components/game/ActionCard";
import type { CardDefinition } from "@/lib/game/types";

type Props = {
  title: string;
  description: string;
  cards: CardDefinition[];
  onSelect: (card: CardDefinition) => void;
  disabled?: boolean;
};

export function ActionCardRow({
  title,
  description,
  cards,
  onSelect,
  disabled = false,
}: Props) {
  return (
    <section className="relative z-30 overflow-visible border border-zinc-700 bg-zinc-950/80 shadow-lg">
      <div className="border-b border-zinc-800 bg-black/30 px-4 py-3 sm:px-5">
        <div className="mb-1 text-lg font-black text-yellow-100">{title}</div>
        <div className="text-xs text-zinc-400 sm:text-sm">{description}</div>
      </div>

      <div className="overflow-x-auto p-4">
        <div className="flex min-w-max gap-4 pb-1">
          {cards.map((card) => (
            <ActionCard
              key={card.id}
              card={card}
              onSelect={onSelect}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </section>
  );
}