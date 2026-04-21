import type {
  CardDefinition,
  GameContext,
  PhaseId,
  PlayerRoleInPhase,
  ResolutionResult,
  ResultTag,
} from "@/lib/game/types";

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

export function deriveNeutralPhaseFromTiles(playerTile: number, enemyTile: number): PhaseId {
  const gap = deriveGap(playerTile, enemyTile);

  if (gap === 0) return "closeNeutral";
  if (gap >= 4) return "farNeutral";
  return "midNeutral";
}

function phaseFromResultTag(tag: ResultTag) {
  switch (tag) {
    case "다운":
      return "hardDown" as const;
    case "콤보":
      return "combo" as const;
    case "승리":
      return "pressure" as const;
    case "패배":
      return "guard" as const;
    default:
      return "midNeutral" as const;
  }
}

function applyTagOutcome(
  tag: ResultTag | null,
  winner: "player" | "enemy" | "none",
  nextPlayerTile: number,
  nextEnemyTile: number
) {
  if (!tag || winner === "none") {
    return {
      nextPhase: deriveNeutralPhaseFromTiles(nextPlayerTile, nextEnemyTile),
      nextPlayerRoleInPhase: "neutral" as PlayerRoleInPhase,
      nextPlayerStateText: "뉴트럴",
      nextEnemyStateText: "뉴트럴",
    };
  }

  const nextPhase = phaseFromResultTag(tag);

  if (winner === "player") {
    return {
      nextPhase,
      nextPlayerRoleInPhase: "attacker" as PlayerRoleInPhase,
      nextPlayerStateText:
        nextPhase === "hardDown" ? "압박 찬스" : nextPhase === "combo" ? "콤보 상황" : nextPhase === "guard" ? "가드 상황" : "압박 찬스",
      nextEnemyStateText:
        nextPhase === "hardDown" ? "하드 다운" : nextPhase === "combo" ? "불리 프레임" : nextPhase === "guard" ? "가드 상황" : "불리 프레임",
    };
  }

  return {
    nextPhase,
    nextPlayerRoleInPhase: "defender" as PlayerRoleInPhase,
    nextPlayerStateText:
      nextPhase === "hardDown" ? "하드 다운" : nextPhase === "combo" ? "불리 프레임" : nextPhase === "guard" ? "가드 상황" : "불리 프레임",
    nextEnemyStateText:
      nextPhase === "hardDown" ? "압박 찬스" : nextPhase === "combo" ? "콤보 상황" : nextPhase === "guard" ? "압박 찬스" : "압박 찬스",
  };
}

function moveCloser(playerTile: number, enemyTile: number) {
  const nextPlayerTile = clampTile(playerTile + 1);
  const nextEnemyTile = clampTile(enemyTile - 1);

  if (nextPlayerTile >= nextEnemyTile) {
    return { nextPlayerTile: 2, nextEnemyTile: 3 };
  }

  return { nextPlayerTile, nextEnemyTile };
}

function moveFarther(playerTile: number, enemyTile: number) {
  return {
    nextPlayerTile: clampTile(playerTile - 1),
    nextEnemyTile: clampTile(enemyTile + 1),
  };
}

