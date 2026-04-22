import type {
  BattlefieldRow,
  CardDefinition,
  CharacterPose,
  DuelOutcome,
  GameContext,
  PhaseId,
  PlayerRoleInPhase,
  ResolutionResult,
  SuccessOutcome,
} from "@/lib/game/types";

type Winner = "player" | "enemy" | "none";

function getPlayerTensionGain(winner: Winner) {
  return winner === "player" ? 10 : 5;
}

function getEnemyTensionGain(winner: Winner) {
  return winner === "enemy" ? 10 : 5;
}

function winnerToDuelOutcome(winner: Winner): DuelOutcome {
  if (winner === "player") return "player";
  if (winner === "enemy") return "enemy";
  return "none";
}

export function clampX(value: number) {
  return Math.max(0, Math.min(8, value));
}

export function deriveGap(playerX: number, enemyX: number) {
  return Math.max(0, enemyX - playerX - 1);
}

export function deriveDistanceLabel(playerX: number, enemyX: number) {
  const gap = deriveGap(playerX, enemyX);
  if (gap <= 1) return "근거리";
  if (gap >= 5) return "원거리";
  return "중거리";
}

export function deriveNeutralPhaseFromX(playerX: number, enemyX: number): PhaseId {
  const gap = deriveGap(playerX, enemyX);
  if (gap <= 1) return "closeNeutral";
  if (gap >= 5) return "farNeutral";
  return "midNeutral";
}

function hasAttackLike(card: CardDefinition) {
  return card.tags.some((tag) => tag.includes("공격"));
}

function hasDefenseTag(card: CardDefinition) {
  return card.tags.includes("수비");
}

function isGrab(card: CardDefinition) {
  return card.tags.includes("잡기");
}

function isInvincible(card: CardDefinition) {
  return card.tags.includes("무적");
}

function isBurst(card: CardDefinition) {
  return card.tags.includes("버스트");
}

function isForcedVulnerable(card: CardDefinition) {
  return card.id === "forced_vulnerable";
}

function isFrameTrap(card: CardDefinition) {
  return card.id === "pressure_frame";
}

function isMeaty(card: CardDefinition) {
  return card.id === "okizeme_meaty";
}

function isWakeupDefenderCard(card: CardDefinition) {
  return card.phase === "hardDown" && card.role === "defender";
}

function poseAfterCard(card: CardDefinition, currentPose: CharacterPose) {
  return card.nextPose ?? currentPose;
}

function getOccupancyRows(pose: CharacterPose): BattlefieldRow[] {
  if (pose === "stand") return ["M", "G"];
  if (pose === "crouch") return ["G"];
  return ["H", "A"];
}

function overlaps(a: BattlefieldRow[], b: BattlefieldRow[]) {
  return a.some((row) => b.includes(row));
}

function canConnect(
  card: CardDefinition,
  distance: number,
  targetPose: CharacterPose
) {
  if (card.rangeMax < 0) return false;
  if (distance < card.rangeMin || distance > card.rangeMax) return false;
  return overlaps(card.targetRows, getOccupancyRows(targetPose));
}

function applyAdvance(
  playerX: number,
  enemyX: number,
  playerAdvance: number,
  enemyAdvance: number
) {
  let nextPlayerX = clampX(playerX + playerAdvance);
  let nextEnemyX = clampX(enemyX - enemyAdvance);

  if (nextPlayerX >= nextEnemyX) {
    nextPlayerX = Math.max(0, nextEnemyX - 1);
    nextEnemyX = Math.min(8, nextPlayerX + 1);
  }

  return { nextPlayerX, nextEnemyX };
}

function pushOpponent(
  winner: Winner,
  playerX: number,
  enemyX: number,
  amount: number
) {
  if (amount <= 0 || winner === "none") {
    return { nextPlayerX: playerX, nextEnemyX: enemyX };
  }

  let nextPlayerX = playerX;
  let nextEnemyX = enemyX;

  if (winner === "player") {
    nextEnemyX = clampX(enemyX + amount);
  } else {
    nextPlayerX = clampX(playerX - amount);
  }

  if (nextPlayerX >= nextEnemyX) {
    nextPlayerX = Math.max(0, nextEnemyX - 1);
    nextEnemyX = Math.min(8, nextPlayerX + 1);
  }

  return { nextPlayerX, nextEnemyX };
}

function phaseFromOutcome(
  outcome: SuccessOutcome,
  playerX: number,
  enemyX: number
): PhaseId {
  if (outcome === "pressure") return "pressure";
  if (outcome === "combo") return "combo";
  if (outcome === "hardDown") return "hardDown";
  if (outcome === "neutralByDistance") return deriveNeutralPhaseFromX(playerX, enemyX);
  return deriveNeutralPhaseFromX(playerX, enemyX);
}

