import type { ActionDefinition } from "./types";

export const ACTIONS: ActionDefinition[] = [
  {
    id: "wait",
    title: "대기",
    kind: "system",
    startup: 0,
    active: 0,
    recovery: 6,
    moveX: 0,
    rangeMin: -1,
    rangeMax: -1,
    damage: 0,
    hitstun: 0,
    description: "아무 행동도 하지 않고 상대를 본다."
  },
  {
    id: "forward_step",
    title: "앞걸음",
    kind: "move",
    startup: 0,
    active: 0,
    recovery: 4,
    moveX: 1,
    rangeMin: -1,
    rangeMax: -1,
    damage: 0,
    hitstun: 0,
    description: "한 칸 전진한다."
  },
  {
    id: "back_step",
    title: "뒷걸음",
    kind: "move",
    startup: 0,
    active: 0,
    recovery: 4,
    moveX: -1,
    rangeMin: -1,
    rangeMax: -1,
    damage: 0,
    hitstun: 0,
    description: "한 칸 후퇴한다."
  },
  {
    id: "jab",
    title: "근거리 견제",
    kind: "attack",
    startup: 4,
    active: 2,
    recovery: 7,
    moveX: 0,
    rangeMin: 0,
    rangeMax: 1,
    hitLevel: "mid",
    damage: 12,
    hitstun: 10,
    description: "빠르지만 짧은 근거리 타격."
  },
  {
    id: "far_slash",
    title: "중거리 공격",
    kind: "attack",
    startup: 8,
    active: 3,
    recovery: 12,
    moveX: 0,
    rangeMin: 2,
    rangeMax: 4,
    hitLevel: "mid",
    damage: 18,
    hitstun: 14,
    description: "중거리에서 강한 견제를 건다."
  },
  {
    id: "low_kick",
    title: "하단 견제",
    kind: "attack",
    startup: 6,
    active: 2,
    recovery: 9,
    moveX: 0,
    rangeMin: 0,
    rangeMax: 2,
    hitLevel: "low",
    damage: 10,
    hitstun: 9,
    description: "빠른 하단 견제."
  },
  {
    id: "throw",
    title: "잡기",
    kind: "attack",
    startup: 5,
    active: 1,
    recovery: 18,
    moveX: 0,
    rangeMin: 0,
    rangeMax: 0,
    hitLevel: "throw",
    damage: 20,
    hitstun: 16,
    knockdown: true,
    description: "붙어 있을 때만 성립하는 잡기."
  },
  {
    id: "guard",
    title: "가드",
    kind: "defense",
    startup: 1,
    active: 20,
    recovery: 4,
    moveX: 0,
    rangeMin: -1,
    rangeMax: -1,
    damage: 0,
    hitstun: 0,
    description: "일반 타격을 막는다."
  },
  {
    id: "jump",
    title: "점프",
    kind: "move",
    startup: 3,
    active: 10,
    recovery: 6,
    moveX: 0,
    rangeMin: -1,
    rangeMax: -1,
    damage: 0,
    hitstun: 0,
    airborne: true,
    description: "점프해서 지상 잡기와 일부 하단을 피한다."
  },
  {
    id: "dp",
    title: "무적기",
    kind: "attack",
    startup: 5,
    active: 3,
    recovery: 20,
    moveX: 0,
    rangeMin: 0,
    rangeMax: 2,
    hitLevel: "mid",
    damage: 24,
    hitstun: 20,
    invincibleFrames: 5,
    description: "초반 무적이 있는 반격기. 막히거나 빗나가면 위험하다."
  }
];

export function getActionById(id: string) {
  const action = ACTIONS.find((item) => item.id === id);
  if (!action) {
    throw new Error(`Unknown action id: ${id}`);
  }
  return action;
}