function resolveNeutral(context: GameContext): ResolutionResult {
  const { currentState, playerCard, enemyCard } = context;

  let nextPlayerHp = currentState.playerHp;
  let nextEnemyHp = currentState.enemyHp;
  let nextPlayerTile = currentState.playerTile;
  let nextEnemyTile = currentState.enemyTile;

  let winner: "player" | "enemy" | "none" = "none";
  let resultTag: ResultTag | null = null;
  let message = "서로 탐색전을 벌였다.";
  let commentary = "이번 선택으로 거리와 다음 국면이 정해진다.";
  let effectText = "";

  const pTags = new Set(playerCard.tags);
  const eTags = new Set(enemyCard.tags);

  if (pTags.has("빠름") && eTags.has("접근")) {
    winner = "player";
    resultTag = "승리";
    nextEnemyHp -= 8;
    ({ nextPlayerTile, nextEnemyTile } = moveCloser(nextPlayerTile, nextEnemyTile));
    message = "네 빠른 견제가 상대의 접근을 끊어냈다.";
    commentary = "빠른 공격은 접근 태그를 끊기에 좋다. 이후 압박 상황으로 이어진다.";
    effectText = "견제 성공";
  } else if (eTags.has("빠름") && pTags.has("접근")) {
    winner = "enemy";
    resultTag = "승리";
    nextPlayerHp -= 8;
    ({ nextPlayerTile, nextEnemyTile } = moveCloser(nextPlayerTile, nextEnemyTile));
    message = "상대의 빠른 견제가 네 움직임을 잘랐다.";
    commentary = "준비된 견제 앞에서 단순 전진은 수세로 몰릴 수 있다.";
    effectText = "견제 피격";
  } else if (pTags.has("공중") && eTags.has("공격") && eTags.has("빠름")) {
    winner = "enemy";
    resultTag = "다운";
    nextPlayerHp -= 12;
    message = "네 점프 진입이 끊기며 크게 맞았다.";
    commentary = "준비된 빠른 대응 앞에서 공중 진입은 위험하다. 하드 다운으로 이어진다.";
    effectText = "대공 피격";
  } else if (eTags.has("공중") && pTags.has("공격") && pTags.has("빠름")) {
    winner = "player";
    resultTag = "승리";
    nextEnemyHp -= 10;
    ({ nextPlayerTile, nextEnemyTile } = moveCloser(nextPlayerTile, nextEnemyTile));
    message = "상대의 공중 진입을 네 공격이 먼저 끊어냈다.";
    commentary = "공중 진입을 읽은 견제가 먼저 닿으며 흐름을 가져왔다.";
    effectText = "대응 성공";
  } else if (pTags.has("공격") && eTags.has("수비")) {
    winner = "player";
    resultTag = "승리";
    nextEnemyHp -= 5;
    message = "네 공격이 상대 수비를 흔들며 유리한 흐름을 만들었다.";
    commentary = "큰 히트는 아니더라도 다음 압박 상황으로 이어지는 기반을 만들었다.";
    effectText = "흐름 확보";
  } else if (eTags.has("공격") && pTags.has("수비")) {
    winner = "enemy";
    resultTag = "패배";
    message = "네가 버티긴 했지만, 이번엔 상대가 주도권을 잡았다.";
    commentary = "수비는 안전하지만 주도권을 넘길 수도 있다.";
    effectText = "가드";
  } else if (pTags.has("거리조절")) {
    ({ nextPlayerTile, nextEnemyTile } = moveFarther(nextPlayerTile, nextEnemyTile));
    message = "네가 뒤로 물러나며 거리를 벌렸다.";
    commentary = "위험한 구간을 벗어나며 다음 중거리/원거리 교전으로 넘어간다.";
    effectText = "거리 조절";
  } else if (eTags.has("거리조절")) {
    ({ nextPlayerTile, nextEnemyTile } = moveFarther(nextPlayerTile, nextEnemyTile));
    message = "상대가 거리를 벌리며 교전 템포를 다시 정리했다.";
    commentary = "한 턴 쉬어가며 다시 다른 거리의 교전으로 넘어간다.";
    effectText = "거리 조절";
  } else if (pTags.has("접근")) {
    ({ nextPlayerTile, nextEnemyTile } = moveCloser(nextPlayerTile, nextEnemyTile));
    message = "네가 조심스럽게 앞으로 나가며 거리를 좁혔다.";
    commentary = "접근은 큰 승패가 없어도 다음 턴 교전 거리를 바꾼다.";
    effectText = "전진";
  } else if (eTags.has("접근")) {
    ({ nextPlayerTile, nextEnemyTile } = moveCloser(nextPlayerTile, nextEnemyTile));
    message = "상대가 앞으로 압박하며 거리를 좁혀 왔다.";
    commentary = "다음 턴은 더 가까운 거리에서 시작될 가능성이 높다.";
    effectText = "전진 압박";
  } else {
    message = "서로 큰 승부 없이 리듬만 조절했다.";
    commentary = "이번엔 결정적인 태그 충돌이 없어 거리만 유지되었다.";
  }

  const outcome = applyTagOutcome(resultTag, winner, nextPlayerTile, nextEnemyTile);

  return {
    nextPlayerHp: Math.max(0, nextPlayerHp),
    nextEnemyHp: Math.max(0, nextEnemyHp),
    nextPlayerTension: Math.min(100, currentState.playerTension + (winner === "player" ? 10 : 5)),
    nextEnemyTension: Math.min(100, currentState.enemyTension + (winner === "enemy" ? 10 : 5)),
    nextPlayerTile,
    nextEnemyTile,
    nextPhase: outcome.nextPhase,
    nextPlayerRoleInPhase: outcome.nextPlayerRoleInPhase,
    nextPlayerStateText: outcome.nextPlayerStateText,
    nextEnemyStateText: outcome.nextEnemyStateText,
    message,
    commentary,
    effectText,
  };
}

