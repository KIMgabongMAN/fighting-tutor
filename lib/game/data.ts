import type {
  CardDefinition,
  PhaseId,
  PhaseTone,
  PlayerRoleInPhase,
} from "@/lib/game/types";

export const GRID_COLS = 9;
export const GRID_ROWS = 4;
export const GRID_ROW_LABELS = ["H", "A", "M", "G"] as const;

export const TOTAL_HEARTS = 4;
export const TOTAL_HEARTS_HALF = TOTAL_HEARTS * 2;

export const PHASE_META: Record<
  PhaseId,
  {
    label: string;
    tone: PhaseTone;
  }
> = {
  opening: { label: "개막", tone: "system" },
  closeNeutral: { label: "근거리 교전", tone: "neutral" },
  midNeutral: { label: "중거리 교전", tone: "neutral" },
  farNeutral: { label: "원거리 교전", tone: "neutral" },
  pressure: { label: "압박 상황", tone: "advantage" },
  hardDown: { label: "하드 다운", tone: "danger" },
  combo: { label: "콤보 상황", tone: "advantage" },
};

export const FORCED_VULNERABLE_CARD: CardDefinition = {
  id: "forced_vulnerable",
  phase: "universal",
  role: "universal",
  order: "X",
  title: "무방비",
  description: "후딜이 길게 남아 아무 행동도 하지 못한다.",
  tags: [],
  color: "gray",
  groupLabel: "강제",
  baseWeight: 0,
  advance: 0,
  push: 0,
  successOutcome: "neutralByDistance",
  rangeMin: -1,
  rangeMax: -1,
  targetRows: [],
  damageHalf: 0,
};

export const UNIVERSAL_BURST_CARD: CardDefinition = {
  id: "universal_burst",
  phase: "universal",
  role: "universal",
  order: "B",
  title: "버스트",
  description: "한 게임에 한 번, 현재 장면을 끊고 거리를 크게 벌린다.",
  tags: ["버스트", "무적"],
  color: "blue",
  groupLabel: "특수",
  baseWeight: 2,
  advance: 0,
  push: 2,
  successOutcome: "neutralByDistance",
  rangeMin: -1,
  rangeMax: -1,
  targetRows: [],
  damageHalf: 0,
};

export const UNIVERSAL_AWAKENING_CARD: CardDefinition = {
  id: "universal_awakening_super",
  phase: "universal",
  role: "universal",
  order: "A",
  title: "각성 필살기",
  description: "텐션 50을 소모하는 고위력 무적기. 승리하지 못하면 다음 턴 무방비.",
  tags: ["무적", "중단", "지상", "근거리 공격", "캔슬불가"],
  color: "gold",
  groupLabel: "각성",
  baseWeight: 3,
  advance: 0,
  push: 1,
  successOutcome: "neutralByDistance",
  rangeMin: 0,
  rangeMax: 2,
  targetRows: ["M", "G"],
  nextPose: "stand",
  tensionCost: 50,
  damageHalf: 2,
};

const OPENING_NEUTRAL: CardDefinition[] = [
  {
    id: "opening_dash",
    phase: "opening",
    role: "neutral",
    order: "01",
    title: "지상 접근",
    description: "지상으로 빠르게 접근하며 견제를 시작한다.",
    tags: ["뉴트럴", "대쉬", "지상", "딜레이"],
    color: "red",
    groupLabel: "격투",
    baseWeight: 14,
    advance: 2,
    push: 0,
    successOutcome: "neutralByDistance",
    rangeMin: -1,
    rangeMax: -1,
    targetRows: [],
    nextPose: "stand",
    damageHalf: 0,
  },
  {
    id: "opening_mid_poke",
    phase: "opening",
    role: "neutral",
    order: "02",
    title: "중거리 견제",
    description: "중거리에서 안정적인 찌르기 견제.",
    tags: ["뉴트럴", "지상", "중단", "중거리 공격"],
    color: "orange",
    groupLabel: "격투",
    baseWeight: 15,
    advance: 0,
    push: 0,
    successOutcome: "pressure",
    rangeMin: 2,
    rangeMax: 4,
    targetRows: ["M", "G"],
    nextPose: "stand",
    damageHalf: 1,
  },
  {
    id: "opening_wait",
    phase: "opening",
    role: "neutral",
    order: "03",
    title: "대기",
    description: "상대의 행동을 관찰하며 다음 기회를 노린다.",
    tags: ["뉴트럴", "수비", "지상"],
    color: "blue",
    groupLabel: "격투",
    baseWeight: 12,
    advance: 0,
    push: 1,
    successOutcome: "neutralByDistance",
    rangeMin: -1,
    rangeMax: -1,
    targetRows: [],
    nextPose: "stand",
    damageHalf: 0,
  },
  {
    id: "opening_backstep",
    phase: "opening",
    role: "neutral",
    order: "04",
    title: "회피",
    description: "뒤로 물러나 거리를 다시 정리한다.",
    tags: ["뉴트럴", "거리조절", "지상"],
    color: "gray",
    groupLabel: "격투",
    baseWeight: 10,
    advance: -1,
    push: 0,
    successOutcome: "neutralByDistance",
    rangeMin: -1,
    rangeMax: -1,
    targetRows: [],
    nextPose: "stand",
    damageHalf: 0,
  },
];

