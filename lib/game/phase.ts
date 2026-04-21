import type {
  CardDefinition,
  GameContext,
  PlayerRoleInPhase,
  ResolutionResult,
  ResultTag,
} from "@/lib/game/types";

export function deriveDistanceLabel(distance: number) {
  if (distance === 0) return "근거리";
  if (distance >= 4) return "원거리";
  return "중거리";
}

export function deriveDistanceNeutralPhase(distance: number) {
  if (distance === 0) return "closeNeutral" as const;
  if (distance >= 4) return "farNeutral" as const;
  return "midNeutral" as const;
}

function clampDistance(distance: number) {
  return Math.max(0, Math.min(5, distance));
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
  distance: number
): Pick<
  ResolutionResult,
  | "nextPhase"
  | "nextPlayerRoleInPhase"
  | "nextPlayerStateText"
  | "nextEnemyStateText"
> {
  if (!tag || winner === "none") {
    return {
      nextPhase: deriveDistanceNeutralPhase(distance),
      nextPlayerRoleInPhase: "neutral",
      nextPlayerStateText: "뉴트럴",
      nextEnemyStateText: "뉴트럴",
    };
  }

  const nextPhase = phaseFromResultTag(tag);

  if (winner === "player") {
    return {
      nextPhase,
      nextPlayerRoleInPhase: "attacker",
      nextPlayerStateText:
        nextPhase === "hardDown"
          ? "압박 찬스"
          : nextPhase === "combo"
          ? "콤보 상황"
          : nextPhase === "guard"
          ? "가드 상황"
          : "압박 찬스",
      nextEnemyStateText:
        nextPhase === "hardDown"
          ? "하드 다운"
          : nextPhase === "combo"
          ? "불리 프레임"
          : nextPhase === "guard"
          ? "가드 상황"
          : "불리 프레임",
    };
  }

  return {
    nextPhase,
    nextPlayerRoleInPhase: "defender",
    nextPlayerStateText:
      nextPhase === "hardDown"
        ? "하드 다운"
        : nextPhase === "combo"
        ? "불리 프레임"
        : nextPhase === "guard"
        ? "가드 상황"
        : "불리 프레임",
    nextEnemyStateText:
      nextPhase === "hardDown"
        ? "압박 찬스"
        : nextPhase === "combo"
        ? "콤보 상황"
        : nextPhase === "guard"
        ? "압박 찬스"
        : "압박 찬스",
  };
}

