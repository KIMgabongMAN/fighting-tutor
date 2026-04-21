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

export type ResultTag = "승리" | "패배" | "콤보" | "다운";

export type CardTag =
  | "공격"
  | "수비"
  | "잡기"
  | "무적"
  | "프레임트랩"
  | "느림"
  | "빠름"
  | "공중"
  | "지상"
  | "하단"
  | "중단"
  | "이지선다"
  | "개기기"
  | "캔슬불가"
  | "버스트"
  | "거리조절"
  | "접근";

export type OpponentPersonality = "balanced" | "defensive" | "aggressive";

export type CardDefinition = {
  id: string;
  phase: PhaseId;
  role: PlayerRoleInPhase;
  order: string;
  title: string;
  description: string;
  tags: CardTag[];
  resultTags: ResultTag[];
  color: "red" | "orange" | "gold" | "blue" | "gray";
  groupLabel: string;
  baseWeight: number;
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
};

export type PhaseBannerState = {
  id: number;
  text: string;
  tone: PhaseTone;
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
};

export type WeightedPickArgs = {
  cards: CardDefinition[];
  state: GameState;
  role: PlayerRoleInPhase;
  personality: OpponentPersonality;
};