function roleStateText(phase: PhaseId, role: PlayerRoleInPhase) {
  if (role === "neutral") {
    return { player: "뉴트럴", enemy: "뉴트럴" };
  }

  if (role === "attacker") {
    if (phase === "combo") return { player: "콤보 상황", enemy: "불리 프레임" };
    if (phase === "hardDown") return { player: "압박 찬스", enemy: "하드 다운" };
    return { player: "압박 찬스", enemy: "불리 프레임" };
  }

  if (phase === "combo") return { player: "불리 프레임", enemy: "콤보 상황" };
  if (phase === "hardDown") return { player: "하드 다운", enemy: "압박 찬스" };
  return { player: "가드 상황", enemy: "압박 찬스" };
}

function buildResult(
  currentState: GameContext["currentState"],
  winner: Winner,
  winningCard: CardDefinition | null,
  nextPlayerHeartsHalf: number,
  nextEnemyHeartsHalf: number,
  nextPlayerX: number,
  nextEnemyX: number,
  nextPlayerPose: CharacterPose,
  nextEnemyPose: CharacterPose,
  message: string,
  commentary: string,
  effectText: string,
  nextPlayerVulnerable: boolean,
  nextEnemyVulnerable: boolean
): ResolutionResult {
  const nextPhase =
    winner === "none" || !winningCard
      ? deriveNeutralPhaseFromX(nextPlayerX, nextEnemyX)
      : phaseFromOutcome(winningCard.successOutcome, nextPlayerX, nextEnemyX);

  const nextRole: PlayerRoleInPhase =
    winner === "player" ? "attacker" : winner === "enemy" ? "defender" : "neutral";

  const stateText = roleStateText(nextPhase, nextRole);

  return {
    nextPlayerHeartsHalf: Math.max(0, nextPlayerHeartsHalf),
    nextEnemyHeartsHalf: Math.max(0, nextEnemyHeartsHalf),
    nextPlayerTension: Math.min(100, currentState.playerTension + getPlayerTensionGain(winner)),
    nextEnemyTension: Math.min(100, currentState.enemyTension + getEnemyTensionGain(winner)),
    nextPlayerX,
    nextEnemyX,
    nextPlayerPose,
    nextEnemyPose,
    nextPhase,
    nextPlayerRoleInPhase: nextRole,
    nextPlayerStateText: nextPlayerVulnerable ? "무방비" : stateText.player,
    nextEnemyStateText: nextEnemyVulnerable ? "무방비" : stateText.enemy,
    message,
    commentary,
    effectText,
    duelOutcome: winnerToDuelOutcome(winner),
    nextPlayerVulnerable,
    nextEnemyVulnerable,
  };
}

function getAttackPriority(
  card: CardDefinition,
  distance: number,
  targetPose: CharacterPose
) {
  let score = 0;

  if (distance <= 1 && card.tags.includes("근거리 공격")) score += 4;
  if (distance >= 2 && distance <= 4 && card.tags.includes("중거리 공격")) score += 4;
  if (distance >= 5 && card.tags.includes("원거리 공격")) score += 4;
  if (targetPose === "air" && card.tags.includes("대공")) score += 5;
  if (card.tags.includes("하단")) score += 1;
  if (card.tags.includes("중단")) score += 1;
  score += card.damageHalf ?? 1;

  return score;
}

function compareAttackRanges(
  playerCard: CardDefinition,
  enemyCard: CardDefinition,
  distance: number,
  playerCanHit: boolean,
  enemyCanHit: boolean,
  playerTargetPose: CharacterPose,
  enemyTargetPose: CharacterPose
): Winner {
  if (playerCanHit && !enemyCanHit) return "player";
  if (!playerCanHit && enemyCanHit) return "enemy";
  if (!playerCanHit && !enemyCanHit) return "none";

  const playerScore = getAttackPriority(playerCard, distance, enemyTargetPose);
  const enemyScore = getAttackPriority(enemyCard, distance, playerTargetPose);

  if (playerScore > enemyScore) return "player";
  if (enemyScore > playerScore) return "enemy";
  return "none";
}

function getDamageHalf(
  currentPhase: PhaseId,
  winningCard: CardDefinition,
  isPunish: boolean
) {
  if (isPunish) return 2;
  if (currentPhase === "combo") return winningCard.comboBonusHalf ?? winningCard.damageHalf ?? 1;
  return winningCard.damageHalf ?? 1;
}