function resolveOpeningOrNeutral(context: GameContext): ResolutionResult {
  const { currentState, playerCard, enemyCard } = context;

  let nextPlayerHp = currentState.playerHp;
  let nextEnemyHp = currentState.enemyHp;
  let nextDistance = currentState.distance;
  let winner: "player" | "enemy" | "none" = "none";
  let resultTag: ResultTag | null = null;
  let message = "서로 탐색전을 벌였다.";
  let commentary = "이번 선택으로 국면과 거리 흐름이 다음 턴에 반영된다.";
  let effectText = "";

  const pTags = new Set(playerCard.tags);
  const eTags = new Set(enemyCard.tags);

  if (playerCard.id.includes("poke") && enemyCard.id.includes("approach")) {
    winner = "player";
    resultTag = "승리";
    nextEnemyHp -= 8;
    message = "네 빠른 견제가 상대의 접근을 끊어냈다.";
    commentary = "빠른 견제는 전진 성향 선택에 강하다. 다음 턴 압박 상황으로 이어진다.";
    effectText = "견제 성공";
  } else if (enemyCard.id.includes("poke") && playerCard.id.includes("approach")) {
    winner = "enemy";
    resultTag = "승리";
    nextPlayerHp -= 8;
    message = "상대가 빠른 견제로 네 전진을 끊어냈다.";
    commentary = "준비된 견제 앞에서 단순 전진은 수세로 몰리기 쉽다.";
    effectText = "견제 피격";
  } else if (playerCard.id.includes("jump") && enemyCard.id.includes("backstep")) {
    winner = "player";
    resultTag = "승리";
    nextDistance = clampDistance(currentState.distance - 2);
    message = "네 점프 진입이 성공해 한 번에 거리를 좁혔다.";
    commentary = "상대가 물러나는 타이밍에 점프가 통하면 압박 시작이 쉽다.";
    effectText = "진입 성공";
  } else if (enemyCard.id.includes("poke") && playerCard.id.includes("jump")) {
    winner = "enemy";
    resultTag = "다운";
    nextPlayerHp -= 12;
    nextDistance = 0;
    message = "네 점프가 상대의 빠른 대응에 걸리며 크게 맞았다.";
    commentary = "준비된 견제에 점프 진입이 막히면 하드 다운 상황으로 이어지기 쉽다.";
    effectText = "대공 피격";
  } else if (pTags.has("수비") && eTags.has("공격")) {
    winner = "enemy";
    resultTag = "패배";
    nextDistance = clampDistance(currentState.distance + 1);
    message = "네가 수비적으로 버티며 직접 피해는 줄였지만, 상대가 흐름을 가져갔다.";
    commentary = "수비 선택은 안전하지만 주도권을 넘길 수 있다.";
    effectText = "가드";
  } else if (eTags.has("수비") && pTags.has("공격")) {
    winner = "player";
    resultTag = "승리";
    nextEnemyHp -= 5;
    message = "네 공격이 상대 방어를 흔들며 유리한 흐름을 만들었다.";
    commentary = "완전한 큰 히트는 아니더라도 다음 압박 상황을 열 수 있다.";
    effectText = "흐름 확보";
  } else if (playerCard.id.includes("backstep")) {
    nextDistance = clampDistance(currentState.distance + 2);
    message = "네가 뒤로 빠지며 거리를 벌렸다.";
    commentary = "전투 템포를 늦추고 원거리 교전으로 넘어가려는 선택이다.";
    effectText = "거리 조절";
  } else if (enemyCard.id.includes("backstep") && pTags.has("접근")) {
    nextDistance = clampDistance(currentState.distance + 1);
    winner = "player";
    resultTag = "승리";
    message = "상대는 물러났지만 네가 전진해 흐름을 유지했다.";
    commentary = "상대의 후퇴를 따라붙는 선택이 압박 진입으로 이어졌다.";
    effectText = "추격 성공";
  } else {
    message = "서로 큰 승부 없이 위치와 리듬만 조정했다.";
    commentary = "아직 명확한 유불리가 생기지 않았다. 다음 턴도 거리와 태그가 중요하다.";
  }

  const outcome = applyTagOutcome(resultTag, winner, nextDistance);

  return {
    nextPlayerHp: Math.max(0, nextPlayerHp),
    nextEnemyHp: Math.max(0, nextEnemyHp),
    nextPlayerTension: Math.min(100, currentState.playerTension + (winner === "player" ? 10 : 5)),
    nextEnemyTension: Math.min(100, currentState.enemyTension + (winner === "enemy" ? 10 : 5)),
    nextDistance,
    nextPhase: outcome.nextPhase,
    nextPlayerRoleInPhase: outcome.nextPlayerRoleInPhase,
    nextPlayerStateText: outcome.nextPlayerStateText,
    nextEnemyStateText: outcome.nextEnemyStateText,
    message,
    commentary,
    effectText,
  };
}

