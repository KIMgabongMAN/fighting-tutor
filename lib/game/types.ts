export type PhaseTone = "neutral" | "danger" | "advantage" | "system";

export type PhaseId =
  | "opening"
  | "closeNeutral"
  | "midNeutral"
  | "farNeutral"
  | "pressure"
  | "guard"
  | "hardDown"
  | "combo";

export type PlayerRoleInPhase = "neutral" | "attacker" | "defender";
export type OpponentPersonality = "balanced" | "defensive" | "aggressive";
export type DuelOutcome = "player" | "enemy" | "none";

export type CardTag =
  | "수비"
  | "잡기"
  | "무적"
  | "공중"
  | "지상"
  | "하단"
  | "중단"
  | "이지선다"
  | "캔슬불가"
  | "버스트"
  | "거리조절"
  | "대쉬"
  | "뉴트럴"
  | "선공"
  | "딜레이"
  | "근거리 공격"
  | "중거리 공격"
  | "원거리 공격"
  | "콤보"
  | "다운";

export type SuccessOutcome =
  | "pressure"
  | "combo"
  | "hardDown"
  | "neutralByDistance"
  | "samePhase";

export type CardDefinition = {
  id: string;
  phase: PhaseId | "universal";
  role: PlayerRoleInPhase | "universal";
  order: string;
  title: string;
  description: string;
  tags: CardTag[];
  color: "red" | "orange" | "gold" | "blue" | "gray";
  groupLabel: string;
  baseWeight: number;
  attackPower: number;
  grabDamage: number;
  advance: number;
  push: number;
  successOutcome: SuccessOutcome;
};

export type GameState = {
  playerHp: number;
  enemyHp: number;
  playerTension: number;
  enemyTension: number;
  playerTile: number;
  enemyTile: number;
  phase: PhaseId;
  playerRoleInPhase: PlayerRoleInPhase;
  playerStateText: string;
  enemyStateText: string;
  message: string;
  commentary: string;
  turn: number;
  round: number;
  effectText: string;
  enemyPersonality: OpponentPersonality;
  lastPlayerCardId: string | null;
  lastEnemyCardId: string | null;
  playerBurstUsed: boolean;
  enemyBurstUsed: boolean;
};

export type TurnRecord = {
  turn: number;
  phaseLabel: string;
  playerCardTitle: string;
  enemyCardTitle: string;
  outcome: DuelOutcome;
  playerHpBefore: number;
  playerHpAfter: number;
  enemyHpBefore: number;
  enemyHpAfter: number;
  distanceBefore: string;
  distanceAfter: string;
  note: string;
};

export type PhaseBannerState = {
  id: number;
  text: string;
  tone: PhaseTone;
};

export type DuelOverlayState = {
  playerCard: CardDefinition;
  enemyCard: CardDefinition;
  outcome: DuelOutcome;
};

export type GameContext = {
  currentState: GameState;
  playerCard: CardDefinition;
  enemyCard: CardDefinition;
};

export type ResolutionResult = {
  nextPlayerHp: number;
  nextEnemyHp: number;
  nextPlayerTension: number;
  nextEnemyTension: number;
  nextPlayerTile: number;
  nextEnemyTile: number;
  nextPhase: PhaseId;
  nextPlayerRoleInPhase: PlayerRoleInPhase;
  nextPlayerStateText: string;
  nextEnemyStateText: string;
  message: string;
  commentary: string;
  effectText?: string;
  duelOutcome: DuelOutcome;
};

export type WeightedPickArgs = {
  cards: CardDefinition[];
  state: GameState;
  role: PlayerRoleInPhase;
  personality: OpponentPersonality;
};