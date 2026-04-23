export type PoseState = "stand" | "crouch" | "air" | "down";

export type FlowState =
  | "neutral"
  | "pressure"
  | "hit"
  | "combo"
  | "harddown"
  | "wakeup"
  | "vulnerable";

export type HitLevel = "mid" | "low" | "throw";
export type ActionKind = "move" | "attack" | "defense" | "system";

export type FighterState = {
  name: string;
  hp: number;
  x: number;
  pose: PoseState;
  flow: FlowState;
  hitstun: number;
  recoveryLock: number;
  vulnerable: boolean;
  airborne: boolean;
  knockedDown: boolean;
};

export type ActionDefinition = {
  id: string;
  title: string;
  kind: ActionKind;
  startup: number;
  active: number;
  recovery: number;
  moveX: number;
  rangeMin: number;
  rangeMax: number;
  hitLevel?: HitLevel;
  damage: number;
  hitstun: number;
  knockdown?: boolean;
  airborne?: boolean;
  invincibleFrames?: number;
  description: string;
};

export type RuntimeAction = {
  def: ActionDefinition;
  owner: "player" | "enemy";
  connected: boolean;
};

export type TimelineEvent = {
  frame: number;
  text: string;
};

export type ResolveResult = {
  player: FighterState;
  enemy: FighterState;
  events: TimelineEvent[];
  winner: "player" | "enemy" | "draw" | "none";
};