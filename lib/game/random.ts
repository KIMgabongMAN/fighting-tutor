import type { CardDefinition, OpponentPersonality, WeightedPickArgs } from "@/lib/game/types";

function hasAttackLike(card: CardDefinition) {
  return card.tags.some((tag) => tag.includes("공격"));
}

function personalityBonus(card: CardDefinition, personality: OpponentPersonality) {
  if (personality === "defensive") {
    let bonus = 0;
    if (card.tags.includes("수비")) bonus += 5;
    if (card.tags.includes("거리조절")) bonus += 3;
    if (card.tags.includes("무적")) bonus -= 1;
    if (hasAttackLike(card)) bonus -= 1;
    return bonus;
  }

  if (personality === "aggressive") {
    let bonus = 0;
    if (hasAttackLike(card)) bonus += 4;
    if (card.tags.includes("대쉬")) bonus += 3;
    if (card.tags.includes("수비")) bonus -= 2;
    return bonus;
  }

  return 0;
}

function situationalBonus(args: WeightedPickArgs, card: CardDefinition) {
  const { state, role } = args;
  let bonus = 0;
  const gap = Math.max(0, state.enemyX - state.playerX - 1);

  if (gap >= 5) {
    if (card.tags.includes("원거리 공격")) bonus += 3;
    if (card.tags.includes("대쉬")) bonus += 4;
  }

  if (gap <= 1) {
    if (card.tags.includes("잡기")) bonus += 3;
    if (card.tags.includes("근거리 공격")) bonus += 2;
  }

  if (state.playerPose === "air" && card.tags.includes("대공")) {
    bonus += 4;
  }

  if (state.phase === "pressure" && role === "defender") {
    if (card.tags.includes("수비")) bonus += 4;
    if (card.tags.includes("무적")) bonus += 1;
  }

  if (card.tags.includes("버스트")) {
    if (state.phase === "combo") bonus += 8;
    else bonus -= 2;
  }

  return bonus;
}

function computeWeight(args: WeightedPickArgs, card: CardDefinition) {
  return Math.max(1, card.baseWeight + personalityBonus(card, args.personality) + situationalBonus(args, card));
}

export function pickWeightedRandomCard(args: WeightedPickArgs) {
  const weighted = args.cards.map((card) => ({ card, weight: computeWeight(args, card) }));
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;

  for (const item of weighted) {
    roll -= item.weight;
    if (roll <= 0) return item.card;
  }

  return weighted[weighted.length - 1].card;
}
