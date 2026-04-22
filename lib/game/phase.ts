import type { BattlefieldRow, CardDefinition, CharacterPose, DuelOutcome, GameContext, PhaseId, PlayerRoleInPhase, ResolutionResult, SuccessOutcome } from "@/lib/game/types";
type Winner = "player" | "enemy" | "none";
function winnerToDuelOutcome(winner: Winner): DuelOutcome { return winner === "player" ? "player" : winner === "enemy" ? "enemy" : "none"; }
function getPlayerTensionGain(winner: Winner) { return winner === "player" ? 10 : 5; }
function getEnemyTensionGain(winner: Winner) { return winner === "enemy" ? 10 : 5; }
export function clampX(value: number) { return Math.max(0, Math.min(8, value)); }
export function deriveGap(playerX: number, enemyX: number) { return Math.max(0, enemyX - playerX - 1); }
export function deriveDistanceLabel(playerX: number, enemyX: number) { const gap = deriveGap(playerX, enemyX); if (gap <= 1) return "근거리"; if (gap >= 5) return "원거리"; return "중거리"; }
export function deriveNeutralPhaseFromX(playerX: number, enemyX: number): PhaseId { const gap = deriveGap(playerX, enemyX); if (gap <= 1) return "closeNeutral"; if (gap >= 5) return "farNeutral"; return "midNeutral"; }
function hasAttackLike(card: CardDefinition) { return card.tags.some((tag) => tag.includes("공격")); }
function hasDefenseTag(card: CardDefinition) { return card.tags.includes("수비"); }
function isGrab(card: CardDefinition) { return card.tags.includes("잡기"); }
function isBurst(card: CardDefinition) { return card.tags.includes("버스트"); }
function isForcedVulnerable(card: CardDefinition) { return card.id === "forced_vulnerable"; }
function poseAfterCard(card: CardDefinition, currentPose: CharacterPose) { return card.nextPose ?? currentPose; }
function getOccupancyRows(pose: CharacterPose): BattlefieldRow[] { if (pose === "stand") return ["M","G"]; if (pose === "crouch") return ["G"]; return ["H","A"]; }
function overlaps(a: BattlefieldRow[], b: BattlefieldRow[]) { return a.some((row) => b.includes(row)); }
function canConnect(card: CardDefinition, distance: number, targetPose: CharacterPose) {
  if (card.rangeMax < 0) return false;
  if (distance < card.rangeMin || distance > card.rangeMax) return false;
  return overlaps(card.targetRows, getOccupancyRows(targetPose));
}
function applyAdvance(playerX: number, enemyX: number, playerAdvance: number, enemyAdvance: number) {
  let nextPlayerX = clampX(playerX + playerAdvance);
  let nextEnemyX = clampX(enemyX - enemyAdvance);
  if (nextPlayerX >= nextEnemyX) { nextPlayerX = Math.max(0, nextEnemyX - 1); nextEnemyX = Math.min(8, nextPlayerX + 1); }
  return { nextPlayerX, nextEnemyX };
}
function pushOpponent(winner: Winner, playerX: number, enemyX: number, amount: number) {
  if (amount <= 0 || winner === "none") return { nextPlayerX: playerX, nextEnemyX: enemyX };
  let nextPlayerX = playerX, nextEnemyX = enemyX;
  if (winner === "player") nextEnemyX = clampX(enemyX + amount); else nextPlayerX = clampX(playerX - amount);
  if (nextPlayerX >= nextEnemyX) { nextPlayerX = Math.max(0, nextEnemyX - 1); nextEnemyX = Math.min(8, nextPlayerX + 1); }
  return { nextPlayerX, nextEnemyX };
}
function phaseFromOutcome(outcome: SuccessOutcome, playerX: number, enemyX: number): PhaseId {
  if (outcome === "pressure") return "pressure";
  if (outcome === "combo") return "combo";
  if (outcome === "hardDown") return "hardDown";
  return deriveNeutralPhaseFromX(playerX, enemyX);
}
function roleStateText(phase: PhaseId, role: PlayerRoleInPhase) {
  if (role === "neutral") return { player: "뉴트럴", enemy: "뉴트럴" };
  if (role === "attacker") {
    if (phase === "combo") return { player: "콤보 상황", enemy: "불리 프레임" };
    if (phase === "hardDown") return { player: "압박 찬스", enemy: "하드 다운" };
    return { player: "압박 찬스", enemy: "불리 프레임" };
  }
  if (phase === "combo") return { player: "불리 프레임", enemy: "콤보 상황" };
  if (phase === "hardDown") return { player: "하드 다운", enemy: "압박 찬스" };
  return { player: "가드 상황", enemy: "압박 찬스" };
}
function buildResult(currentState: GameContext["currentState"], winner: Winner, winningCard: CardDefinition | null, nextPlayerHeartsHalf: number, nextEnemyHeartsHalf: number, nextPlayerX: number, nextEnemyX: number, nextPlayerPose: CharacterPose, nextEnemyPose: CharacterPose, message: string, commentary: string, effectText: string, nextPlayerVulnerable: boolean, nextEnemyVulnerable: boolean): ResolutionResult {
  const nextPhase = winner === "none" || !winningCard ? deriveNeutralPhaseFromX(nextPlayerX, nextEnemyX) : phaseFromOutcome(winningCard.successOutcome, nextPlayerX, nextEnemyX);
  const nextRole: PlayerRoleInPhase = winner === "player" ? "attacker" : winner === "enemy" ? "defender" : "neutral";
  const stateText = roleStateText(nextPhase, nextRole);
  return {
    nextPlayerHeartsHalf: Math.max(0, nextPlayerHeartsHalf),
    nextEnemyHeartsHalf: Math.max(0, nextEnemyHeartsHalf),
    nextPlayerTension: Math.min(100, currentState.playerTension + getPlayerTensionGain(winner)),
    nextEnemyTension: Math.min(100, currentState.enemyTension + getEnemyTensionGain(winner)),
    nextPlayerX, nextEnemyX, nextPlayerPose, nextEnemyPose, nextPhase,
    nextPlayerRoleInPhase: nextRole,
    nextPlayerStateText: nextPlayerVulnerable ? "무방비" : stateText.player,
    nextEnemyStateText: nextEnemyVulnerable ? "무방비" : stateText.enemy,
    message, commentary, effectText, duelOutcome: winnerToDuelOutcome(winner),
    nextPlayerVulnerable, nextEnemyVulnerable,
  };
}
function getDamageHalf(currentPhase: PhaseId, winningCard: CardDefinition, isPunish: boolean) {
  if (isPunish) return 2;
  if (currentPhase === "combo") return winningCard.comboBonusHalf ?? winningCard.damageHalf ?? 1;
  return winningCard.damageHalf ?? 1;
}
export function resolvePhaseTurn(context: GameContext): ResolutionResult {
  const { currentState, playerCard, enemyCard } = context;
  let nextPlayerHeartsHalf = currentState.playerHeartsHalf, nextEnemyHeartsHalf = currentState.enemyHeartsHalf;
  const moved = applyAdvance(currentState.playerX, currentState.enemyX, playerCard.advance, enemyCard.advance);
  let nextPlayerX = moved.nextPlayerX, nextEnemyX = moved.nextEnemyX;
  let nextPlayerPose = poseAfterCard(playerCard, currentState.playerPose);
  let nextEnemyPose = poseAfterCard(enemyCard, currentState.enemyPose);
  const distance = deriveGap(nextPlayerX, nextEnemyX);
  const playerCanHit = canConnect(playerCard, distance, nextEnemyPose);
  const enemyCanHit = canConnect(enemyCard, distance, nextPlayerPose);

  let winner: Winner = "none";
  let winningCard: CardDefinition | null = null;
  let message = "서로 의도를 부딪혔다.";
  let commentary = "4x9 전장에서 거리와 높이 판정을 먼저 확인했다.";
  let effectText = "";
  let nextPlayerVulnerable = false, nextEnemyVulnerable = false;

  if (isBurst(playerCard) || isBurst(enemyCard)) {
    return buildResult(currentState, "none", null, nextPlayerHeartsHalf, nextEnemyHeartsHalf, clampX(nextPlayerX - 1), clampX(nextEnemyX + 1), "stand", "stand", "버스트로 현재 장면을 강제로 끊었다.", "버스트는 데미지와 후상황을 무효화하고 다시 중립으로 돌린다.", "버스트", false, false);
  }

  if (currentState.playerVulnerable && isForcedVulnerable(playerCard) && enemyCanHit) {
    winner = "enemy"; winningCard = enemyCard; effectText = "확정 반격"; message = "네 후딜에 상대가 정확히 처벌을 넣었다.";
  } else if (currentState.enemyVulnerable && isForcedVulnerable(enemyCard) && playerCanHit) {
    winner = "player"; winningCard = playerCard; effectText = "확정 반격"; message = "상대 후딜을 네가 확실하게 처벌했다.";
  } else if (isGrab(playerCard) && playerCanHit && distance === 0 && nextEnemyPose !== "air" && !hasDefenseTag(playerCard)) {
    winner = "player"; winningCard = playerCard; effectText = "잡기 성공";
  } else if (isGrab(enemyCard) && enemyCanHit && distance === 0 && nextPlayerPose !== "air") {
    winner = "enemy"; winningCard = enemyCard; effectText = "잡기 성공";
  } else if (hasDefenseTag(playerCard) && hasAttackLike(enemyCard) && enemyCanHit) {
    winner = "player"; winningCard = playerCard; effectText = "가드 성공"; message = "네 방어가 상대 공격을 받아냈다.";
  } else if (hasDefenseTag(enemyCard) && hasAttackLike(playerCard) && playerCanHit) {
    winner = "enemy"; winningCard = enemyCard; effectText = "가드 성공"; message = "상대가 침착하게 네 공격을 받아냈다.";
  } else if (playerCanHit && !enemyCanHit) {
    winner = "player"; winningCard = playerCard; effectText = "히트"; message = "네 공격이 먼저 닿았다.";
  } else if (!playerCanHit && enemyCanHit) {
    winner = "enemy"; winningCard = enemyCard; effectText = "피격"; message = "상대 공격이 먼저 닿았다.";
  } else if (playerCard.advance !== enemyCard.advance) {
    winner = playerCard.advance > enemyCard.advance ? "player" : "enemy";
    winningCard = winner === "player" ? playerCard : enemyCard;
    effectText = "주도권 확보";
  }

  if (winner === "player" && winningCard) {
    const canDamage = ((hasAttackLike(winningCard) || isGrab(winningCard)) && playerCanHit) || currentState.phase === "combo";
    if (canDamage) nextEnemyHeartsHalf -= getDamageHalf(currentState.phase, winningCard, currentState.enemyVulnerable);
    const pushed = pushOpponent("player", nextPlayerX, nextEnemyX, winningCard.push); nextPlayerX = pushed.nextPlayerX; nextEnemyX = pushed.nextEnemyX;
  } else if (winner === "enemy" && winningCard) {
    const canDamage = ((hasAttackLike(winningCard) || isGrab(winningCard)) && enemyCanHit) || currentState.phase === "combo";
    if (canDamage) nextPlayerHeartsHalf -= getDamageHalf(currentState.phase, winningCard, currentState.playerVulnerable);
    const pushed = pushOpponent("enemy", nextPlayerX, nextEnemyX, winningCard.push); nextPlayerX = pushed.nextPlayerX; nextEnemyX = pushed.nextEnemyX;
  }

  if ((isGrab(playerCard) || playerCard.tags.includes("무적")) && winner !== "player") nextPlayerVulnerable = true;
  if ((isGrab(enemyCard) || enemyCard.tags.includes("무적")) && winner !== "enemy") nextEnemyVulnerable = true;

  return buildResult(currentState, winner, winningCard, nextPlayerHeartsHalf, nextEnemyHeartsHalf, nextPlayerX, nextEnemyX, nextPlayerPose, nextEnemyPose, message, commentary, effectText || (winner === "none" ? "패스" : ""), nextPlayerVulnerable, nextEnemyVulnerable);
}
