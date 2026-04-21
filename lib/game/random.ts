import type { CardDefinition } from "@/lib/game/types";

export function pickRandomCard(cards: CardDefinition[]) {
  const index = Math.floor(Math.random() * cards.length);
  return cards[index];
}