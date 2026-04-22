import { ActionCard } from "@/components/game/ActionCard";
import type { CardDefinition } from "@/lib/game/types";

type Props = {
  title: string;
  description: string;
  cards: CardDefinition[];
  onSelect: (card: CardDefinition) => void;
  onHoverCard?: (card: CardDefinition | null) => void;
  disabled?: boolean;
};

export function ActionCardRow({ title, description, cards, onSelect, onHoverCard, disabled = false }: Props) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-zinc-700 bg-black/80 shadow-2xl">
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
        <div>
          <div className="text-[28px] font-black text-yellow-100">{title}</div>
          <div className="text-sm text-zinc-400">{description}</div>
        </div>
        <div className="rounded-lg border border-zinc-600 bg-zinc-900/80 px-4 py-2 text-sm font-bold text-zinc-200">
          표시 정보
        </div>
      </div>

      <div className="overflow-x-auto p-4">
        <div className="flex min-w-max gap-4 pb-1">
          {cards.map((card) => (
            <ActionCard key={card.id} card={card} onSelect={onSelect} onHoverCard={onHoverCard} disabled={disabled} />
          ))}
        </div>
      </div>
    </section>
  );
}