export function resolvePhaseTurn(context: GameContext): ResolutionResult {
  const { currentState, playerCard, enemyCard } = context;

  let nextPlayerHeartsHalf = currentState.playerHeartsHalf;
  let nextEnemyHeartsHalf = currentState.enemyHeartsHalf;

  const moved = applyAdvance(
    currentState.playerX,
    currentState.enemyX,
    playerCard.advance,
    enemyCard.advance
  );

  let nextPlayerX = moved.nextPlayerX;
  let nextEnemyX = moved.nextEnemyX;
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

  let nextPlayerVulnerable =
    currentState.playerVulnerable && !isForcedVulnerable(playerCard)
      ? currentState.playerVulnerable
      : false;

  let nextEnemyVulnerable =
    currentState.enemyVulnerable && !isForcedVulnerable(enemyCard)
      ? currentState.enemyVulnerable
      : false;

  const sameTagSet =
    playerCard.tags.length === enemyCard.tags.length &&
    [...playerCard.tags].sort().every((tag, idx) => tag === [...enemyCard.tags].sort()[idx]);

  if (currentState.playerVulnerable && isForcedVulnerable(playerCard) && enemyCanHit) {
    winner = "enemy";
    winningCard = enemyCard;
    effectText = "확정 반격";
    message = "네 후딜에 상대가 정확히 처벌을 넣었다.";
    commentary = "무방비 상태는 다음 턴 큰 리턴을 허용한다.";
  } else if (currentState.enemyVulnerable && isForcedVulnerable(enemyCard) && playerCanHit) {
    winner = "player";
    winningCard = playerCard;
    effectText = "확정 반격";
    message = "상대 후딜을 네가 확실하게 처벌했다.";
    commentary = "무방비 상대를 때리면 큰 리턴이 난다.";
  } else if (sameTagSet) {
    return buildResult(
      currentState,
      "none",
      null,
      nextPlayerHeartsHalf,
      nextEnemyHeartsHalf,
      nextPlayerX,
      nextEnemyX,
      nextPlayerPose,
      nextEnemyPose,
      "서로 같은 성질의 선택이 맞물려 상쇄됐다.",
      "완전히 같은 성질의 선택은 큰 진전 없이 리셋된다.",
      "상쇄",
      false,
      false
    );
  } else if (isBurst(playerCard) || isBurst(enemyCard)) {
    const pushed = {
      nextPlayerX: clampX(nextPlayerX - 1),
      nextEnemyX: clampX(nextEnemyX + 1),
    };

    return buildResult(
      currentState,
      "none",
      null,
      nextPlayerHeartsHalf,
      nextEnemyHeartsHalf,
      pushed.nextPlayerX,
      pushed.nextEnemyX,
      "stand",
      "stand",
      "버스트로 현재 장면을 강제로 끊었다.",
      "버스트는 데미지와 후상황을 무효화하고 다시 중립으로 돌린다.",
      "버스트",
      false,
      false
    );
  } else if (
    isInvincible(playerCard) &&
    !isInvincible(enemyCard) &&
    playerCanHit &&
    enemyCanHit &&
    (hasAttackLike(enemyCard) || isGrab(enemyCard))
  ) {
    winner = "player";
    winningCard = playerCard;
    effectText = "리버설";
    message = "네 무적기가 상대 공격을 뚫고 적중했다.";
    commentary = "무적기는 닿는 거리와 높이에서만 강하다.";
  } else if (
    isInvincible(enemyCard) &&
    !isInvincible(playerCard) &&
    enemyCanHit &&
    playerCanHit &&
    (hasAttackLike(playerCard) || isGrab(playerCard))
  ) {
    winner = "enemy";
    winningCard = enemyCard;
    effectText = "리버설";
    message = "상대 무적기가 네 공격을 뚫고 적중했다.";
    commentary = "무적기는 닿는 구간에서 상성을 뒤집는다.";
  } else if (
    isMeaty(playerCard) &&
    isWakeupDefenderCard(enemyCard) &&
    !isInvincible(enemyCard) &&
    !hasDefenseTag(enemyCard) &&
    playerCanHit
  ) {
    winner = "player";
    winningCard = playerCard;
    effectText = "기상 카운터";
    message = "기상에 깔아두기가 상대 기상 행동을 커트했다.";
    commentary = "딜레이 없는 기상 압박은 가드/무적 외 행동을 자른다.";
  } else if (
    isMeaty(enemyCard) &&
    isWakeupDefenderCard(playerCard) &&
    !isInvincible(playerCard) &&
    !hasDefenseTag(playerCard) &&
    enemyCanHit
  ) {
    winner = "enemy";
    winningCard = enemyCard;
    effectText = "기상 카운터";
    message = "상대 깔아두기가 네 기상 행동을 잘랐다.";
    commentary = "하드다운 수비는 가드나 무적이 아니면 위험하다.";
  } else if (
    playerCard.tags.includes("선공") &&
    distance === 0 &&
    playerCanHit &&
    nextEnemyPose !== "air" &&
    !isInvincible(enemyCard) &&
    (hasAttackLike(enemyCard) || hasDefenseTag(enemyCard))
  ) {
    winner = "player";
    winningCard = playerCard;
    effectText = "선공 잡기";
    message = "영거리 잡기가 먼저 성립했다.";
    commentary = "붙은 거리에서 선공 잡기는 강력하다.";
  } else if (
    enemyCard.tags.includes("선공") &&
    distance === 0 &&
    enemyCanHit &&
    nextPlayerPose !== "air" &&
    !isInvincible(playerCard) &&
    (hasAttackLike(playerCard) || hasDefenseTag(playerCard))
  ) {
    winner = "enemy";
    winningCard = enemyCard;
    effectText = "선공 잡기";
    message = "상대 영거리 잡기가 먼저 성립했다.";
    commentary = "붙은 거리의 잡기는 단순 수비보다 앞선다.";
  } else if (isGrab(playerCard) && nextEnemyPose === "air" && playerCanHit) {
    winner = "enemy";
    winningCard = enemyCard;
    effectText = "잡기 회피";
    message = "상대가 공중으로 빠져 잡기를 피했다.";
    commentary = "지상 잡기는 공중 판정에 성립하지 않는다.";
  } else if (isGrab(enemyCard) && nextPlayerPose === "air" && enemyCanHit) {
    winner = "player";
    winningCard = playerCard;
    effectText = "잡기 회피";
    message = "네가 공중으로 빠져 상대 잡기를 피했다.";
    commentary = "4x9 전장에서는 높이 차이로 잡기 불성립이 명확하다.";
  } else if (isFrameTrap(playerCard) && enemyCard.tags.includes("딜레이") && playerCanHit) {
    winner = "player";
    winningCard = playerCard;
    effectText = "카운터";
    message = "프레임 트랩이 상대 개기기를 잡아냈다.";
    commentary = "프레임 트랩 히트는 콤보 시동으로 이어진다.";
  } else if (isFrameTrap(enemyCard) && playerCard.tags.includes("딜레이") && enemyCanHit) {
    winner = "enemy";
    winningCard = enemyCard;
    effectText = "카운터";
    message = "상대 프레임 트랩이 네 개기기를 잡아냈다.";
    commentary = "읽힌 개기기는 큰 리턴을 내준다.";
  } else if (isFrameTrap(playerCard) && !enemyCard.tags.includes("딜레이")) {
    const pushed = pushOpponent("player", nextPlayerX, nextEnemyX, 1);
    return buildResult(
      currentState,
      "none",
      null,
      nextPlayerHeartsHalf,
      nextEnemyHeartsHalf,
      pushed.nextPlayerX,
      pushed.nextEnemyX,
      nextPlayerPose,
      nextEnemyPose,
      "프레임 트랩이 히트는 아니었지만 압박을 정리했다.",
      "상대가 개기지 않았다면 콤보가 아니라 압박 종료에 가깝다.",
      "압박 종료",
      false,
      false
    );
  } else if (isFrameTrap(enemyCard) && !playerCard.tags.includes("딜레이")) {
    const pushed = pushOpponent("enemy", nextPlayerX, nextEnemyX, 1);
    return buildResult(
      currentState,
      "none",
      null,
      nextPlayerHeartsHalf,
      nextEnemyHeartsHalf,
      pushed.nextPlayerX,
      pushed.nextEnemyX,
      nextPlayerPose,
      nextEnemyPose,
      "상대 프레임 트랩이 히트는 아니었지만 압박을 정리했다.",
      "프레임 트랩이 항상 히트로 이어지진 않는다.",
      "압박 종료",
      false,
      false
    );
  } else if (hasDefenseTag(playerCard) && hasAttackLike(enemyCard) && enemyCanHit && !isGrab(enemyCard)) {
    winner = "player";
    winningCard = playerCard;
    effectText = "가드 성공";
    message = "네 방어가 상대 공격을 받아냈다.";
    commentary = "가드는 닿는 일반 공격을 안정적으로 받아낸다.";
  } else if (hasDefenseTag(enemyCard) && hasAttackLike(playerCard) && playerCanHit && !isGrab(playerCard)) {
    winner = "enemy";
    winningCard = enemyCard;
    effectText = "가드 성공";
    message = "상대가 침착하게 네 공격을 받아냈다.";
    commentary = "가드 성공 뒤엔 다시 거리 싸움이 시작된다.";
  } else if (isGrab(playerCard) && hasDefenseTag(enemyCard) && distance === 0 && playerCanHit) {
    winner = "player";
    winningCard = playerCard;
    effectText = "잡기 성공";
    message = "네 잡기가 수비를 깨뜨렸다.";
    commentary = "붙은 거리의 수비는 잡기에 취약하다.";
  } else if (isGrab(enemyCard) && hasDefenseTag(playerCard) && distance === 0 && enemyCanHit) {
    winner = "enemy";
    winningCard = enemyCard;
    effectText = "잡기 성공";
    message = "상대 잡기가 네 수비를 깨뜨렸다.";
    commentary = "가드만 고수하면 잡기에 노출된다.";
  } else if (hasAttackLike(playerCard) && hasAttackLike(enemyCard)) {
    winner = compareAttackRanges(
      playerCard,
      enemyCard,
      distance,
      playerCanHit,
      enemyCanHit,
      nextPlayerPose,
      nextEnemyPose
    );

    if (winner === "player") {
      winningCard = playerCard;
      effectText = "히트";
      message = "네 공격이 먼저 닿았다.";
      commentary = "현재 거리와 높이에 더 잘 맞는 공격이 우위다.";
    } else if (winner === "enemy") {
      winningCard = enemyCard;
      effectText = "피격";
      message = "상대 공격이 먼저 닿았다.";
      commentary = "높이와 거리 판정이 동시에 맞아야 적중한다.";
    }
  } else if (playerCard.advance !== enemyCard.advance) {
    winner = playerCard.advance > enemyCard.advance ? "player" : "enemy";
    winningCard = winner === "player" ? playerCard : enemyCard;
    effectText = "주도권 확보";
    message =
      winner === "player"
        ? "네가 더 적극적으로 공간을 장악했다."
        : "상대가 더 적극적으로 공간을 장악했다.";
    commentary = "공격이 닿지 않아도 이동 우위로 다음 장면을 유리하게 만들 수 있다.";
  }

  if (winner === "player" && winningCard) {
    const isPunish = currentState.enemyVulnerable && isForcedVulnerable(enemyCard);
    const canDamage =
      ((hasAttackLike(winningCard) || isGrab(winningCard)) && playerCanHit) ||
      (currentState.phase === "combo" && (hasAttackLike(winningCard) || isGrab(winningCard)));

    if (canDamage) {
      nextEnemyHeartsHalf -= getDamageHalf(currentState.phase, winningCard, isPunish);
    }

    const pushed = pushOpponent("player", nextPlayerX, nextEnemyX, winningCard.push);
    nextPlayerX = pushed.nextPlayerX;
    nextEnemyX = pushed.nextEnemyX;
  } else if (winner === "enemy" && winningCard) {
    const isPunish = currentState.playerVulnerable && isForcedVulnerable(playerCard);
    const canDamage =
      ((hasAttackLike(winningCard) || isGrab(winningCard)) && enemyCanHit) ||
      (currentState.phase === "combo" && (hasAttackLike(winningCard) || isGrab(winningCard)));

    if (canDamage) {
      nextPlayerHeartsHalf -= getDamageHalf(currentState.phase, winningCard, isPunish);
    }

    const pushed = pushOpponent("enemy", nextPlayerX, nextEnemyX, winningCard.push);
    nextPlayerX = pushed.nextPlayerX;
    nextEnemyX = pushed.nextEnemyX;
  }

  if (isGrab(playerCard) || isInvincible(playerCard) || playerCard.id === "universal_awakening_super") {
    if (winner !== "player") nextPlayerVulnerable = true;
  }

  if (isGrab(enemyCard) || isInvincible(enemyCard) || enemyCard.id === "universal_awakening_super") {
    if (winner !== "enemy") nextEnemyVulnerable = true;
  }

  if (isForcedVulnerable(playerCard)) nextPlayerVulnerable = false;
  if (isForcedVulnerable(enemyCard)) nextEnemyVulnerable = false;

  return buildResult(
    currentState,
    winner,
    winningCard,
    nextPlayerHeartsHalf,
    nextEnemyHeartsHalf,
    nextPlayerX,
    nextEnemyX,
    nextPlayerPose,
    nextEnemyPose,
    message,
    commentary,
    effectText || (winner === "none" ? "패스" : ""),
    nextPlayerVulnerable,
    nextEnemyVulnerable
  );
}