function resolvePressureAsAttacker(attackerCard: CardDefinition, defenderCard: CardDefinition) {
  const aTags = new Set(attackerCard.tags);
  const dTags = new Set(defenderCard.tags);

  if (attackerCard.id === "pressure_attacker_frameTrap" && dTags.has("느림")) {
    return {
      winner: "attacker" as const,
      tag: "콤보" as ResultTag,
      damageToDefender: 14,
      distanceDelta: 0,
      message: "프레임 트랩이 상대의 개기기를 정확히 잡아냈다.",
      commentary: "느린 개기기 태그를 가진 선택은 프레임 트랩에 무조건 패배한다.",
      effectText: "카운터 히트",
    };
  }

  if (attackerCard.id === "pressure_attacker_waitGrab") {
    if (dTags.has("수비")) {
      return {
        winner: "attacker" as const,
        tag: "다운" as ResultTag,
        damageToDefender: 7,
        distanceDelta: 0,
        message: "기다렸다가 잡기가 수비 선택을 정확히 잡아냈다.",
        commentary: "수비 태그를 읽고 잡기를 선택하면 하드 다운으로 이어질 수 있다.",
        effectText: "잡기 성공",
      };
    }

    if (dTags.has("잡기")) {
      return {
        winner: "none" as const,
        tag: null,
        damageToDefender: 0,
        distanceDelta: 0,
        message: "서로 잡기 성향이 겹치며 큰 변화 없이 상황이 멈췄다.",
        commentary: "잡기끼리는 일단 패스 처리하고 다시 흐름을 본다.",
        effectText: "패스",
      };
    }

    if (dTags.has("공격") || dTags.has("개기기") || dTags.has("공중")) {
      return {
        winner: "defender" as const,
        tag: "승리" as ResultTag,
        damageToDefender: 0,
        distanceDelta: 0,
        message: "상대가 먼저 움직여 기다렸다가 잡기는 실패했다.",
        commentary: "잡기는 수비를 읽을 때 강하지만 공격/공중 선택에는 명확히 진다.",
        effectText: "잡기 실패",
      };
    }
  }

  if (attackerCard.id === "pressure_attacker_reversal" && dTags.has("공격")) {
    return {
      winner: "attacker" as const,
      tag: "승리" as ResultTag,
      damageToDefender: 12,
      distanceDelta: 0,
      message: "무적기가 상대의 공격 성향을 뚫고 반격에 성공했다.",
      commentary: "무적 태그는 공격 태그와 부딪힐 때 강력한 반전 수단이 된다.",
      effectText: "무적기 성공",
    };
  }

  if (defenderCard.id === "pressure_defender_guard") {
    if (aTags.has("잡기")) {
      return {
        winner: "attacker" as const,
        tag: "다운" as ResultTag,
        damageToDefender: 6,
        distanceDelta: 0,
        message: "가드를 굳힌 상대를 잡기로 무너뜨렸다.",
        commentary: "얌전히 가드는 공격은 막아도 잡기 태그에는 무조건 진다.",
        effectText: "가드 붕괴",
      };
    }

    if (aTags.has("공격")) {
      return {
        winner: "defender" as const,
        tag: "패배" as ResultTag,
        damageToDefender: 0,
        distanceDelta: 1,
        message: "상대가 침착하게 가드하며 압박을 한 템포 밀어냈다.",
        commentary: "공격 태그는 막혔고, 상대가 너를 한 칸 밀어 거리와 국면을 바꿨다.",
        effectText: "가드 성공",
      };
    }
  }

  if (defenderCard.id === "pressure_defender_jumpGuard" && aTags.has("하단")) {
    return {
      winner: "attacker" as const,
      tag: "콤보" as ResultTag,
      damageToDefender: 10,
      distanceDelta: 0,
      message: "하단 선택이 점프가드를 정확히 걸어 넘어뜨렸다.",
      commentary: "점프가드는 하단 태그에 무조건 진다.",
      effectText: "하단 적중",
    };
  }

  if (defenderCard.id === "pressure_defender_abare" && aTags.has("프레임트랩")) {
    return {
      winner: "attacker" as const,
      tag: "콤보" as ResultTag,
      damageToDefender: 12,
      distanceDelta: 0,
      message: "상대 개기기가 프레임 트랩에 걸리며 큰 반격을 허용했다.",
      commentary: "개기기 태그는 프레임 트랩 앞에서 가장 위험한 선택이다.",
      effectText: "카운터",
    };
  }

  if (defenderCard.id === "pressure_defender_reversal") {
    if (aTags.has("무적")) {
      return {
        winner: "none" as const,
        tag: null,
        damageToDefender: 0,
        distanceDelta: 0,
        message: "서로 무적기를 꺼내며 국면이 크게 흔들렸지만 결정타는 나오지 않았다.",
        commentary: "무적끼리는 패스로 처리한다.",
        effectText: "상쇄",
      };
    }

    if (aTags.has("공격")) {
      return {
        winner: "defender" as const,
        tag: "승리" as ResultTag,
        damageToDefender: 0,
        distanceDelta: 0,
        message: "상대 무적기가 압박을 뚫고 반전에 성공했다.",
        commentary: "수비자 무적기는 무적이 아닌 공격 태그를 정면으로 이긴다.",
        effectText: "반전 성공",
      };
    }
  }

  if (attackerCard.id === "pressure_attacker_mixup") {
    return {
      winner: "attacker" as const,
      tag: "승리" as ResultTag,
      damageToDefender: 8,
      distanceDelta: 0,
      message: "개틀링 연계 이지가 통하며 압박이 계속 이어졌다.",
      commentary: "1차 버전에서는 중단/하단 세부 분기 대신 압박 유지형 성공으로 처리한다.",
      effectText: "이지 성공",
    };
  }

  if (attackerCard.id === "pressure_attacker_wait") {
    return {
      winner: "none" as const,
      tag: null,
      damageToDefender: 0,
      distanceDelta: 0,
      message: "서로 큰 리스크를 지지 않고 템포를 재조정했다.",
      commentary: "관망은 즉시 큰 이득은 없지만 상대 대응을 숨기기 좋다.",
      effectText: "",
    };
  }

  return {
    winner: "none" as const,
    tag: null,
    damageToDefender: 0,
    distanceDelta: 0,
    message: "압박과 수비가 맞부딪혔지만 이번 선택만으로 국면이 완전히 갈리지는 않았다.",
    commentary: "남은 태그와 거리 상태를 바탕으로 다음 턴 국면이 다시 정리된다.",
    effectText: "",
  };
}