function resolvePressureOrGuard(context: GameContext): ResolutionResult {
  const { currentState, playerCard, enemyCard } = context;

  const playerIsAttacker = currentState.playerRoleInPhase === "attacker";
  const attackerCard = playerIsAttacker ? playerCard : enemyCard;
  const defenderCard = playerIsAttacker ? enemyCard : playerCard;

  const aTags = new Set(attackerCard.tags);
  const dTags = new Set(defenderCard.tags);

  let winner: "player" | "enemy" | "none" = "none";
  let resultTag: ResultTag | null = null;
  let nextPlayerHp = currentState.playerHp;
  let nextEnemyHp = currentState.enemyHp;
  let nextPlayerTile = currentState.playerTile;
  let nextEnemyTile = currentState.enemyTile;
  let message = "압박과 수비가 다시 부딪혔다.";
  let commentary = "태그 충돌에 따라 다음 국면이 정해진다.";
  let effectText = "";

  const attackerWins = (tag: ResultTag, damage: number, text: string, comment: string, effect = "") => {
    resultTag = tag;
    winner = playerIsAttacker ? "player" : "enemy";

    if (playerIsAttacker) nextEnemyHp -= damage;
    else nextPlayerHp -= damage;

    message = text;
    commentary = comment;
    effectText = effect;
  };

  const defenderWins = (tag: ResultTag, damage: number, text: string, comment: string, effect = "") => {
    resultTag = tag;
    winner = playerIsAttacker ? "enemy" : "player";

    if (playerIsAttacker) nextPlayerHp -= damage;
    else nextEnemyHp -= damage;

    message = text;
    commentary = comment;
    effectText = effect;
  };

  if (aTags.has("프레임트랩") && dTags.has("느림")) {
    attackerWins("콤보", 14, "프레임 트랩이 느린 개기기를 정확히 잡아냈다.", "느림 태그는 프레임트랩에 무조건 취약하다.", "카운터 히트");
  } else if (aTags.has("잡기")) {
    if (dTags.has("수비")) {
      attackerWins("다운", 7, "기다렸다가 잡기가 수비를 정확히 읽어냈다.", "수비 태그를 읽은 잡기는 하드 다운으로 이어질 수 있다.", "잡기 성공");
    } else if (dTags.has("잡기")) {
      winner = "none";
      message = "서로 잡기 성향이 겹치며 큰 변화 없이 상황이 멈췄다.";
      commentary = "잡기끼리는 패스 처리하고 다시 흐름을 본다.";
      effectText = "패스";
    } else if (dTags.has("공격") || dTags.has("개기기") || dTags.has("공중")) {
      defenderWins("승리", 8, "상대가 먼저 움직여 잡기 시도가 실패했다.", "잡기는 수비를 읽을 때 강하지만 공격/공중 선택에는 명확히 진다.", "잡기 실패");
    }
  } else if (aTags.has("무적") && dTags.has("공격") && !dTags.has("무적")) {
    attackerWins("승리", 12, "무적기가 상대의 공격 성향을 뚫고 반격에 성공했다.", "무적 태그는 일반 공격 태그를 정면으로 뚫을 수 있다.", "무적기 성공");
  } else if (dTags.has("무적") && aTags.has("공격") && !aTags.has("무적")) {
    defenderWins("승리", 12, "상대 무적기가 압박을 뚫고 반전에 성공했다.", "수비자의 무적기는 공격 태그를 뒤집는 강력한 선택이다.", "반전 성공");
  } else if (dTags.has("수비") && aTags.has("공격")) {
    if (aTags.has("잡기")) {
      attackerWins("다운", 6, "가드를 굳힌 상대를 잡기로 무너뜨렸다.", "수비 태그는 공격을 막지만 잡기에는 진다.", "가드 붕괴");
    } else {
      defenderWins("패배", 0, "상대가 침착하게 가드하며 압박을 한 템포 밀어냈다.", "공격은 막혔고 수세 정리로 가드 상황이 이어진다.", "가드 성공");
      ({ nextPlayerTile, nextEnemyTile } = moveFarther(nextPlayerTile, nextEnemyTile));
    }
  } else if (dTags.has("공중") && aTags.has("하단")) {
    attackerWins("콤보", 10, "하단 선택이 점프가드를 정확히 걸어 넘어뜨렸다.", "점프가드는 하단 태그에 취약하다.", "하단 적중");
  } else if (dTags.has("개기기") && aTags.has("프레임트랩")) {
    attackerWins("콤보", 12, "상대 개기기가 프레임 트랩에 걸리며 큰 반격을 허용했다.", "개기기 태그는 프레임트랩 앞에서 가장 위험하다.", "카운터");
  } else if (aTags.has("이지선다") && dTags.has("수비")) {
    attackerWins("승리", 8, "개틀링 연계 이지가 통하며 압박이 계속 이어졌다.", "1차 버전에서는 중단/하단 세부 분기 대신 압박 유지형 성공으로 처리한다.", "이지 성공");
  } else if (aTags.has("수비") && dTags.has("수비")) {
    winner = "none";
    message = "서로 무리하지 않고 템포를 재조정했다.";
    commentary = "공격도 수비도 확실히 밀어붙이지 않아 흐름이 잠시 멈췄다.";
  } else {
    winner = "none";
    message = "압박과 수비가 맞부딪혔지만 이번엔 확실한 갈림이 없었다.";
    commentary = "다음 턴 카드와 거리 상태로 다시 국면을 본다.";
  }

  const outcome = applyTagOutcome(resultTag, winner, nextPlayerTile, nextEnemyTile);

  return {
    nextPlayerHp: Math.max(0, nextPlayerHp),
    nextEnemyHp: Math.max(0, nextEnemyHp),
    nextPlayerTension: Math.min(100, currentState.playerTension + (winner === "player" ? 10 : 5)),
    nextEnemyTension: Math.min(100, currentState.enemyTension + (winner === "enemy" ? 10 : 5)),
    nextPlayerTile,
    nextEnemyTile,
    nextPhase: outcome.nextPhase,
    nextPlayerRoleInPhase: outcome.nextPlayerRoleInPhase,
    nextPlayerStateText: outcome.nextPlayerStateText,
    nextEnemyStateText: outcome.nextEnemyStateText,
    message,
    commentary,
    effectText,
  };
}

