"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Momentum = "중립" | "내가 유리" | "상대가 유리";
type Distance = "근거리" | "중거리" | "원거리";
type EffectType =
  | "없음"
  | "견제 성공"
  | "대공 피격"
  | "거리 재정비"
  | "압박 성공"
  | "가드 성공"
  | "공격 차단";

type ActionType =
  | "빠른 견제로 끊기"
  | "가드하며 보기"
  | "점프로 접근"
  | "뒤로 물러나기";

type FighterState =
  | "뉴트럴"
  | "압박 찬스"
  | "가드 중"
  | "하드 다운"
  | "불리 프레임";

type PhaseTone = "neutral" | "danger" | "advantage" | "system";

type PhaseBanner = {
  id: number;
  text: string;
  tone: PhaseTone;
};

type TurnLog = {
  turn: number;
  action: ActionType;
  result: string;
  commentary: string;
  playerHpAfter: number;
  enemyHpAfter: number;
  distanceAfter: Distance;
  momentumAfter: Momentum;
  playerStateAfter: FighterState;
  enemyStateAfter: FighterState;
};

type HpTimeline = {
  turn: number;
  playerHp: number;
  enemyHp: number;
};

export default function Home() {
  const [message, setMessage] = useState("상대가 중거리에서 천천히 접근하고 있습니다.");
  const [commentary, setCommentary] = useState(
    "중거리에서는 상대의 접근을 끊을지, 일단 관찰할지 판단하는 것이 중요합니다."
  );

  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [distance, setDistance] = useState<Distance>("중거리");
  const [momentum, setMomentum] = useState<Momentum>("중립");

  const [playerState, setPlayerState] = useState<FighterState>("뉴트럴");
  const [enemyState, setEnemyState] = useState<FighterState>("뉴트럴");

  const [effectText, setEffectText] = useState<EffectType>("없음");
  const [stageShake, setStageShake] = useState(false);
  const [playerLunge, setPlayerLunge] = useState(false);
  const [enemyLunge, setEnemyLunge] = useState(false);
  const [flashType, setFlashType] = useState<"없음" | "공격" | "피격">("없음");
  const [showHitSpark, setShowHitSpark] = useState(false);
  const [playerHpPulse, setPlayerHpPulse] = useState(false);
  const [enemyHpPulse, setEnemyHpPulse] = useState(false);

  const [turn, setTurn] = useState(1);
  const [logs, setLogs] = useState<TurnLog[]>([]);
  const [timeline, setTimeline] = useState<HpTimeline[]>([
    { turn: 0, playerHp: 100, enemyHp: 100 },
  ]);

  const [showReview, setShowReview] = useState(false);
  const [phaseBanner, setPhaseBanner] = useState<PhaseBanner | null>(null);

  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      showPhase("턴 시작", "system");
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (effectText === "없음") return;
    const timer = setTimeout(() => setEffectText("없음"), 850);
    return () => clearTimeout(timer);
  }, [effectText]);

  useEffect(() => {
    if (playerHp <= 0 || enemyHp <= 0) {
      setShowReview(true);
    }
  }, [playerHp, enemyHp]);

  useEffect(() => {
    return () => {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    };
  }, []);

  const showPhase = (text: string, tone: PhaseTone) => {
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);

    const nextBanner = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      text,
      tone,
    };

    setPhaseBanner(nextBanner);

    phaseTimerRef.current = setTimeout(() => {
      setPhaseBanner(null);
    }, 1600);
  };

  const clearFlash = () => {
    setTimeout(() => setFlashType("없음"), 180);
  };

  const triggerPlayerAttackEffect = (text: EffectType) => {
    setEffectText(text);
    setStageShake(true);
    setPlayerLunge(true);
    setFlashType("공격");
    setShowHitSpark(true);
    setEnemyHpPulse(true);

    setTimeout(() => setStageShake(false), 220);
    setTimeout(() => setPlayerLunge(false), 220);
    setTimeout(() => setShowHitSpark(false), 220);
    setTimeout(() => setEnemyHpPulse(false), 320);
    clearFlash();
  };

  const triggerEnemyAttackEffect = (text: EffectType) => {
    setEffectText(text);
    setStageShake(true);
    setEnemyLunge(true);
    setFlashType("피격");
    setShowHitSpark(true);
    setPlayerHpPulse(true);

    setTimeout(() => setStageShake(false), 240);
    setTimeout(() => setEnemyLunge(false), 240);
    setTimeout(() => setShowHitSpark(false), 220);
    setTimeout(() => setPlayerHpPulse(false), 320);
    clearFlash();
  };

  const clearEffects = () => {
    setEffectText("없음");
    setStageShake(false);
    setPlayerLunge(false);
    setEnemyLunge(false);
    setFlashType("없음");
    setShowHitSpark(false);
    setPlayerHpPulse(false);
    setEnemyHpPulse(false);
  };

  const appendLog = (
    action: ActionType,
    result: string,
    nextCommentary: string,
    nextPlayerHp: number,
    nextEnemyHp: number,
    nextDistance: Distance,
    nextMomentum: Momentum,
    nextPlayerState: FighterState,
    nextEnemyState: FighterState
  ) => {
    const currentTurn = turn;

    setLogs((prev) => [
      ...prev,
      {
        turn: currentTurn,
        action,
        result,
        commentary: nextCommentary,
        playerHpAfter: nextPlayerHp,
        enemyHpAfter: nextEnemyHp,
        distanceAfter: nextDistance,
        momentumAfter: nextMomentum,
        playerStateAfter: nextPlayerState,
        enemyStateAfter: nextEnemyState,
      },
    ]);

    setTimeline((prev) => [
      ...prev,
      {
        turn: currentTurn,
        playerHp: nextPlayerHp,
        enemyHp: nextEnemyHp,
      },
    ]);

    setTurn((prev) => prev + 1);
  };

  const handleFastPoke = () => {
    if (playerHp <= 0 || enemyHp <= 0) return;

    if (distance === "원거리") {
      const result = "네가 견제를 내밀었지만 거리가 멀어 닿지 않았다.";
      const nextCommentary =
        "원거리에서는 짧은 견제가 헛칠 수 있다. 먼저 거리를 줄이거나 상대의 접근을 유도하는 편이 낫다.";

      setMessage(result);
      setCommentary(nextCommentary);
      setMomentum("중립");
      setPlayerState("뉴트럴");
      setEnemyState("뉴트럴");
      clearEffects();

      appendLog(
        "빠른 견제로 끊기",
        result,
        nextCommentary,
        playerHp,
        enemyHp,
        distance,
        "중립",
        "뉴트럴",
        "뉴트럴"
      );
      return;
    }

    if (distance === "중거리") {
      const nextEnemyHp = Math.max(enemyHp - 10, 0);
      const result = "네가 빠른 견제로 상대의 접근을 끊어냈다. 상대가 10의 피해를 입었다.";
      const nextCommentary =
        "중거리에서 천천히 들어오는 상대에게는 빠른 견제로 흐름을 끊는 선택이 강하다.";

      setMessage(result);
      setCommentary(nextCommentary);
      setEnemyHp(nextEnemyHp);
      setMomentum("내가 유리");
      setDistance("중거리");
      setPlayerState("압박 찬스");
      setEnemyState("불리 프레임");
      triggerPlayerAttackEffect("견제 성공");
      showPhase("압박 상황", "advantage");

      appendLog(
        "빠른 견제로 끊기",
        result,
        nextCommentary,
        playerHp,
        nextEnemyHp,
        "중거리",
        "내가 유리",
        "압박 찬스",
        "불리 프레임"
      );
      return;
    }

    if (momentum === "상대가 유리") {
      const nextPlayerHp = Math.max(playerHp - 8, 0);
      const result =
        "근거리에서 무리하게 견제를 내밀었지만 상대 압박에 끊겼다. 네가 8의 피해를 입었다.";
      const nextCommentary =
        "근거리에서 상대 턴인데 버튼을 누르면 오히려 역으로 맞기 쉽다. 먼저 가드로 흐름을 확인하는 편이 좋다.";

      setMessage(result);
      setCommentary(nextCommentary);
      setPlayerHp(nextPlayerHp);
      setMomentum("상대가 유리");
      setPlayerState("불리 프레임");
      setEnemyState("압박 찬스");
      triggerEnemyAttackEffect("공격 차단");
      showPhase("반격 성공", "danger");

      appendLog(
        "빠른 견제로 끊기",
        result,
        nextCommentary,
        nextPlayerHp,
        enemyHp,
        "근거리",
        "상대가 유리",
        "불리 프레임",
        "압박 찬스"
      );
    } else {
      const nextEnemyHp = Math.max(enemyHp - 6, 0);
      const result = "근거리에서 빠른 공격으로 상대를 잠깐 멈춰세웠다. 상대가 6의 피해를 입었다.";
      const nextCommentary =
        "근거리라도 네가 먼저 움직일 수 있는 상황이면 빠른 기술로 압박을 이어갈 수 있다.";

      setMessage(result);
      setCommentary(nextCommentary);
      setEnemyHp(nextEnemyHp);
      setMomentum("내가 유리");
      setPlayerState("압박 찬스");
      setEnemyState("불리 프레임");
      triggerPlayerAttackEffect("압박 성공");
      showPhase("압박 상황", "advantage");

      appendLog(
        "빠른 견제로 끊기",
        result,
        nextCommentary,
        playerHp,
        nextEnemyHp,
        "근거리",
        "내가 유리",
        "압박 찬스",
        "불리 프레임"
      );
    }
  };

  const handleGuard = () => {
    if (playerHp <= 0 || enemyHp <= 0) return;

    if (momentum === "상대가 유리") {
      const result = "네가 침착하게 가드를 유지했다. 상대의 압박을 버티며 큰 피해를 막아냈다.";
      const nextCommentary =
        "상대가 유리한 상황에서 가드는 매우 중요하다. 불리할 때는 무조건 반격보다 먼저 살아남는 선택이 필요하다.";
      const nextDistance = distance === "근거리" ? "근거리" : "중거리";

      setMessage(result);
      setCommentary(nextCommentary);
      setMomentum("중립");
      setDistance(nextDistance);
      setPlayerState("가드 중");
      setEnemyState("뉴트럴");
      setEffectText("가드 성공");
      showPhase("뉴트럴 복귀", "neutral");

      appendLog(
        "가드하며 보기",
        result,
        nextCommentary,
        playerHp,
        enemyHp,
        nextDistance,
        "중립",
        "가드 중",
        "뉴트럴"
      );
      return;
    }

    if (momentum === "내가 유리") {
      const result =
        "네가 가드를 유지하며 상황을 봤다. 안전하긴 했지만, 유리한 흐름을 더 강하게 이어가진 못했다.";
      const nextCommentary =
        "이미 네가 유리할 때는 지나치게 소극적인 선택이 기회를 놓치게 만들 수도 있다.";

      setMessage(result);
      setCommentary(nextCommentary);
      setMomentum("중립");
      setPlayerState("뉴트럴");
      setEnemyState("뉴트럴");
      clearEffects();
      showPhase("뉴트럴", "neutral");

      appendLog(
        "가드하며 보기",
        result,
        nextCommentary,
        playerHp,
        enemyHp,
        distance,
        "중립",
        "뉴트럴",
        "뉴트럴"
      );
      return;
    }

    const result = "네가 가드를 유지하며 상대의 행동을 관찰했다. 피해는 없지만 정보를 얻었다.";
    const nextCommentary =
      "당장 공격하지 않아도 괜찮다. 가드는 시간을 벌고 상대의 습관을 읽게 해주는 중요한 선택이다.";

    setMessage(result);
    setCommentary(nextCommentary);
    setMomentum("중립");
    setDistance("중거리");
    setPlayerState("가드 중");
    setEnemyState("뉴트럴");
    clearEffects();

    appendLog(
      "가드하며 보기",
      result,
      nextCommentary,
      playerHp,
      enemyHp,
      "중거리",
      "중립",
      "가드 중",
      "뉴트럴"
    );
  };

  const handleJump = () => {
    if (playerHp <= 0 || enemyHp <= 0) return;

    if (distance === "원거리") {
      const result =
        "원거리에서 점프로 거리를 크게 좁혔다. 아직 공격은 안 들어갔지만 네가 먼저 압박을 시작할 기회를 잡았다.";
      const nextCommentary =
        "원거리에서는 점프가 단번에 거리를 줄이는 수단이 될 수 있다. 다만 상대가 준비되어 있으면 위험하다는 점은 여전하다.";

      setMessage(result);
      setCommentary(nextCommentary);
      setDistance("근거리");
      setMomentum("내가 유리");
      setPlayerState("압박 찬스");
      setEnemyState("불리 프레임");
      triggerPlayerAttackEffect("압박 성공");
      showPhase("압박 상황", "advantage");

      appendLog(
        "점프로 접근",
        result,
        nextCommentary,
        playerHp,
        enemyHp,
        "근거리",
        "내가 유리",
        "압박 찬스",
        "불리 프레임"
      );
      return;
    }

    if (distance === "중거리") {
      const nextPlayerHp = Math.max(playerHp - 15, 0);
      const result = "네가 점프로 접근했지만 상대의 대공을 맞았다. 네가 15의 피해를 입었다.";
      const nextCommentary =
        "준비된 상대에게 중거리 점프는 대공을 맞기 쉽다. 특히 중거리에서는 무리한 점프가 위험하다.";

      setMessage(result);
      setCommentary(nextCommentary);
      setPlayerHp(nextPlayerHp);
      setMomentum("상대가 유리");
      setDistance("근거리");
      setPlayerState("하드 다운");
      setEnemyState("압박 찬스");
      triggerEnemyAttackEffect("대공 피격");
      showPhase("하드 다운", "danger");

      appendLog(
        "점프로 접근",
        result,
        nextCommentary,
        nextPlayerHp,
        enemyHp,
        "근거리",
        "상대가 유리",
        "하드 다운",
        "압박 찬스"
      );
      return;
    }

    const nextPlayerHp = Math.max(playerHp - 6, 0);
    const result =
      "근거리에서 점프를 시도했지만 너무 가까워 좋은 선택이 되지 못했다. 상대가 바로 압박을 이어간다.";
    const nextCommentary =
      "근거리에서는 점프가 늦고 커다란 선택이 되기 쉽다. 이미 붙어 있는 상황에서는 가드나 빠른 기술이 더 현실적이다.";

    setMessage(result);
    setCommentary(nextCommentary);
    setMomentum("상대가 유리");
    setPlayerHp(nextPlayerHp);
    setPlayerState("하드 다운");
    setEnemyState("압박 찬스");
    triggerEnemyAttackEffect("대공 피격");
    showPhase("하드 다운", "danger");

    appendLog(
      "점프로 접근",
      result,
      nextCommentary,
      nextPlayerHp,
      enemyHp,
      "근거리",
      "상대가 유리",
      "하드 다운",
      "압박 찬스"
    );
  };

  const handleRetreat = () => {
    if (playerHp <= 0 || enemyHp <= 0) return;

    if (distance === "원거리") {
      const result = "이미 충분히 거리가 벌어져 있다. 더 물러나는 것보다 다음 행동을 준비하는 편이 낫다.";
      const nextCommentary =
        "원거리에서는 뒤로만 빠지는 것보다, 이제 어떤 방식으로 다시 주도권을 잡을지 생각해야 한다.";

      setMessage(result);
      setCommentary(nextCommentary);
      setMomentum("중립");
      setPlayerState("뉴트럴");
      setEnemyState("뉴트럴");
      clearEffects();

      appendLog(
        "뒤로 물러나기",
        result,
        nextCommentary,
        playerHp,
        enemyHp,
        "원거리",
        "중립",
        "뉴트럴",
        "뉴트럴"
      );
      return;
    }

    if (momentum === "상대가 유리") {
      const result =
        "네가 한 발 물러나 거리를 벌렸다. 상대의 압박이 약해지며 상황을 다시 정리할 수 있게 됐다.";
      const nextCommentary =
        "불리한 흐름일 때는 무조건 맞붙기보다 거리를 재정비하는 선택이 중요하다.";

      setMessage(result);
      setCommentary(nextCommentary);
      setMomentum("중립");
      setDistance("원거리");
      setPlayerState("뉴트럴");
      setEnemyState("뉴트럴");
      setEffectText("거리 재정비");
      showPhase("뉴트럴 복귀", "neutral");

      appendLog(
        "뒤로 물러나기",
        result,
        nextCommentary,
        playerHp,
        enemyHp,
        "원거리",
        "중립",
        "뉴트럴",
        "뉴트럴"
      );
      return;
    }

    if (momentum === "내가 유리") {
      const result =
        "네가 물러나며 거리를 벌렸다. 안전하지만, 공격 기회를 스스로 포기한 셈이 됐다.";
      const nextCommentary =
        "유리할 때 무조건 물러나면 흐름을 넘겨줄 수 있다. 안전과 기회 사이의 균형이 중요하다.";

      setMessage(result);
      setCommentary(nextCommentary);
      setMomentum("중립");
      setDistance("원거리");
      setPlayerState("뉴트럴");
      setEnemyState("뉴트럴");
      clearEffects();
      showPhase("뉴트럴", "neutral");

      appendLog(
        "뒤로 물러나기",
        result,
        nextCommentary,
        playerHp,
        enemyHp,
        "원거리",
        "중립",
        "뉴트럴",
        "뉴트럴"
      );
      return;
    }

    const result = "네가 한 발 물러나 거리를 벌렸다. 상대도 바로 무리하게 들어오지 못했다.";
    const nextCommentary =
      "거리를 벌리면 위험한 근거리 싸움을 피할 수 있다. 대신 다시 들어갈 타이밍은 따로 만들어야 한다.";

    setMessage(result);
    setCommentary(nextCommentary);
    setMomentum("중립");
    setDistance("원거리");
    setPlayerState("뉴트럴");
    setEnemyState("뉴트럴");
    clearEffects();
    showPhase("뉴트럴", "neutral");

    appendLog(
      "뒤로 물러나기",
      result,
      nextCommentary,
      playerHp,
      enemyHp,
      "원거리",
      "중립",
      "뉴트럴",
      "뉴트럴"
    );
  };

  const handleReset = () => {
    setPlayerHp(100);
    setEnemyHp(100);
    setDistance("중거리");
    setMomentum("중립");
    setPlayerState("뉴트럴");
    setEnemyState("뉴트럴");
    setMessage("상대가 중거리에서 천천히 접근하고 있습니다.");
    setCommentary("중거리에서는 상대의 접근을 끊을지, 일단 관찰할지 판단하는 것이 중요합니다.");
    clearEffects();
    setTurn(1);
    setLogs([]);
    setTimeline([{ turn: 0, playerHp: 100, enemyHp: 100 }]);
    setShowReview(false);

    setTimeout(() => {
      showPhase("턴 시작", "system");
    }, 200);
  };

  const actionCounts = useMemo(
    () => ({
      "빠른 견제로 끊기": logs.filter((l) => l.action === "빠른 견제로 끊기").length,
      "가드하며 보기": logs.filter((l) => l.action === "가드하며 보기").length,
      "점프로 접근": logs.filter((l) => l.action === "점프로 접근").length,
      "뒤로 물러나기": logs.filter((l) => l.action === "뒤로 물러나기").length,
    }),
    [logs]
  );

  const flashOverlayClass =
    flashType === "공격"
      ? "bg-red-400/15"
      : flashType === "피격"
      ? "bg-yellow-300/15"
      : "bg-transparent";

  const effectTextClass =
    effectText === "견제 성공" || effectText === "압박 성공"
      ? "text-red-200 border-red-400/60 bg-red-950/80"
      : effectText === "대공 피격" || effectText === "공격 차단"
      ? "text-yellow-100 border-yellow-400/60 bg-yellow-950/70"
      : effectText === "가드 성공"
      ? "text-blue-100 border-blue-400/60 bg-blue-950/70"
      : "text-zinc-100 border-white/20 bg-black/70";

  const playerTempo = momentum === "내가 유리" ? 80 : momentum === "중립" ? 50 : 30;
  const enemyPressure = momentum === "상대가 유리" ? 80 : momentum === "중립" ? 50 : 30;

  const stageShakeClass = stageShake ? "translate-y-[2px] scale-[1.01]" : "translate-y-0 scale-100";

  const stageJustify =
    distance === "근거리"
      ? "justify-center gap-4 sm:gap-8"
      : distance === "중거리"
      ? "justify-between"
      : "justify-between";

  const playerBoxClass =
    momentum === "내가 유리"
      ? "scale-105 border-red-500 bg-red-900/50 shadow-[0_0_30px_rgba(220,38,38,0.25)]"
      : "scale-100 border-red-900/60 bg-red-950/40";

  const enemyBoxClass =
    momentum === "상대가 유리"
      ? "scale-105 border-yellow-400 bg-yellow-900/30 shadow-[0_0_30px_rgba(250,204,21,0.2)]"
      : "scale-100 border-yellow-700/60 bg-yellow-950/30";

  const centerStatusColor =
    momentum === "내가 유리"
      ? "text-red-300 border-red-500/60 bg-red-950/70"
      : momentum === "상대가 유리"
      ? "text-yellow-200 border-yellow-500/60 bg-yellow-950/50"
      : "text-zinc-100 border-zinc-500 bg-zinc-900/80";

  const phaseToneClasses: Record<PhaseTone, string> = {
    neutral: "border-zinc-400/70 bg-zinc-900/85 text-zinc-100 shadow-[0_0_30px_rgba(255,255,255,0.08)]",
    danger: "border-yellow-400/70 bg-yellow-950/85 text-yellow-100 shadow-[0_0_34px_rgba(250,204,21,0.14)]",
    advantage: "border-red-400/70 bg-red-950/85 text-red-100 shadow-[0_0_34px_rgba(248,113,113,0.14)]",
    system: "border-blue-400/70 bg-blue-950/85 text-blue-100 shadow-[0_0_34px_rgba(96,165,250,0.14)]",
  };

  const fighterStateClass = (state: FighterState) => {
    switch (state) {
      case "압박 찬스":
        return "text-red-200 border-red-500/50 bg-red-950/50";
      case "가드 중":
        return "text-blue-100 border-blue-500/50 bg-blue-950/50";
      case "하드 다운":
        return "text-yellow-100 border-yellow-500/50 bg-yellow-950/50";
      case "불리 프레임":
        return "text-orange-100 border-orange-500/50 bg-orange-950/50";
      default:
        return "text-zinc-100 border-zinc-600 bg-zinc-900/60";
    }
  };

  if (showReview) {
    const win = enemyHp <= 0;

    return (
      <main className="min-h-screen bg-black p-3 sm:p-6 text-white">
        <div className="mx-auto w-full max-w-[1500px]">
          <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs font-black tracking-[0.28em] text-zinc-500">POST MATCH REVIEW</div>
            <button
              onClick={handleReset}
              className="border border-zinc-500 bg-zinc-900 px-4 py-2 text-sm font-black hover:border-white"
            >
              다시 시작
            </button>
          </div>

          <div className="mb-4 sm:mb-6 rounded-3xl border border-zinc-700 bg-gradient-to-b from-zinc-950 to-black p-4 sm:p-6 shadow-2xl">
            <div className="mb-3 sm:mb-4 text-sm tracking-[0.25em] text-zinc-500">RESULT</div>
            <div className={`text-3xl sm:text-4xl font-black ${win ? "text-red-300" : "text-yellow-200"}`}>
              {win ? "승리" : "패배"}
            </div>
            <div className="mt-2 text-sm sm:text-base text-zinc-300">
              {win
                ? "상대를 먼저 무너뜨렸다. 어떤 선택이 흐름을 유리하게 만들었는지 확인해보자."
                : "패배했지만, 어떤 선택에서 흐름이 무너졌는지 복기하면 다음 판의 실력이 오른다."}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-zinc-700 bg-zinc-950 p-4 sm:p-6 shadow-2xl">
              <div className="mb-4 text-sm font-black tracking-[0.22em] text-zinc-400">
                전투 전황 정리 그래프
              </div>

              <div className="space-y-3 sm:space-y-4">
                {timeline.map((point) => (
                  <div key={point.turn} className="rounded-2xl border border-zinc-800 bg-black/40 p-3 sm:p-4">
                    <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-zinc-400">
                      <span>턴 {point.turn}</span>
                      <span>
                        내 체력 {point.playerHp} / 상대 체력 {point.enemyHp}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="mb-1 text-xs text-zinc-500">내 체력</div>
                      <div className="h-4 sm:h-5 w-full overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-red-700 to-red-400"
                          style={{ width: `${point.playerHp}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 text-xs text-zinc-500">상대 체력</div>
                      <div className="h-4 sm:h-5 w-full overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-700 to-yellow-300"
                          style={{ width: `${point.enemyHp}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-rows-[auto_auto_1fr]">
              <div className="rounded-3xl border border-zinc-700 bg-zinc-950 p-4 sm:p-6 shadow-2xl">
                <div className="mb-4 text-sm font-black tracking-[0.22em] text-zinc-400">선택 통계</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-zinc-800 bg-black/40 p-3 sm:p-4">
                    <div className="text-zinc-500 text-xs sm:text-sm">빠른 견제로 끊기</div>
                    <div className="mt-2 text-xl sm:text-2xl font-black text-red-300">
                      {actionCounts["빠른 견제로 끊기"]}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-black/40 p-3 sm:p-4">
                    <div className="text-zinc-500 text-xs sm:text-sm">가드하며 보기</div>
                    <div className="mt-2 text-xl sm:text-2xl font-black text-zinc-200">
                      {actionCounts["가드하며 보기"]}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-black/40 p-3 sm:p-4">
                    <div className="text-zinc-500 text-xs sm:text-sm">점프로 접근</div>
                    <div className="mt-2 text-xl sm:text-2xl font-black text-yellow-200">
                      {actionCounts["점프로 접근"]}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-black/40 p-3 sm:p-4">
                    <div className="text-zinc-500 text-xs sm:text-sm">뒤로 물러나기</div>
                    <div className="mt-2 text-xl sm:text-2xl font-black text-blue-200">
                      {actionCounts["뒤로 물러나기"]}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-700 bg-zinc-950 p-4 sm:p-6 shadow-2xl">
                <div className="mb-4 text-sm font-black tracking-[0.22em] text-zinc-400">간단 총평</div>
                <div className="space-y-2 text-sm sm:text-base text-zinc-300">
                  <p>총 턴 수: {logs.length}</p>
                  <p>공격적 선택 횟수: {actionCounts["빠른 견제로 끊기"] + actionCounts["점프로 접근"]}</p>
                  <p>
                    수비/거리 조절 선택 횟수:{" "}
                    {actionCounts["가드하며 보기"] + actionCounts["뒤로 물러나기"]}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-700 bg-zinc-950 p-4 sm:p-6 shadow-2xl">
                <div className="mb-4 text-sm font-black tracking-[0.22em] text-zinc-400">턴별 선택 복기</div>

                <div className="max-h-[420px] sm:max-h-[520px] space-y-3 overflow-y-auto pr-1 sm:pr-2">
                  {logs.map((log) => (
                    <div key={log.turn} className="rounded-2xl border border-zinc-800 bg-black/40 p-3 sm:p-4">
                      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm font-black text-zinc-300">턴 {log.turn}</div>
                        <div className="text-xs text-zinc-500">
                          {log.distanceAfter} · {log.momentumAfter}
                        </div>
                      </div>

                      <div className="mb-2 text-base sm:text-lg font-black text-white">{log.action}</div>
                      <div className="mb-2 text-sm sm:text-base text-zinc-200">{log.result}</div>
                      <div className="text-xs sm:text-sm leading-5 sm:leading-6 text-zinc-400">
                        {log.commentary}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500">
                        <span>내 체력: {log.playerHpAfter}</span>
                        <span>상대 체력: {log.enemyHpAfter}</span>
                        <span>내 상태: {log.playerStateAfter}</span>
                        <span>상대 상태: {log.enemyStateAfter}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes phaseSlideCenter {
          0% {
            transform: translateX(-120vw) scale(0.96);
            opacity: 0;
          }
          18% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          72% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(120vw) scale(0.98);
            opacity: 0;
          }
        }

        .phase-banner-anim {
          animation: phaseSlideCenter 1.55s cubic-bezier(0.22, 0.9, 0.22, 1) forwards;
        }
      `}</style>

      <main className="min-h-screen bg-black p-3 sm:p-6 text-white">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="mb-3 sm:mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[10px] sm:text-xs font-black tracking-[0.28em] text-zinc-500">TRAINING BUILD</div>
            <div className="text-[10px] sm:text-xs font-black tracking-[0.28em] text-zinc-500">RESPONSIVE LAYOUT</div>
          </div>

          <div className="relative w-full overflow-hidden rounded-[20px] sm:rounded-[28px] border border-zinc-700 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 shadow-[0_0_60px_rgba(0,0,0,0.65)]">
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_60%)]" />

            {phaseBanner && (
              <div className="pointer-events-none absolute inset-0 z-[60] flex items-center justify-center overflow-hidden">
                <div
                  key={phaseBanner.id}
                  className={`phase-banner-anim min-w-[220px] max-w-[88vw] px-8 py-4 text-center text-xl sm:text-3xl font-black tracking-[0.18em] border [clip-path:polygon(3%_0,100%_0,97%_100%,0_100%)] backdrop-blur-sm ${
                    phaseToneClasses[phaseBanner.tone]
                  }`}
                >
                  {phaseBanner.text}
                </div>
              </div>
            )}

            <div className="flex flex-col">
              <div className="border-b border-zinc-800 bg-zinc-950/90 px-3 py-3 sm:px-5 sm:py-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2 sm:gap-3">
                      <div className="px-2 py-1 text-[10px] sm:text-xs font-black tracking-[0.2em] text-red-300 bg-red-950 border border-red-500/40 [clip-path:polygon(0_0,100%_0,92%_100%,0_100%)]">
                        PLAYER
                      </div>
                      <div className="text-xs sm:text-sm text-zinc-400">격투 입문자</div>
                    </div>

                    <div
                      className={`w-full h-6 sm:h-8 overflow-hidden border border-zinc-700 bg-zinc-800 [clip-path:polygon(0_0,100%_0,96%_100%,0_100%)] transition-all duration-200 ${
                        playerHpPulse ? "ring-2 ring-yellow-300" : ""
                      }`}
                    >
                      <div
                        className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-300"
                        style={{ width: `${playerHp}%` }}
                      />
                    </div>

                    <div className="mt-2 flex items-center gap-2 sm:gap-3">
                      <div className="w-12 sm:w-16 text-[10px] sm:text-xs text-zinc-400">템포</div>
                      <div className="h-2.5 sm:h-3 flex-1 overflow-hidden border border-zinc-700 bg-zinc-800 [clip-path:polygon(0_0,100%_0,96%_100%,0_100%)]">
                        <div
                          className="h-full bg-gradient-to-r from-red-900 to-red-400 transition-all duration-300"
                          style={{ width: `${playerTempo}%` }}
                        />
                      </div>
                      <div className="w-8 sm:w-10 text-right text-xs sm:text-sm font-bold text-zinc-200">{playerHp}</div>
                    </div>
                  </div>

                  <div className="flex flex-row justify-center gap-3 sm:flex-col sm:items-center sm:px-3">
                    <div className="hidden sm:block text-xs tracking-[0.35em] text-zinc-500">ROUND</div>
                    <div className="px-4 py-1.5 sm:px-5 sm:py-2 text-2xl sm:text-3xl font-black border border-zinc-600 bg-zinc-900 shadow-lg [clip-path:polygon(10%_0,100%_0,90%_100%,0_100%)]">
                      1
                    </div>
                    <div className="px-3 py-1 sm:mt-2 sm:px-4 sm:py-1 text-xl sm:text-2xl font-black text-zinc-100 border border-zinc-700 bg-black [clip-path:polygon(8%_0,100%_0,92%_100%,0_100%)]">
                      99
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="mb-2 flex items-center justify-end gap-2 sm:gap-3">
                      <div className="text-xs sm:text-sm text-zinc-400">압박형 상대</div>
                      <div className="px-2 py-1 text-[10px] sm:text-xs font-black tracking-[0.2em] text-yellow-200 bg-yellow-950 border border-yellow-500/40 [clip-path:polygon(8%_0,100%_0,100%_100%,0_100%)]">
                        ENEMY
                      </div>
                    </div>

                    <div
                      className={`w-full h-6 sm:h-8 overflow-hidden border border-zinc-700 bg-zinc-800 [clip-path:polygon(4%_0,100%_0,100%_100%,0_100%)] transition-all duration-200 ${
                        enemyHpPulse ? "ring-2 ring-red-400" : ""
                      }`}
                    >
                      <div
                        className="ml-auto h-full bg-gradient-to-l from-yellow-600 to-yellow-400 transition-all duration-300"
                        style={{ width: `${enemyHp}%` }}
                      />
                    </div>

                    <div className="mt-2 flex items-center gap-2 sm:gap-3">
                      <div className="w-8 sm:w-10 text-xs sm:text-sm font-bold text-zinc-200">{enemyHp}</div>
                      <div className="h-2.5 sm:h-3 flex-1 overflow-hidden border border-zinc-700 bg-zinc-800 [clip-path:polygon(4%_0,100%_0,100%_100%,0_100%)]">
                        <div
                          className="ml-auto h-full bg-gradient-to-l from-yellow-800 to-yellow-300 transition-all duration-300"
                          style={{ width: `${enemyPressure}%` }}
                        />
                      </div>
                      <div className="w-12 sm:w-16 text-right text-[10px] sm:text-xs text-zinc-400">압박</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 p-3 sm:gap-4 sm:p-4 lg:grid-cols-[1.45fr_0.75fr]">
                <div className="flex min-h-0 flex-col gap-3 sm:gap-4">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                    <div className="border border-zinc-700 bg-zinc-900 px-3 py-2 sm:px-4 sm:py-3 [clip-path:polygon(0_0,100%_0,96%_100%,0_100%)]">
                      <div className="mb-1 text-[10px] sm:text-xs tracking-[0.2em] text-zinc-500">DISTANCE</div>
                      <div className="text-lg sm:text-xl font-black">{distance}</div>
                    </div>
                    <div className="border border-zinc-700 bg-zinc-900 px-3 py-2 sm:px-4 sm:py-3 [clip-path:polygon(4%_0,100%_0,100%_100%,0_100%)]">
                      <div className="mb-1 text-[10px] sm:text-xs tracking-[0.2em] text-zinc-500">MOMENTUM</div>
                      <div className="text-lg sm:text-xl font-black">{momentum}</div>
                    </div>
                    <div className={`border px-3 py-2 sm:px-4 sm:py-3 [clip-path:polygon(0_0,100%_0,96%_100%,0_100%)] ${fighterStateClass(playerState)}`}>
                      <div className="mb-1 text-[10px] sm:text-xs tracking-[0.2em] opacity-70">내 상태</div>
                      <div className="text-sm sm:text-lg font-black">{playerState}</div>
                    </div>
                    <div className={`border px-3 py-2 sm:px-4 sm:py-3 [clip-path:polygon(4%_0,100%_0,100%_100%,0_100%)] ${fighterStateClass(enemyState)}`}>
                      <div className="mb-1 text-[10px] sm:text-xs tracking-[0.2em] opacity-70">상대 상태</div>
                      <div className="text-sm sm:text-lg font-black">{enemyState}</div>
                    </div>
                  </div>

                  <div
                    className={`relative min-h-0 overflow-hidden rounded-3xl border border-zinc-700 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black shadow-2xl transition-all duration-200 ${stageShakeClass}`}
                  >
                    <div className={`pointer-events-none absolute inset-0 z-20 transition-all duration-150 ${flashOverlayClass}`} />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_58%)]" />
                    <div className="absolute inset-0 opacity-25 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_60%)]" />
                    <div className="absolute left-0 right-0 bottom-12 sm:bottom-16 h-[2px] bg-zinc-700" />
                    <div className="absolute left-4 right-4 sm:left-10 sm:right-10 bottom-20 sm:bottom-28 h-px bg-zinc-800" />

                    <div className="relative z-10 flex items-center justify-between border-b border-zinc-800 bg-black/40 px-4 py-3 sm:px-6 sm:py-4">
                      <div className="px-2 py-1 sm:px-3 text-[10px] sm:text-xs font-black tracking-[0.22em] text-zinc-300 border border-zinc-600 bg-zinc-900 [clip-path:polygon(0_0,100%_0,90%_100%,0_100%)]">
                        BATTLE FIELD
                      </div>
                      <div className="text-[10px] sm:text-sm text-zinc-400">학습 전투 시뮬레이션</div>
                    </div>

                    <div className="absolute top-4 sm:top-6 left-1/2 z-20 w-full max-w-3xl -translate-x-1/2 px-3 sm:px-4">
                      <div className="border border-zinc-700 bg-black/55 px-4 py-3 sm:px-5 sm:py-4 text-center text-sm sm:text-base font-semibold text-zinc-100 shadow-xl backdrop-blur-sm [clip-path:polygon(3%_0,100%_0,97%_100%,0_100%)]">
                        {message}
                      </div>
                    </div>

                    {effectText !== "없음" && (
                      <div className="absolute top-20 sm:top-28 left-1/2 z-30 -translate-x-1/2">
                        <div
                          className={`px-5 py-2 sm:px-7 text-sm sm:text-xl font-black tracking-[0.18em] sm:tracking-[0.22em] border shadow-2xl animate-pulse [clip-path:polygon(6%_0,100%_0,94%_100%,0_100%)] ${effectTextClass}`}
                        >
                          {effectText}
                        </div>
                      </div>
                    )}

                    {showHitSpark && (
                      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                        <div className="relative h-28 w-28 sm:h-44 sm:w-44">
                          <div className="absolute inset-0 scale-125 rounded-full bg-white/20 blur-2xl" />
                          <div className="absolute left-1/2 top-1/2 h-[3px] w-28 sm:w-40 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" />
                          <div className="absolute left-1/2 top-1/2 h-[3px] w-28 sm:w-40 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-white" />
                          <div className="absolute left-1/2 top-1/2 h-[3px] w-20 sm:w-28 -translate-x-1/2 -translate-y-1/2 rotate-[14deg] bg-yellow-300" />
                          <div className="absolute left-1/2 top-1/2 h-[3px] w-20 sm:w-28 -translate-x-1/2 -translate-y-1/2 -rotate-[18deg] bg-red-400" />
                        </div>
                      </div>
                    )}

                    <div className="absolute left-1/2 bottom-16 sm:bottom-24 z-20 -translate-x-1/2">
                      <div
                        className={`px-4 py-2 sm:px-5 text-xs sm:text-sm font-black tracking-[0.12em] sm:tracking-[0.18em] border shadow-lg [clip-path:polygon(8%_0,100%_0,92%_100%,0_100%)] ${centerStatusColor}`}
                      >
                        {distance} · {momentum}
                      </div>
                    </div>

                    <div className={`relative z-10 flex min-h-[320px] sm:min-h-[520px] items-end ${stageJustify} px-4 pb-6 pt-24 sm:px-10 sm:pb-8 sm:pt-28 transition-all duration-300`}>
                      <div
                        className={`flex flex-col items-center transition-all duration-300 ${
                          distance === "원거리" ? "translate-x-0" : distance === "중거리" ? "translate-x-2 sm:translate-x-6" : "translate-x-4 sm:translate-x-10"
                        } ${playerLunge ? "translate-x-8 sm:translate-x-16 -translate-y-2 scale-110" : ""}`}
                      >
                        <div className="mb-2 sm:mb-3 px-2 py-1 sm:px-3 text-[10px] sm:text-xs font-black tracking-[0.16em] sm:tracking-[0.2em] text-red-200 border border-red-500/30 bg-red-950/50 [clip-path:polygon(0_0,100%_0,92%_100%,0_100%)]">
                          PLAYER SIDE
                        </div>
                        <div
                          className={`h-40 w-28 sm:h-64 sm:w-48 border flex items-center justify-center px-2 sm:px-4 text-center text-sm sm:text-lg font-bold transition-all duration-300 [clip-path:polygon(0_0,100%_0,92%_100%,0_100%)] ${playerBoxClass}`}
                        >
                          내 캐릭터
                        </div>
                      </div>

                      <div
                        className={`flex flex-col items-center transition-all duration-300 ${
                          distance === "원거리" ? "translate-x-0" : distance === "중거리" ? "-translate-x-2 sm:-translate-x-6" : "-translate-x-4 sm:-translate-x-10"
                        } ${enemyLunge ? "-translate-x-8 sm:-translate-x-16 -translate-y-2 scale-110" : ""}`}
                      >
                        <div className="mb-2 sm:mb-3 px-2 py-1 sm:px-3 text-[10px] sm:text-xs font-black tracking-[0.16em] sm:tracking-[0.2em] text-yellow-100 border border-yellow-500/30 bg-yellow-950/40 [clip-path:polygon(8%_0,100%_0,100%_100%,0_100%)]">
                          ENEMY SIDE
                        </div>
                        <div
                          className={`h-40 w-28 sm:h-64 sm:w-48 border flex items-center justify-center px-2 sm:px-4 text-center text-sm sm:text-lg font-bold transition-all duration-300 [clip-path:polygon(8%_0,100%_0,100%_100%,0_100%)] ${enemyBoxClass}`}
                        >
                          상대 캐릭터
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-rows-[0.42fr_1.58fr]">
                  <div className="overflow-hidden border border-blue-900 bg-zinc-950 shadow-lg [clip-path:polygon(2%_0,100%_0,98%_100%,0_100%)]">
                    <div className="border-b border-blue-950 bg-blue-950/30 px-4 py-2 sm:px-5 text-xs sm:text-sm font-black tracking-[0.2em] text-blue-300">
                      COMMENTARY
                    </div>
                    <div className="px-4 py-3 sm:px-5 text-xs sm:text-sm leading-5 text-zinc-200">
                      {commentary}
                    </div>
                  </div>

                  <div className="min-h-0 overflow-hidden border border-zinc-700 bg-zinc-950 shadow-lg [clip-path:polygon(2%_0,100%_0,98%_100%,0_100%)]">
                    <div className="border-b border-zinc-800 bg-zinc-900/70 px-4 py-3 sm:px-5 text-xs sm:text-sm font-black tracking-[0.2em] text-zinc-300">
                      COMMAND PANEL
                    </div>

                    <div className="grid gap-2 p-3 content-start sm:grid-cols-2 lg:grid-cols-1">
                      <button
                        onClick={handleFastPoke}
                        disabled={playerHp <= 0 || enemyHp <= 0}
                        className="group border border-red-500/30 bg-gradient-to-r from-red-950 to-zinc-900 px-4 py-2 text-left transition hover:border-red-400 hover:translate-y-[-2px] disabled:opacity-40 [clip-path:polygon(0_0,100%_0,96%_100%,0_100%)]"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[10px] font-black tracking-[0.22em] text-red-300">OFFENSE</span>
                          <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300">01</span>
                        </div>
                        <div className="text-sm font-black xl:text-base">빠른 견제로 끊기</div>
                      </button>

                      <button
                        onClick={handleGuard}
                        disabled={playerHp <= 0 || enemyHp <= 0}
                        className="group border border-zinc-600 bg-gradient-to-r from-zinc-900 to-zinc-950 px-4 py-2 text-left transition hover:border-zinc-400 hover:translate-y-[-2px] disabled:opacity-40 [clip-path:polygon(4%_0,100%_0,100%_100%,0_100%)]"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[10px] font-black tracking-[0.22em] text-zinc-300">DEFENSE</span>
                          <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300">02</span>
                        </div>
                        <div className="text-sm font-black xl:text-base">가드하며 보기</div>
                      </button>

                      <button
                        onClick={handleJump}
                        disabled={playerHp <= 0 || enemyHp <= 0}
                        className="group border border-yellow-500/30 bg-gradient-to-r from-yellow-950/60 to-zinc-900 px-4 py-2 text-left transition hover:border-yellow-400 hover:translate-y-[-2px] disabled:opacity-40 [clip-path:polygon(0_0,100%_0,96%_100%,0_100%)]"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[10px] font-black tracking-[0.22em] text-yellow-200">RISK</span>
                          <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300">03</span>
                        </div>
                        <div className="text-sm font-black xl:text-base">점프로 접근</div>
                      </button>

                      <button
                        onClick={handleRetreat}
                        disabled={playerHp <= 0 || enemyHp <= 0}
                        className="group border border-blue-500/30 bg-gradient-to-r from-blue-950/50 to-zinc-900 px-4 py-2 text-left transition hover:border-blue-400 hover:translate-y-[-2px] disabled:opacity-40 [clip-path:polygon(4%_0,100%_0,100%_100%,0_100%)]"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[10px] font-black tracking-[0.22em] text-blue-200">SPACE</span>
                          <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300">04</span>
                        </div>
                        <div className="text-sm font-black xl:text-base">뒤로 물러나기</div>
                      </button>

                      <button
                        onClick={handleReset}
                        className="sm:col-span-2 lg:col-span-1 border border-zinc-500 bg-gradient-to-r from-zinc-800 to-zinc-950 px-4 py-2 text-center transition hover:border-white hover:translate-y-[-2px] [clip-path:polygon(2%_0,100%_0,98%_100%,0_100%)]"
                      >
                        <div className="text-sm font-black xl:text-base">다시 시작</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {(playerHp <= 0 || enemyHp <= 0) && (
                <div className="border-t border-zinc-800 bg-black/60 px-4 py-3 sm:px-5">
                  <div className="text-center text-lg sm:text-2xl font-black tracking-[0.12em] sm:tracking-[0.18em] text-zinc-100 animate-pulse">
                    {enemyHp <= 0 ? "승리! 상대를 쓰러뜨렸다." : "패배... 네가 쓰러졌다."}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}