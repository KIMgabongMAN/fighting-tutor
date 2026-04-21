import type {
  CardDefinition,
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

export function clampTile(value: number) {
  return Math.max(0, Math.min(5, value));
}

export function deriveGap(playerTile: number, enemyTile: number) {
  return Math.max(0, enemyTile - playerTile - 1);
}

export function deriveDistanceLabel(playerTile: number, enemyTile: number) {
  const gap = deriveGap(playerTile, enemyTile);

  if (gap === 0) return "근거리";
  if (gap >= 4) return "원거리";
  return "중거리";
}

export function deriveNeutralPhaseFromTiles(
  playerTile: number,
  enemyTile: number
): PhaseId {
  const gap = deriveGap(playerTile, enemyTile);

  if (gap === 0) return "closeNeutral";
  if (gap >= 4) return "farNeutral";
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

function isAir(card: CardDefinition) {
  return card.tags.includes("공중");
}

function isInvincible(card: CardDefinition) {
  return card.tags.includes("무적");
}

function isBurst(card: CardDefinition) {
  return card.tags.includes("버스트");
}

function isSameTagSet(a: CardDefinition, b: CardDefinition) {
  if (a.tags.length !== b.tags.length) return false;
  const sa = [...a.tags].sort();
  const sb = [...b.tags].sort();
  return sa.every((tag, idx) => tag === sb[idx]);
}

function isMeaty(card: CardDefinition) {
  return card.id === "okizeme_meaty";
}

function isWakeupDefenderCard(card: CardDefinition) {
  return (
    card.phase === "hardDown" &&
    card.role === "defender"
  );
}

function applyAdvance(
  playerTile: number,
  enemyTile: number,
  playerAdvance: number,
  enemyAdvance: number
) {
  let nextPlayerTile = clampTile(playerTile + playerAdvance);
  let nextEnemyTile = clampTile(enemyTile - enemyAdvance);

  if (nextPlayerTile >= nextEnemyTile) {
    nextPlayerTile = 2;
    nextEnemyTile = 3;
  }

  return { nextPlayerTile, nextEnemyTile };
}

function pushOpponent(
  winner: Winner,
  playerTile: number,
  enemyTile: number,
  amount: number
) {
  if (amount <= 0 || winner === "none") {
    return { nextPlayerTile: playerTile, nextEnemyTile: enemyTile };
  }

  let nextPlayerTile = playerTile;
  let nextEnemyTile = enemyTile;

  if (winner === "player") {
    const pushed = enemyTile + amount;
    if (pushed > 5) {
      nextPlayerTile = clampTile(playerTile - amount);
    } else {
      nextEnemyTile = pushed;
    }
  } else {
    const pushed = playerTile - amount;
    if (pushed < 0) {
      nextEnemyTile = clampTile(enemyTile + amount);
    } else {
      nextPlayerTile = pushed;
    }
  }

  if (nextPlayerTile >= nextEnemyTile) {
    nextPlayerTile = 2;
    nextEnemyTile = 3;
  }

  return { nextPlayerTile, nextEnemyTile };
}

function phaseFromOutcome(
  outcome: SuccessOutcome,
  playerTile: number,
  enemyTile: number
): PhaseId {
  if (outcome === "pressure") return "pressure";
  if (outcome === "combo") return "combo";
  if (outcome === "hardDown") return "hardDown";
  if (outcome === "neutralByDistance") return deriveNeutralPhaseFromTiles(playerTile, enemyTile);
  return deriveNeutralPhaseFromTiles(playerTile, enemyTile);
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
  playerHp: number,
  enemyHp: number,
  playerTile: number,
  enemyTile: number,
  message: string,
  commentary: string,
  effectText: string
): ResolutionResult {
  const nextPhase =
    winner === "none" || !winningCard
      ? deriveNeutralPhaseFromTiles(playerTile, enemyTile)
      : phaseFromOutcome(winningCard.successOutcome, playerTile, enemyTile);

  const nextRole: PlayerRoleInPhase =
    winner === "player" ? "attacker" : winner === "enemy" ? "defender" : "neutral";

  const stateText = roleStateText(nextPhase, nextRole);

  return {
    nextPlayerHp: Math.max(0, playerHp),
    nextEnemyHp: Math.max(0, enemyHp),
    nextPlayerTension: Math.min(100, currentState.playerTension + getPlayerTensionGain(winner)),
    nextEnemyTension: Math.min(100, currentState.enemyTension + getEnemyTensionGain(winner)),
    nextPlayerTile: playerTile,
    nextEnemyTile: enemyTile,
    nextPhase,
    nextPlayerRoleInPhase: nextRole,
    nextPlayerStateText: stateText.player,
    nextEnemyStateText: stateText.enemy,
    message,
    commentary,
    effectText,
    duelOutcome: winnerToDuelOutcome(winner),
  };
}

function compareAttackRanges(
  playerCard: CardDefinition,
  enemyCard: CardDefinition,
  finalGap: number
): Winner {
  const pClose = playerCard.tags.includes("근거리 공격");
  const eClose = enemyCard.tags.includes("근거리 공격");
  const pMid = playerCard.tags.includes("중거리 공격");
  const eMid = enemyCard.tags.includes("중거리 공격");
  const pFar = playerCard.tags.includes("원거리 공격");
  const eFar = enemyCard.tags.includes("원거리 공격");

  if (finalGap === 0 && pClose !== eClose) {
    return pClose ? "player" : "enemy";
  }

  if (finalGap >= 1 && finalGap <= 3 && pMid !== eMid) {
    return pMid ? "player" : "enemy";
  }

  if (finalGap >= 4 && pFar !== eFar) {
    return pFar ? "player" : "enemy";
  }

  if (playerCard.attackPower !== enemyCard.attackPower) {
    return playerCard.attackPower > enemyCard.attackPower ? "player" : "enemy";
  }

  if (playerCard.advance !== enemyCard.advance) {
    return playerCard.advance > enemyCard.advance ? "player" : "enemy";
  }

  if (playerCard.push !== enemyCard.push) {
    return playerCard.push > enemyCard.push ? "player" : "enemy";
  }

  return "none";
}

export function resolvePhaseTurn(context: GameContext): ResolutionResult {
  const { currentState, playerCard, enemyCard } = context;

  let nextPlayerHp = currentState.playerHp;
  let nextEnemyHp = currentState.enemyHp;

  const moved = applyAdvance(
    currentState.playerTile,
    currentState.enemyTile,
    playerCard.advance,
    enemyCard.advance
  );

  let nextPlayerTile = moved.nextPlayerTile;
  let nextEnemyTile = moved.nextEnemyTile;
  const finalGap = deriveGap(nextPlayerTile, nextEnemyTile);

  let winner: Winner = "none";
  let winningCard: CardDefinition | null = null;
  let message = "서로 의도를 부딪혔다.";
  let commentary = "거리 변화가 먼저 적용된 뒤 승패를 판정했다.";
  let effectText = "";

  if (isSameTagSet(playerCard, enemyCard)) {
    return buildResult(
      currentState,
      "none",
      null,
      nextPlayerHp,
      nextEnemyHp,
      nextPlayerTile,
      nextEnemyTile,
      "서로 같은 성질의 선택이 맞물려 상쇄됐다.",
      "태그 목록이 완전히 일치하면 승패 없이 리셋된다.",
      "상쇄"
    );
  }

  if (isBurst(playerCard) || isBurst(enemyCard)) {
    nextPlayerTile = clampTile(nextPlayerTile - 1);
    nextEnemyTile = clampTile(nextEnemyTile + 1);

    return buildResult(
      currentState,
      "none",
      null,
      nextPlayerHp,
      nextEnemyHp,
      nextPlayerTile,
      nextEnemyTile,
      "버스트로 카드 배틀 결과가 무효화되고 상황이 리셋됐다.",
      "버스트는 한 게임에 한 번, 국면과 승패를 강제로 끊는다.",
      "버스트"
    );
  }

  if (isInvincible(playerCard) && hasAttackLike(enemyCard) && !isInvincible(enemyCard)) {
    winner = "player";
    winningCard = playerCard;
    effectText = "무적기 히트";
    message = "네 승부수가 상대 공격 포함 태그를 뚫고 적중했다.";
    commentary = "무적기는 일반 공격 포함 태그 위의 최상위 예외 규칙이다.";
  } else if (isInvincible(enemyCard) && hasAttackLike(playerCard) && !isInvincible(playerCard)) {
    winner = "enemy";
    winningCard = enemyCard;
    effectText = "무적기 히트";
    message = "상대 승부수가 네 공격 포함 태그를 뚫었다.";
    commentary = "무적기 적중 후엔 흐름이 교전 쪽으로 강제 리셋되기 쉽다.";
  }

  // 하드다운 기상 공통 규칙
  else if (isMeaty(playerCard) && isWakeupDefenderCard(enemyCard) && !isInvincible(enemyCard) && !hasDefenseTag(enemyCard)) {
    winner = "player";
    winningCard = playerCard;
    effectText = "기상 카운터";
    message = "기상에 깔아두기가 상대의 기상 행동을 커트했다.";
    commentary =
      "하드다운 기상에서는 무적 리버설이 아닌 이상, 가드를 제외한 행동이 딜레이 없는 깔아두기에 진다.";
  } else if (isMeaty(enemyCard) && isWakeupDefenderCard(playerCard) && !isInvincible(playerCard) && !hasDefenseTag(playerCard)) {
    winner = "enemy";
    winningCard = enemyCard;
    effectText = "기상 카운터";
    message = "상대 기상에 깔아두기가 네 기상 행동을 커트했다.";
    commentary =
      "하드다운 기상에서는 무적 리버설이 아닌 이상, 가드를 제외한 행동이 딜레이 없는 깔아두기에 진다.";
  }

  else if (
    playerCard.tags.includes("선공") &&
    finalGap === 0 &&
    !isInvincible(enemyCard) &&
    !isAir(enemyCard) &&
    (hasAttackLike(enemyCard) || hasDefenseTag(enemyCard))
  ) {
    winner = "player";
    winningCard = playerCard;
    effectText = "선공 잡기";
    message = "영거리 잡기가 공격 포함 태그/수비보다 먼저 성립했다.";
    commentary = "선공은 사실상 영거리 잡기 전용 상위 예외 규칙이다.";
  } else if (
    enemyCard.tags.includes("선공") &&
    finalGap === 0 &&
    !isInvincible(playerCard) &&
    !isAir(playerCard) &&
    (hasAttackLike(playerCard) || hasDefenseTag(playerCard))
  ) {
    winner = "enemy";
    winningCard = enemyCard;
    effectText = "선공 잡기";
    message = "상대 영거리 잡기가 먼저 성립했다.";
    commentary = "최종 거리 0에서 선공 태그는 공격 포함 태그와 수비 카드 위에 있다.";
  } else if (isGrab(playerCard) && isGrab(enemyCard) && finalGap === 0) {
    return buildResult(
      currentState,
      "none",
      null,
      nextPlayerHp,
      nextEnemyHp,
      nextPlayerTile,
      nextEnemyTile,
      "서로 영거리 잡기를 선택해 상쇄됐다.",
      "동일한 잡기 선택은 승패 없이 리셋된다.",
      "상쇄"
    );
  } else if (isGrab(playerCard) && isAir(enemyCard)) {
    winner = "enemy";
    winningCard = enemyCard;
    effectText = "잡기 회피";
    message = "상대가 공중으로 빠져 네 잡기를 피했다.";
    commentary = "지상 잡기는 공중 태그 카드와 전투가 성립하지 않으므로 회피 쪽이 이긴다.";
  } else if (isGrab(enemyCard) && isAir(playerCard)) {
    winner = "player";
    winningCard = playerCard;
    effectText = "잡기 회피";
    message = "네 공중 선택이 상대 잡기를 피했다.";
    commentary = "공중 태그 카드는 지상 잡기를 회피한다.";
  } else if (playerCard.id === "pressure_frame" && enemyCard.tags.includes("딜레이")) {
    winner = "player";
    winningCard = playerCard;
    effectText = "카운터 히트";
    message = "프레임 트랩이 상대 딜레이 선택을 정확히 잡아냈다.";
    commentary = "딜레이 태그를 가진 카드는 프레임 트랩에 취약하다.";
  } else if (enemyCard.id === "pressure_frame" && playerCard.tags.includes("딜레이")) {
    winner = "enemy";
    winningCard = enemyCard;
    effectText = "카운터 히트";
    message = "상대 프레임 트랩이 네 딜레이 선택을 잡아냈다.";
    commentary = "반항이나 대쉬류는 프레임 트랩에 걸릴 수 있다.";
  } else if (playerCard.id === "pressure_frame" && !enemyCard.tags.includes("딜레이")) {
    winner = "player";
    winningCard = playerCard;
    effectText = "압박 종료";
    message = "프레임 트랩이 히트는 아니었지만 상대를 밀어내며 압박을 정리했다.";
    commentary = "딜레이가 아니면 프레임 트랩은 큰 리턴 대신 흐름 정리용으로 끝난다.";
  } else if (enemyCard.id === "pressure_frame" && !playerCard.tags.includes("딜레이")) {
    winner = "enemy";
    winningCard = enemyCard;
    effectText = "압박 종료";
    message = "상대 프레임 트랩이 너를 밀어내며 압박을 정리했다.";
    commentary = "딜레이가 아닌 선택엔 프레임 트랩이 압박 종료용으로 작동한다.";
  } else if (playerCard.id === "defend_abare" && finalGap !== 0) {
    winner = "enemy";
    winningCard = enemyCard;
    effectText = "헛침";
    message = "반항을 눌렀지만 거리가 맞지 않아 헛쳤다.";
    commentary = "근거리 반항은 최종 거리 0이 아니면 손해를 보기 쉽다.";
  } else if (enemyCard.id === "defend_abare" && finalGap !== 0) {
    winner = "player";
    winningCard = playerCard;
    effectText = "헛침";
    message = "상대 반항이 거리가 맞지 않아 빗나갔다.";
    commentary = "근거리 버튼은 거리 조건이 맞아야 위협이 된다.";
  } else if (hasDefenseTag(playerCard) && hasAttackLike(enemyCard) && !isGrab(enemyCard)) {
    winner = "player";
    winningCard = playerCard;
    effectText = "가드 성공";
    message = "네 방어가 상대 공격 포함 태그를 받아냈다.";
    commentary = "가드는 일반 공격 포함 태그를 안정적으로 막고, 이후 상대를 밀어낼 수 있다.";
  } else if (hasDefenseTag(enemyCard) && hasAttackLike(playerCard) && !isGrab(playerCard)) {
    winner = "enemy";
    winningCard = enemyCard;
    effectText = "가드 성공";
    message = "상대가 침착하게 네 공격 포함 태그를 받아냈다.";
    commentary = "가드 성공 시에는 다음 국면을 다시 정리하기 좋다.";
  } else if (isGrab(playerCard) && hasDefenseTag(enemyCard) && finalGap === 0) {
    winner = "player";
    winningCard = playerCard;
    effectText = "잡기 성공";
    message = "네 잡기가 수비를 정확히 깨뜨렸다.";
    commentary = "최종 거리 0에서 수비 태그는 잡기에 취약하다.";
  } else if (isGrab(enemyCard) && hasDefenseTag(playerCard) && finalGap === 0) {
    winner = "enemy";
    winningCard = enemyCard;
    effectText = "잡기 성공";
    message = "상대 잡기가 네 수비를 깨뜨렸다.";
    commentary = "방어만 고수하면 잡기에 노출된다.";
  } else if (isAir(playerCard) && hasAttackLike(enemyCard) && enemyCard.tags.includes("지상")) {
    winner = "enemy";
    winningCard = enemyCard;
    effectText = "대공/견제";
    message = "네 공중 선택이 상대 지상 공격 포함 태그에 걸렸다.";
    commentary = "공중 선택은 항상 무승부가 아니라, 준비된 지상 공격엔 지는 경우가 많다.";
  } else if (isAir(enemyCard) && hasAttackLike(playerCard) && playerCard.tags.includes("지상")) {
    winner = "player";
    winningCard = playerCard;
    effectText = "대공/견제";
    message = "상대 공중 선택을 네 지상 공격 포함 태그가 잡았다.";
    commentary = "점프/탈출도 읽히면 지상 공격에 걸릴 수 있다.";
  } else if (hasAttackLike(playerCard) && hasAttackLike(enemyCard)) {
    winner = compareAttackRanges(playerCard, enemyCard, finalGap);
    if (winner === "player") {
      winningCard = playerCard;
      effectText = "히트";
      message = "네 공격이 먼저 닿았다.";
      commentary = "거리와 공격 방향성이 맞는 카드가 우위를 가진다.";
    } else if (winner === "enemy") {
      winningCard = enemyCard;
      effectText = "피격";
      message = "상대 공격이 먼저 닿았다.";
      commentary = "거리와 공격 방향성이 맞는 카드가 우위를 가진다.";
    }
  } else if (playerCard.tags.includes("대쉬") && hasAttackLike(enemyCard)) {
    winner = "enemy";
    winningCard = enemyCard;
    effectText = "대쉬 저지";
    message = "네 접근이 상대 공격 포함 태그에 끊겼다.";
    commentary = "대쉬 계열은 읽히면 공격 포함 태그 카드에 취약하다.";
  } else if (enemyCard.tags.includes("대쉬") && hasAttackLike(playerCard)) {
    winner = "player";
    winningCard = playerCard;
    effectText = "대쉬 저지";
    message = "상대 접근을 네 공격 포함 태그가 끊었다.";
    commentary = "접근은 강하지만 읽히면 손해가 크다.";
  } else if (playerCard.advance !== enemyCard.advance) {
    winner = playerCard.advance > enemyCard.advance ? "player" : "enemy";
    winningCard = winner === "player" ? playerCard : enemyCard;
    effectText = "주도권 확보";
    message =
      winner === "player"
        ? "네가 더 적극적으로 거리를 장악했다."
        : "상대가 더 적극적으로 거리를 장악했다.";
    commentary = "완전한 상쇄가 아니면, 더 적극적인 선택이 주도권을 가져간다.";
  }

  if (winner === "player" && winningCard) {
    if (hasAttackLike(winningCard)) {
      nextEnemyHp -= winningCard.attackPower;
    } else if (isGrab(winningCard)) {
      nextEnemyHp -= winningCard.grabDamage;
    }
    const pushed = pushOpponent("player", nextPlayerTile, nextEnemyTile, winningCard.push);
    nextPlayerTile = pushed.nextPlayerTile;
    nextEnemyTile = pushed.nextEnemyTile;
  } else if (winner === "enemy" && winningCard) {
    if (hasAttackLike(winningCard)) {
      nextPlayerHp -= winningCard.attackPower;
    } else if (isGrab(winningCard)) {
      nextPlayerHp -= winningCard.grabDamage;
    }
    const pushed = pushOpponent("enemy", nextPlayerTile, nextEnemyTile, winningCard.push);
    nextPlayerTile = pushed.nextPlayerTile;
    nextEnemyTile = pushed.nextEnemyTile;
  }

  if (winningCard && isInvincible(winningCard)) {
    const pushed = pushOpponent(winner, nextPlayerTile, nextEnemyTile, 1);
    nextPlayerTile = pushed.nextPlayerTile;
    nextEnemyTile = pushed.nextEnemyTile;

    return {
      ...buildResult(
        currentState,
        winner,
        null,
        nextPlayerHp,
        nextEnemyHp,
        nextPlayerTile,
        nextEnemyTile,
        winner === "player"
          ? "무적기가 적중하며 거리가 벌어지고 교전이 리셋됐다."
          : "상대 무적기가 적중하며 거리가 벌어지고 교전이 리셋됐다.",
        "무적기 히트 후에는 특수 국면 유지보다 교전 리셋이 먼저 적용된다.",
        effectText || "무적기 히트"
      ),
      nextPhase: deriveNeutralPhaseFromTiles(nextPlayerTile, nextEnemyTile),
      nextPlayerRoleInPhase: "neutral",
      nextPlayerStateText: "뉴트럴",
      nextEnemyStateText: "뉴트럴",
    };
  }

  return buildResult(
    currentState,
    winner,
    winningCard,
    nextPlayerHp,
    nextEnemyHp,
    nextPlayerTile,
    nextEnemyTile,
    message,
    commentary,
    effectText || (winner === "none" ? "패스" : "")
  );
}