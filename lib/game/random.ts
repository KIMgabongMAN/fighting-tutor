import type { CardDefinition, OpponentPersonality, WeightedPickArgs } from "@/lib/game/types";

function personalityBonus(card: CardDefinition, personality: OpponentPersonality) {
  if (personality === "defensive") {
    let bonus = 0;
    if (card.tags.includes("수비")) bonus += 6;
    if (card.tags.includes("거리조절")) bonus += 4;
    if (card.title.includes("관망")) bonus += 5;
    if (card.tags.includes("무적")) bonus -= 1;
    if (card.tags.includes("공격") && !card.tags.includes("무적")) bonus -= 2;
    return bonus;
  }

  if (personality === "aggressive") {
    let bonus = 0;
    if (card.tags.includes("공격")) bonus += 5;
    if (card.tags.includes("프레임트랩")) bonus += 4;
    if (card.tags.includes("접근")) bonus += 4;
    if (card.tags.includes("수비")) bonus -= 3;
    return bonus;
  }

  return 0;
}

function situationalBonus(args: WeightedPickArgs, card: CardDefinition) {
  const { state, role } = args;
  let bonus = 0;

  const gap = Math.max(0, state.enemyTile - state.playerTile - 1);

  if (gap >= 4) {
    if (card.tags.includes("접근")) bonus += 5;
    if (card.tags.includes("공중")) bonus += 2;
    if (card.tags.includes("거리조절")) bonus -= 2;
  }

  if (gap === 0) {
    if (card.tags.includes("잡기")) bonus += 4;
    if (card.tags.includes("프레임트랩")) bonus += 3;
    if (card.tags.includes("거리조절")) bonus += 1;
  }

  if (state.phase === "pressure" && role === "defender") {
    if (card.tags.includes("수비")) bonus += 4;
    if (card.tags.includes("개기기")) bonus += 1;
  }

  if (state.phase === "pressure" && role === "attacker") {
    if (card.tags.includes("프레임트랩")) bonus += 3;
    if (card.tags.includes("잡기")) bonus += 2;
  }

  if (state.phase === "hardDown" && role === "defender" && card.tags.includes("무적")) {
    bonus += 1;
  }

  return bonus;
}

function computeWeight(args: WeightedPickArgs, card: CardDefinition) {
  const raw = card.baseWeight + personalityBonus(card, args.personality) + situationalBonus(args, card);
  return Math.max(1, raw);
}

export function pickWeightedRandomCard(args: WeightedPickArgs) {
  const weighted = args.cards.map((card) => ({
    card,
    weight: computeWeight(args, card),
  }));

  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;

  for (const item of weighted) {
    roll -= item.weight;
    if (roll <= 0) return item.card;
  }

  return weighted[weighted.length - 1].card;
}