function resolveHardDown(context: GameContext): ResolutionResult {
  const { currentState, playerCard, enemyCard } = context;

  let winner: "player" | "enemy" | "none" = "none";
  let resultTag: ResultTag | null = null;
  let nextPlayerHp = currentState.playerHp;
  let nextEnemyHp = currentState.enemyHp;
  let message = "기상 직전의 선택 싸움이 이어졌다.";
  let commentary = "하드 다운은 곧 다음 압박 또는 반전으로 이어질 수 있다.";
  let effectText = "";

  if (currentState.playerRoleInPhase === "attacker") {
    if (playerCard.id === "harddown_attacker_safeJump" && enemyCard.id === "harddown_defender_reversal") {
      winner = "none";
      message = "안전 점프로 상대 무적기를 의식하며 큰 손해 없이 넘겼다.";
      commentary = "안전 점프는 하드 다운 국면의 대표적인 리스크 관리 선택이다.";
      effectText = "회피 성공";
    } else if (playerCard.id === "harddown_attacker_meaty") {
      winner = "player";
      resultTag = "승리";
      nextEnemyHp -= 8;
      message = "기상 압박이 제대로 깔리며 다시 압박 상황을 만들었다.";
      commentary = "다운 이후 한 번 더 흐름을 이어갈 수 있는 전형적인 선택이다.";
      effectText = "기상 압박";
    } else if (enemyCard.id === "harddown_defender_reversal") {
      winner = "enemy";
      resultTag = "승리";
      nextPlayerHp -= 12;
      message = "상대 기상 무적기에 반격을 허용했다.";
      commentary = "하드 다운이어도 무적기 가능성을 완전히 버리면 안 된다.";
      effectText = "반전 허용";
    } else {
      winner = "player";
      resultTag = "승리";
      nextEnemyHp -= 6;
      message = "하드 다운 이후 전개를 유리하게 이어갔다.";
      commentary = "다운을 만든 쪽은 기상 직전 압박으로 다음 국면을 유리하게 만들기 쉽다.";
      effectText = "압박 유지";
    }
  } else {
    if (playerCard.id === "harddown_defender_reversal") {
      winner = "player";
      resultTag = "승리";
      nextEnemyHp -= 12;
      message = "기상 무적기가 성공하며 흐름을 뒤집었다.";
      commentary = "하드 다운 수비에서도 무적기는 가장 강한 반전 선택 중 하나다.";
      effectText = "기상 반전";
    } else if (playerCard.id === "harddown_defender_riseGuard") {
      winner = "enemy";
      resultTag = "패배";
      message = "침착하게 막아냈지만 여전히 상대 턴이 이어지고 있다.";
      commentary = "기상 가드는 가장 안전하지만 바로 턴을 가져오지는 못한다.";
      effectText = "기상 가드";
    } else {
      winner = "none";
      message = "위험한 기상 선택이 오갔지만 큰 충돌 없이 넘어갔다.";
      commentary = "하드 다운 이후엔 한 번의 선택보다 전체 기상 흐름이 더 중요하다.";
    }
  }

  const outcome = applyTagOutcome(resultTag, winner, currentState.playerTile, currentState.enemyTile);

  return {
    nextPlayerHp: Math.max(0, nextPlayerHp),
    nextEnemyHp: Math.max(0, nextEnemyHp),
    nextPlayerTension: Math.min(100, currentState.playerTension + (winner === "player" ? 10 : 5)),
    nextEnemyTension: Math.min(100, currentState.enemyTension + (winner === "enemy" ? 10 : 5)),
    nextPlayerTile: currentState.playerTile,
    nextEnemyTile: currentState.enemyTile,
    nextPhase: outcome.nextPhase,
    nextPlayerRoleInPhase: outcome.nextPlayerRoleInPhase,
    nextPlayerStateText: outcome.nextPlayerStateText,
    nextEnemyStateText: outcome.nextEnemyStateText,
    message,
    commentary,
    effectText,
  };
}