function resolvePressure(context: GameContext): ResolutionResult {
  const { currentState, playerCard, enemyCard } = context;

  const playerIsAttacker = currentState.playerRoleInPhase === "attacker";
  const attackerCard = playerIsAttacker ? playerCard : enemyCard;
  const defenderCard = playerIsAttacker ? enemyCard : playerCard;

  const raw = resolvePressureAsAttacker(attackerCard, defenderCard);

  let nextPlayerHp = currentState.playerHp;
  let nextEnemyHp = currentState.enemyHp;
  let nextDistance = clampDistance(currentState.distance + raw.distanceDelta);

  let winnerFromPlayerView: "player" | "enemy" | "none" = "none";

  if (raw.winner === "attacker") {
    winnerFromPlayerView = playerIsAttacker ? "player" : "enemy";
  } else if (raw.winner === "defender") {
    winnerFromPlayerView = playerIsAttacker ? "enemy" : "player";
  }

  if (raw.damageToDefender > 0) {
    if (playerIsAttacker) {
      nextEnemyHp -= raw.damageToDefender;
    } else {
      nextPlayerHp -= raw.damageToDefender;
    }
  }

  const outcome = applyTagOutcome(raw.tag, winnerFromPlayerView, nextDistance);

  return {
    nextPlayerHp: Math.max(0, nextPlayerHp),
    nextEnemyHp: Math.max(0, nextEnemyHp),
    nextPlayerTension: Math.min(100, currentState.playerTension + (winnerFromPlayerView === "player" ? 10 : 5)),
    nextEnemyTension: Math.min(100, currentState.enemyTension + (winnerFromPlayerView === "enemy" ? 10 : 5)),
    nextDistance,
    nextPhase: outcome.nextPhase,
    nextPlayerRoleInPhase: outcome.nextPlayerRoleInPhase,
    nextPlayerStateText: outcome.nextPlayerStateText,
    nextEnemyStateText: outcome.nextEnemyStateText,
    message: raw.message,
    commentary: raw.commentary,
    effectText: raw.effectText,
  };
}