const CLOSE_NEUTRAL: CardDefinition[] = [
  {
    id: "close_slash",
    phase: "closeNeutral",
    role: "neutral",
    order: "01",
    title: "근거리 공격",
    description: "붙은 거리에서 가장 직선적인 타격.",
    tags: ["뉴트럴", "지상", "중단", "근거리 공격"],
    color: "red",
    groupLabel: "격투",
    baseWeight: 15,
    advance: 0,
    push: 0,
    successOutcome: "pressure",
    rangeMin: 0,
    rangeMax: 1,
    targetRows: ["M", "G"],
    nextPose: "stand",
    damageHalf: 1,
  },
  {
    id: "close_low",
    phase: "closeNeutral",
    role: "neutral",
    order: "02",
    title: "하단 공격",
    description: "낮은 타점으로 숙이기와 발을 긁는다.",
    tags: ["뉴트럴", "지상", "하단", "근거리 공격"],
    color: "orange",
    groupLabel: "격투",
    baseWeight: 11,
    advance: 0,
    push: 0,
    successOutcome: "pressure",
    rangeMin: 0,
    rangeMax: 1,
    targetRows: ["G"],
    nextPose: "crouch",
    damageHalf: 1,
  },
  {
    id: "close_throw",
    phase: "closeNeutral",
    role: "neutral",
    order: "03",
    title: "영거리 잡기",
    description: "붙은 거리에서만 성립하는 특수 선택지.",
    tags: ["선공", "지상", "잡기"],
    color: "gold",
    groupLabel: "격투",
    baseWeight: 9,
    advance: 0,
    push: 0,
    successOutcome: "hardDown",
    rangeMin: 0,
    rangeMax: 0,
    targetRows: ["M", "G"],
    nextPose: "stand",
    damageHalf: 1,
  },
  {
    id: "close_jump",
    phase: "closeNeutral",
    role: "neutral",
    order: "04",
    title: "점프 접근",
    description: "공중으로 올라가 지상 선택을 비튼다.",
    tags: ["공중", "대쉬"],
    color: "gray",
    groupLabel: "격투",
    baseWeight: 10,
    advance: 1,
    push: 0,
    successOutcome: "neutralByDistance",
    rangeMin: -1,
    rangeMax: -1,
    targetRows: [],
    nextPose: "air",
    damageHalf: 0,
  },
];

const MID_NEUTRAL = OPENING_NEUTRAL;
const FAR_NEUTRAL = OPENING_NEUTRAL;
const PRESSURE_ATTACKER = CLOSE_NEUTRAL;
const PRESSURE_DEFENDER = OPENING_NEUTRAL;
const HARDDOWN_ATTACKER = CLOSE_NEUTRAL;
const HARDDOWN_DEFENDER = OPENING_NEUTRAL;
const COMBO_ATTACKER = CLOSE_NEUTRAL;
const COMBO_DEFENDER = OPENING_NEUTRAL;

export function getCardsForPhase(phase: PhaseId, role: PlayerRoleInPhase): CardDefinition[] {
  if (phase === "opening") return OPENING_NEUTRAL;
  if (phase === "closeNeutral") return CLOSE_NEUTRAL;
  if (phase === "midNeutral") return MID_NEUTRAL;
  if (phase === "farNeutral") return FAR_NEUTRAL;
  if (phase === "pressure") return role === "attacker" ? PRESSURE_ATTACKER : PRESSURE_DEFENDER;
  if (phase === "hardDown") return role === "attacker" ? HARDDOWN_ATTACKER : HARDDOWN_DEFENDER;
  if (phase === "combo") return role === "attacker" ? COMBO_ATTACKER : COMBO_DEFENDER;
  return OPENING_NEUTRAL;
}