function resolveCombo(context: GameContext): ResolutionResult {
  const { currentState, playerCard } = context;

  let winner: "player" | "enemy" | "none" = currentState.playerRoleInPhase === "attacker" ? "player" : "enemy";
  let resultTag: ResultTag | null = "승리";
  let nextPlayerHp = currentState.playerHp;
  let nextEnemyHp = currentState.enemyHp;
  let message = "콤보 선택이 마무리 방향을 결정했다.";
  let commentary = "콤보 상황에서는 데미지, 다운, 압박 리셋 중 어떤 이득을 챙길지 선택한다.";
  let effectText = "콤보 선택";

  if (currentState.playerRoleInPhase === "attacker") {
    if (playerCard.id === "combo_attacker_damage") {
      nextEnemyHp -= 16;
      resultTag = "승리";
      message = "최대 데미지 선택으로 즉시 체력 이득을 크게 챙겼다.";
    } else if (playerCard.id === "combo_attacker_down") {
      nextEnemyHp -= 10;
      resultTag = "다운";
      message = "다운 마무리로 하드 다운 상황을 만들었다.";
    } else if (playerCard.id === "combo_attacker_reset") {
      nextEnemyHp -= 6;
      resultTag = "승리";
      message = "콤보를 짧게 끊고 다시 압박 상황으로 넘어갔다.";
    }
  } else {
    if (playerCard.id === "combo_defender_burst") {
      return {
        nextPlayerHp,
        nextEnemyHp,
        nextPlayerTension: currentState.playerTension,
        nextEnemyTension: currentState.enemyTension,
        nextPlayerTile: clampTile(currentState.playerTile - 1),
        nextEnemyTile: clampTile(currentState.enemyTile + 1),
        nextPhase: deriveNeutralPhaseFromTiles(clampTile(currentState.playerTile - 1), clampTile(currentState.enemyTile + 1)),
        nextPlayerRoleInPhase: "neutral",
        nextPlayerStateText: "뉴트럴",
        nextEnemyStateText: "뉴트럴",
        message: "버스트로 콤보를 강제로 끊고 거리를 다시 벌렸다.",
        commentary: "버스트는 수세 콤보 상황을 끊는 강력한 리셋 수단이다.",
        effectText: "버스트",
      };
    }

    winner = "enemy";
    resultTag = "패배";
    message = "버티기를 선택해 콤보 피해를 감수했다.";
    commentary = "자원을 아끼는 대신 다음 국면 준비가 중요해진다.";
    effectText = "피해 감수";
  }

  const outcome = applyTagOutcome(resultTag, winner, currentState.playerTile, currentState.enemyTile);

  return {
    nextPlayerHp: Math.max(0, nextPlayerHp),
    nextEnemyHp: Math.max(0, nextEnemyHp),
    nextPlayerTension: Math.min(100, currentState.playerTension + (winner === "player" ? 10 : 5)),
    nextEnemyTension: Math.min(100, currentState.enemyTension + (winner === "enemy" ? 10 : 5)),
    nextPlayerTile: currentState.playerTile,
    nextEnemyTile: currentState.enemyTile,
    nextPhase: outcome.nextPhase,
    nextPlayerRoleInPhase: outcome.nextPlayerRoleInPhase,
    nextPlayerStateText: outcome.nextPlayerStateText,
    nextEnemyStateText: outcome.nextEnemyStateText,
    message,
    commentary,
    effectText,
  };
}

export function resolvePhaseTurn(context: GameContext): ResolutionResult {
  const { currentState } = context;

  if (
    currentState.phase === "opening" ||
    currentState.phase === "closeNeutral" ||
    currentState.phase === "midNeutral" ||
    currentState.phase === "farNeutral"
  ) {
    return resolveNeutral(context);
  }

  if (currentState.phase === "pressure" || currentState.phase === "guard") {
    return resolvePressureOrGuard(context);
  }

  if (currentState.phase === "hardDown") {
    return resolveHardDown(context);
  }

  if (currentState.phase === "combo") {
    return resolveCombo(context);
  }

  return resolveNeutral(context);
}