function resolveHardDown(context: GameContext): ResolutionResult {
  const { currentState, playerCard, enemyCard } = context;

  let winner: "player" | "enemy" | "none" = "none";
  let resultTag: ResultTag | null = null;
  let nextPlayerHp = currentState.playerHp;
  let nextEnemyHp = currentState.enemyHp;
  let message = "기상 직전의 선택 싸움이 이어졌다.";
  let commentary = "하드 다운 상황은 곧 기상 심리전으로 연결된다.";
  let effectText = "";

  if (currentState.playerRoleInPhase === "attacker") {
    if (playerCard.id === "harddown_attacker_safeJump" && enemyCard.id === "harddown_defender_reversal") {
      winner = "none";
      message = "안전 점프를 의식한 덕분에 상대 무적기를 큰 손해 없이 흘렸다.";
      commentary = "안전 점프는 하드 다운 국면에서 무적기까지 의식하는 카드다.";
      effectText = "회피 성공";
    } else if (playerCard.id === "harddown_attacker_meaty" && enemyCard.id === "harddown_defender_riseGuard") {
      winner = "player";
      resultTag = "승리";
      nextEnemyHp -= 6;
      message = "기상 압박이 가드 위로 이어지며 다시 압박 상황을 만들었다.";
      commentary = "기상 가드를 굳힌 상대에게 지속 압박을 걸며 주도권을 유지했다.";
      effectText = "압박 유지";
    } else if (enemyCard.id === "harddown_defender_reversal") {
      winner = "enemy";
      resultTag = "승리";
      nextPlayerHp -= 12;
      message = "상대 기상 무적기에 반격을 허용했다.";
      commentary = "하드 다운이라도 무적기를 전혀 고려하지 않으면 역으로 흐름을 넘겨줄 수 있다.";
      effectText = "반전 허용";
    } else {
      winner = "player";
      resultTag = "승리";
      nextEnemyHp -= 8;
      message = "하드 다운 이후 전개를 잡아 다시 유리한 압박으로 이어갔다.";
      commentary = "다운을 만든 쪽은 기상 직전 운영으로 다시 압박 상황을 만들기 쉽다.";
      effectText = "기상 압박";
    }
  } else {
    if (playerCard.id === "harddown_defender_reversal") {
      winner = "player";
      resultTag = "승리";
      nextEnemyHp -= 12;
      message = "기상 무적기가 성공하며 흐름을 뒤집었다.";
      commentary = "하드 다운 수비에서도 무적기는 가장 강력한 반전 선택 중 하나다.";
      effectText = "기상 반전";
    } else if (playerCard.id === "harddown_defender_riseGuard") {
      winner = "enemy";
      resultTag = "패배";
      message = "침착하게 막아냈지만 상대에게 아직 흐름이 남아 있다.";
      commentary = "기상 가드는 안전하지만 바로 턴을 가져오지는 못한다.";
      effectText = "기상 가드";
    } else {
      winner = "none";
      message = "위험한 기상 선택이 오갔지만 큰 충돌 없이 다음 심리전으로 넘어갔다.";
      commentary = "하드 다운 이후엔 즉시 큰 승부보다 압박/기상 흐름 자체가 중요하다.";
    }
  }

  const outcome = applyTagOutcome(resultTag, winner, currentState.distance);

  return {
    nextPlayerHp: Math.max(0, nextPlayerHp),
    nextEnemyHp: Math.max(0, nextEnemyHp),
    nextPlayerTension: Math.min(100, currentState.playerTension + (winner === "player" ? 10 : 5)),
    nextEnemyTension: Math.min(100, currentState.enemyTension + (winner === "enemy" ? 10 : 5)),
    nextDistance: currentState.distance,
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
  const { currentState, playerCard, enemyCard } = context;

  let winner: "player" | "enemy" | "none" = currentState.playerRoleInPhase === "attacker" ? "player" : "enemy";
  let resultTag: ResultTag | null = "승리";
  let nextPlayerHp = currentState.playerHp;
  let nextEnemyHp = currentState.enemyHp;
  let message = "콤보 선택이 마무리 방향을 결정했다.";
  let commentary = "콤보 상황에서는 데미지, 다운, 압박 리셋 중 무엇을 챙길지 선택하게 된다.";
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
      winner = "none";
      resultTag = null;
      message = "버스트로 콤보를 강제로 끊고 거리를 재정렬했다.";
      commentary = "버스트는 수세 콤보 상황을 끊는 강력한 리셋 수단이다.";
      effectText = "버스트";
      return {
        nextPlayerHp,
        nextEnemyHp,
        nextPlayerTension: currentState.playerTension,
        nextEnemyTension: currentState.enemyTension,
        nextDistance: clampDistance(currentState.distance + 1),
        nextPhase: deriveDistanceNeutralPhase(clampDistance(currentState.distance + 1)),
        nextPlayerRoleInPhase: "neutral",
        nextPlayerStateText: "뉴트럴",
        nextEnemyStateText: "뉴트럴",
        message,
        commentary,
        effectText,
      };
    }

    message = "버티기를 선택해 콤보 피해를 감수했다.";
    commentary = "수세 콤보에서는 자원을 아끼는 대신 다음 국면 준비가 중요하다.";
    effectText = "피해 감수";
  }

  const outcome = applyTagOutcome(resultTag, winner, currentState.distance);

  return {
    nextPlayerHp: Math.max(0, nextPlayerHp),
    nextEnemyHp: Math.max(0, nextEnemyHp),
    nextPlayerTension: Math.min(100, currentState.playerTension + (winner === "player" ? 10 : 5)),
    nextEnemyTension: Math.min(100, currentState.enemyTension + (winner === "enemy" ? 10 : 5)),
    nextDistance: currentState.distance,
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
    return resolveOpeningOrNeutral(context);
  }

  if (currentState.phase === "pressure" || currentState.phase === "guard") {
    return resolvePressure(context);
  }

  if (currentState.phase === "hardDown") {
    return resolveHardDown(context);
  }

  if (currentState.phase === "combo") {
    return resolveCombo(context);
  }

  return resolveOpeningOrNeutral(context);
}