import type { CardDefinition, PhaseId, PhaseTone, PlayerRoleInPhase } from "@/lib/game/types";
export const GRID_COLS = 9;
export const GRID_ROW_LABELS = ["H", "A", "M", "G"] as const;
export const TOTAL_HEARTS = 4;
export const TOTAL_HEARTS_HALF = TOTAL_HEARTS * 2;
export const PHASE_META: Record<PhaseId, { label: string; tone: PhaseTone }> = {
  opening: { label: "개막", tone: "system" },
  closeNeutral: { label: "근거리 교전", tone: "neutral" },
  midNeutral: { label: "중거리 교전", tone: "neutral" },
  farNeutral: { label: "원거리 교전", tone: "neutral" },
  pressure: { label: "압박 상황", tone: "advantage" },
  guard: { label: "가드 상황", tone: "neutral" },
  hardDown: { label: "하드 다운", tone: "danger" },
  combo: { label: "콤보 상황", tone: "advantage" },
};
export const FORCED_VULNERABLE_CARD: CardDefinition = {
  id: "forced_vulnerable", phase: "universal", role: "universal", order: "X", title: "무방비",
  description: "후딜이 길게 남아 아무 행동도 하지 못한다.", tags: [], color: "gray", groupLabel: "강제",
  baseWeight: 0, advance: 0, push: 0, successOutcome: "neutralByDistance", rangeMin: -1, rangeMax: -1, targetRows: [], damageHalf: 0,
};
export const UNIVERSAL_BURST_CARD: CardDefinition = {
  id: "universal_burst", phase: "universal", role: "universal", order: "B", title: "버스트",
  description: "한 게임에 한 번, 현재 장면을 끊고 거리를 크게 벌린다.", tags: ["버스트", "무적"], color: "blue", groupLabel: "특수",
  baseWeight: 2, advance: 0, push: 2, successOutcome: "neutralByDistance", rangeMin: -1, rangeMax: -1, targetRows: [], damageHalf: 0,
};
export const UNIVERSAL_AWAKENING_CARD: CardDefinition = {
  id: "universal_awakening_super", phase: "universal", role: "universal", order: "A", title: "각성 필살기",
  description: "텐션 50을 소모하는 고위력 무적기. 승리하지 못하면 다음 턴 무방비.", tags: ["무적", "중단", "지상", "근거리 공격", "캔슬불가"],
  color: "gold", groupLabel: "각성", baseWeight: 3, advance: 0, push: 1, successOutcome: "neutralByDistance", rangeMin: 0, rangeMax: 2, targetRows: ["M", "G"], nextPose: "stand", tensionCost: 50, damageHalf: 2,
};
const OPENING: CardDefinition[] = [
  { id:"opening_dash", phase:"opening", role:"neutral", order:"01", title:"지상 접근", description:"지상으로 빠르게 전진하며 공간을 차지한다.", tags:["뉴트럴","대쉬","지상","딜레이"], color:"red", groupLabel:"개막", baseWeight:14, advance:2, push:0, successOutcome:"neutralByDistance", rangeMin:-1, rangeMax:-1, targetRows:[], nextPose:"stand", damageHalf:0},
  { id:"opening_mid_poke", phase:"opening", role:"neutral", order:"02", title:"중거리 견제", description:"중거리에서 먼저 닿는 표준 견제.", tags:["뉴트럴","지상","중단","중거리 공격"], color:"orange", groupLabel:"개막", baseWeight:15, advance:0, push:0, successOutcome:"pressure", rangeMin:2, rangeMax:4, targetRows:["M","G"], nextPose:"stand", damageHalf:1},
  { id:"opening_wait", phase:"opening", role:"neutral", order:"03", title:"대기", description:"쉽게 손을 내밀지 않고 상대 움직임을 본다.", tags:["뉴트럴","수비","지상"], color:"blue", groupLabel:"개막", baseWeight:12, advance:0, push:1, successOutcome:"neutralByDistance", rangeMin:-1, rangeMax:-1, targetRows:[], nextPose:"stand", damageHalf:0},
  { id:"opening_backstep", phase:"opening", role:"neutral", order:"04", title:"회피", description:"뒤로 물러나 거리를 다시 정리한다.", tags:["뉴트럴","거리조절","지상"], color:"gray", groupLabel:"개막", baseWeight:10, advance:-1, push:0, successOutcome:"neutralByDistance", rangeMin:-1, rangeMax:-1, targetRows:[], nextPose:"stand", damageHalf:0},
];
const CLOSE: CardDefinition[] = [
  { id:"close_slash", phase:"closeNeutral", role:"neutral", order:"01", title:"근거리 공격", description:"붙은 거리의 표준 타격.", tags:["뉴트럴","지상","중단","근거리 공격"], color:"red", groupLabel:"교전", baseWeight:15, advance:0, push:0, successOutcome:"pressure", rangeMin:0, rangeMax:1, targetRows:["M","G"], nextPose:"stand", damageHalf:1 },
  { id:"close_low", phase:"closeNeutral", role:"neutral", order:"02", title:"하단 공격", description:"낮은 타점으로 숙이기와 발을 긁는다.", tags:["뉴트럴","지상","하단","근거리 공격"], color:"orange", groupLabel:"교전", baseWeight:11, advance:0, push:0, successOutcome:"pressure", rangeMin:0, rangeMax:1, targetRows:["G"], nextPose:"crouch", damageHalf:1 },
  { id:"close_throw", phase:"closeNeutral", role:"neutral", order:"03", title:"영거리 잡기", description:"붙은 거리에서 성립하는 특수 선택지.", tags:["선공","지상","잡기"], color:"gold", groupLabel:"교전", baseWeight:9, advance:0, push:0, successOutcome:"hardDown", rangeMin:0, rangeMax:0, targetRows:["M","G"], nextPose:"stand", damageHalf:1},
  { id:"close_jump", phase:"closeNeutral", role:"neutral", order:"04", title:"점프 접근", description:"공중으로 올라가 지상 선택을 비튼다.", tags:["공중","대쉬"], color:"gray", groupLabel:"교전", baseWeight:10, advance:1, push:0, successOutcome:"neutralByDistance", rangeMin:-1, rangeMax:-1, targetRows:[], nextPose:"air", damageHalf:0},
  { id:"close_guard", phase:"closeNeutral", role:"neutral", order:"05", title:"가드", description:"근거리 압박을 가장 안전하게 흘린다.", tags:["수비","지상"], color:"blue", groupLabel:"교전", baseWeight:13, advance:0, push:1, successOutcome:"neutralByDistance", rangeMin:-1, rangeMax:-1, targetRows:[], nextPose:"stand", damageHalf:0},
];
const MID: CardDefinition[] = [
  { id:"mid_dash", phase:"midNeutral", role:"neutral", order:"01", title:"지상 접근", description:"중거리에서 근거리 진입을 노린다.", tags:["뉴트럴","대쉬","지상","딜레이"], color:"red", groupLabel:"교전", baseWeight:16, advance:2, push:0, successOutcome:"neutralByDistance", rangeMin:-1, rangeMax:-1, targetRows:[], nextPose:"stand", damageHalf:0},
  { id:"mid_poke", phase:"midNeutral", role:"neutral", order:"02", title:"중거리 견제", description:"중거리에서 가장 표준적인 버튼.", tags:["뉴트럴","지상","중단","중거리 공격"], color:"orange", groupLabel:"교전", baseWeight:16, advance:0, push:0, successOutcome:"pressure", rangeMin:2, rangeMax:4, targetRows:["M","G"], nextPose:"stand", damageHalf:1},
  { id:"mid_anti_air", phase:"midNeutral", role:"neutral", order:"03", title:"대공기", description:"저공/고공 접근을 끊는 대공 선택지.", tags:["지상","대공","중거리 공격"], color:"gold", groupLabel:"교전", baseWeight:11, advance:0, push:0, successOutcome:"pressure", rangeMin:1, rangeMax:3, targetRows:["H","A"], nextPose:"stand", damageHalf:1},
  { id:"mid_air_approach", phase:"midNeutral", role:"neutral", order:"04", title:"공중 접근", description:"점프로 궤도를 바꿔 접근한다.", tags:["공중","대쉬"], color:"gray", groupLabel:"교전", baseWeight:10, advance:1, push:0, successOutcome:"neutralByDistance", rangeMin:-1, rangeMax:-1, targetRows:[], nextPose:"air", damageHalf:0},
  { id:"mid_wait", phase:"midNeutral", role:"neutral", order:"05", title:"대기", description:"상대의 성급한 진입을 기다린다.", tags:["수비","지상"], color:"blue", groupLabel:"교전", baseWeight:10, advance:0, push:1, successOutcome:"neutralByDistance", rangeMin:-1, rangeMax:-1, targetRows:[], nextPose:"stand", damageHalf:0},
];
const FAR: CardDefinition[] = [
  { id:"far_dash", phase:"farNeutral", role:"neutral", order:"01", title:"지상 접근", description:"멀리서 거리를 크게 줄인다.", tags:["뉴트럴","대쉬","지상","딜레이"], color:"red", groupLabel:"교전", baseWeight:17, advance:2, push:0, successOutcome:"neutralByDistance", rangeMin:-1, rangeMax:-1, targetRows:[], nextPose:"stand", damageHalf:0},
  { id:"far_poke", phase:"farNeutral", role:"neutral", order:"02", title:"원거리 견제", description:"멀리서 공간을 먼저 차지한다.", tags:["지상","중단","원거리 공격"], color:"orange", groupLabel:"교전", baseWeight:17, advance:0, push:0, successOutcome:"pressure", rangeMin:5, rangeMax:7, targetRows:["M","G"], nextPose:"stand", damageHalf:1},
  { id:"far_wait", phase:"farNeutral", role:"neutral", order:"03", title:"대기", description:"상대가 먼저 움직이길 기다린다.", tags:["수비","지상"], color:"blue", groupLabel:"교전", baseWeight:10, advance:0, push:1, successOutcome:"neutralByDistance", rangeMin:-1, rangeMax:-1, targetRows:[], nextPose:"stand", damageHalf:0},
];
const PRESSURE_ATTACKER: CardDefinition[] = [
  { id:"pressure_string", phase:"pressure", role:"attacker", order:"01", title:"연속 압박", description:"기본기로 계속 묶으며 심리를 이어간다.", tags:["지상","중단","근거리 공격"], color:"red", groupLabel:"공격자", baseWeight:15, advance:0, push:0, successOutcome:"pressure", rangeMin:0, rangeMax:1, targetRows:["M","G"], nextPose:"stand", damageHalf:1 },
  { id:"pressure_frame", phase:"pressure", role:"attacker", order:"02", title:"프레임 트랩", description:"개기기를 노리는 딜레이 공격. 히트하면 콤보 시동.", tags:["지상","딜레이","중단","근거리 공격","콤보"], color:"orange", groupLabel:"공격자", baseWeight:12, advance:0, push:1, successOutcome:"combo", rangeMin:0, rangeMax:1, targetRows:["M","G"], nextPose:"stand", damageHalf:1, comboBonusHalf:2 },
  { id:"pressure_throw", phase:"pressure", role:"attacker", order:"03", title:"압박 잡기", description:"붙은 거리에서 가드 굳히기를 깨는 잡기.", tags:["선공","지상","잡기"], color:"gold", groupLabel:"공격자", baseWeight:10, advance:0, push:0, successOutcome:"hardDown", rangeMin:0, rangeMax:0, targetRows:["M","G"], nextPose:"stand", damageHalf:1 },
];
const PRESSURE_DEFENDER: CardDefinition[] = [
  { id:"defend_guard", phase:"pressure", role:"defender", order:"01", title:"가드", description:"가장 안정적으로 버틴다.", tags:["수비","지상"], color:"blue", groupLabel:"수비자", baseWeight:17, advance:0, push:1, successOutcome:"neutralByDistance", rangeMin:-1, rangeMax:-1, targetRows:[], nextPose:"stand", damageHalf:0 },
  { id:"defend_abare", phase:"pressure", role:"defender", order:"02", title:"개기기", description:"틈을 노리고 버튼을 누른다.", tags:["지상","딜레이","중단","근거리 공격"], color:"red", groupLabel:"수비자", baseWeight:8, advance:0, push:0, successOutcome:"neutralByDistance", rangeMin:0, rangeMax:1, targetRows:["M","G"], nextPose:"stand", damageHalf:1 },
  { id:"defend_jump", phase:"pressure", role:"defender", order:"03", title:"탈출 점프", description:"공중으로 빠져 압박을 비튼다.", tags:["공중","대쉬"], color:"gray", groupLabel:"수비자", baseWeight:10, advance:1, push:0, successOutcome:"neutralByDistance", rangeMin:-1, rangeMax:-1, targetRows:[], nextPose:"air", damageHalf:0 },
];
const HARDDOWN_ATTACKER = PRESSURE_ATTACKER;
const HARDDOWN_DEFENDER = PRESSURE_DEFENDER;
const COMBO_ATTACKER: CardDefinition[] = [
  { id:"combo_finish", phase:"combo", role:"attacker", order:"01", title:"콤보 완주", description:"끝까지 이어 하트를 크게 깎아낸다.", tags:["지상","중단","근거리 공격","콤보"], color:"red", groupLabel:"공격자", baseWeight:14, advance:0, push:0, successOutcome:"hardDown", rangeMin:0, rangeMax:1, targetRows:["M","G"], nextPose:"stand", comboBonusHalf:2, damageHalf:1 },
  { id:"combo_reset", phase:"combo", role:"attacker", order:"02", title:"압박 리셋", description:"완주 대신 다시 압박 상황으로 복귀한다.", tags:["지상","중단","근거리 공격","딜레이"], color:"orange", groupLabel:"공격자", baseWeight:10, advance:0, push:0, successOutcome:"pressure", rangeMin:0, rangeMax:1, targetRows:["M","G"], nextPose:"stand", comboBonusHalf:1, damageHalf:1 },
];
const COMBO_DEFENDER: CardDefinition[] = [
  { id:"combo_hold", phase:"combo", role:"defender", order:"01", title:"버티기", description:"추가 연계를 최대한 줄이려 버틴다.", tags:["수비"], color:"blue", groupLabel:"수비자", baseWeight:14, advance:0, push:0, successOutcome:"samePhase", rangeMin:-1, rangeMax:-1, targetRows:[], nextPose:"stand", damageHalf:0 },
];
export function getCardsForPhase(phase: PhaseId, role: PlayerRoleInPhase): CardDefinition[] {
  if (phase === "opening") return OPENING;
  if (phase === "closeNeutral") return CLOSE;
  if (phase === "midNeutral") return MID;
  if (phase === "farNeutral") return FAR;
  if (phase === "pressure" || phase === "guard") return role === "attacker" ? PRESSURE_ATTACKER : PRESSURE_DEFENDER;
  if (phase === "hardDown") return role === "attacker" ? HARDDOWN_ATTACKER : HARDDOWN_DEFENDER;
  if (phase === "combo") return role === "attacker" ? COMBO_ATTACKER : COMBO_DEFENDER;
  return OPENING;
}
