"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ActionCardRow } from "@/components/game/ActionCardRow";
import { BattleField } from "@/components/game/BattleField";
import { BattleHud } from "@/components/game/BattleHud";
import { CommentaryBox } from "@/components/game/CommentaryBox";
import { DuelOverlay } from "@/components/game/DuelOverlay";
import { PhaseBanner } from "@/components/game/PhaseBanner";
import { ReviewScreen } from "@/components/game/ReviewScreen";
import {
  FORCED_VULNERABLE_CARD,
  GRID_COLS,
  PHASE_META,
  TOTAL_HEARTS_HALF,
  UNIVERSAL_AWAKENING_CARD,
  UNIVERSAL_BURST_CARD,
  getCardsForPhase,
} from "@/lib/game/data";
import { deriveDistanceLabel, resolvePhaseTurn } from "@/lib/game/phase";
import { pickWeightedRandomCard } from "@/lib/game/random";
import type {
  CardDefinition,
  DuelOverlayState,
  GameContext,
  GameState,
  OpponentPersonality,
  PhaseBannerState,
  PhaseId,
  PlayerRoleInPhase,
  TurnRecord,
} from "@/lib/game/types";

const INITIAL_PLAYER_X = 2;
const INITIAL_ENEMY_X = 6;
const ENEMY_PERSONALITY: OpponentPersonality = "defensive";
const DUEL_ANIMATION_MS = 4800;

function buildCardPool(
  phase: PhaseId,
  role: PlayerRoleInPhase,
  canUseBurst: boolean,
  canUseAwakening: boolean
) {
  const cards = [...getCardsForPhase(phase, role)];
  if (canUseBurst) cards.push(UNIVERSAL_BURST_CARD);
  if (canUseAwakening) cards.push(UNIVERSAL_AWAKENING_CARD);
  return cards;
}

function buildTurnRecord(
  prevState: GameState,
  result: ReturnType<typeof resolvePhaseTurn>,
  playerCard: CardDefinition,
  enemyCard: CardDefinition
): TurnRecord {
  return {
    turn: prevState.turn,
    phaseLabel: PHASE_META[prevState.phase]?.label ?? "국면",
    playerCardTitle: playerCard.title,
    enemyCardTitle: enemyCard.title,
    outcome: result.duelOutcome,
    playerLifeBefore: prevState.playerHeartsHalf,
    playerLifeAfter: result.nextPlayerHeartsHalf,
    enemyLifeBefore: prevState.enemyHeartsHalf,
    enemyLifeAfter: result.nextEnemyHeartsHalf,
    distanceBefore: deriveDistanceLabel(prevState.playerX, prevState.enemyX),
    distanceAfter: deriveDistanceLabel(result.nextPlayerX, result.nextEnemyX),
    note: result.effectText || result.message,
  };
}

export default function Page() {
  const [state, setState] = useState<GameState>({
    playerHeartsHalf: TOTAL_HEARTS_HALF,
    enemyHeartsHalf: TOTAL_HEARTS_HALF,
    playerTension: 0,
    enemyTension: 0,
    playerX: INITIAL_PLAYER_X,
    enemyX: INITIAL_ENEMY_X,
    playerPose: "stand",
    enemyPose: "stand",
    phase: "opening",
    playerRoleInPhase: "neutral",
    playerStateText: "뉴트럴",
    enemyStateText: "뉴트럴",
    message: "개막이다. 거리와 높이를 먼저 읽어라.",
    commentary:
      "이번 버전은 4x9 전장과 하트 4개 체력을 기준으로 진행된다.",
    turn: 1,
    round: 1,
    effectText: "",
    enemyPersonality: ENEMY_PERSONALITY,
    lastPlayerCardId: null,
    lastEnemyCardId: null,
    playerBurstUsed: false,
    enemyBurstUsed: false,
    playerVulnerable: false,
    enemyVulnerable: false,
  });

  const [history, setHistory] = useState<TurnRecord[]>([]);
  const [banner, setBanner] = useState<PhaseBannerState | null>(null);
  const [duelOverlay, setDuelOverlay] = useState<DuelOverlayState | null>(null);
  const [hoveredCard, setHoveredCard] = useState<CardDefinition | null>(null);

  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const duelApplyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canUsePlayerAwakening = state.playerTension >= 50;
  const canUseEnemyAwakening = state.enemyTension >= 50;

  const currentCards = useMemo(() => {
    if (state.playerVulnerable) return [];
    return buildCardPool(
      state.phase,
      state.playerRoleInPhase,
      !state.playerBurstUsed,
      canUsePlayerAwakening
    ).filter((card) => (card.tensionCost ?? 0) <= state.playerTension);
  }, [
    state.phase,
    state.playerRoleInPhase,
    state.playerBurstUsed,
    state.playerVulnerable,
    canUsePlayerAwakening,
    state.playerTension,
  ]);

  const phaseTitle = useMemo(
    () => PHASE_META[state.phase]?.label ?? "국면",
    [state.phase]
  );

  const distanceLabel = useMemo(() => {
    return deriveDistanceLabel(state.playerX, state.enemyX);
  }, [state.playerX, state.enemyX]);

  const enemyRole: PlayerRoleInPhase = useMemo(() => {
    if (state.playerRoleInPhase === "attacker") return "defender";
    if (state.playerRoleInPhase === "defender") return "attacker";
    return "neutral";
  }, [state.playerRoleInPhase]);

  const isGameOver = state.playerHeartsHalf <= 0 || state.enemyHeartsHalf <= 0;
  const isDuelPlaying = duelOverlay !== null;

  const showBanner = (phase: PhaseId) => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);

    setBanner({
      id: Date.now(),
      text: PHASE_META[phase]?.label ?? "국면",
      tone: PHASE_META[phase]?.tone ?? "system",
    });

    bannerTimerRef.current = setTimeout(() => {
      setBanner(null);
    }, 1600);
  };

  useEffect(() => {
    showBanner("opening");

    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
      if (duelApplyTimerRef.current) clearTimeout(duelApplyTimerRef.current);
    };
  }, []);

  const applyResolvedResult = (
    prevState: GameState,
    result: ReturnType<typeof resolvePhaseTurn>,
    playerCard: CardDefinition,
    enemyCard: CardDefinition
  ) => {
    setHistory((prev) => [
      ...prev,
      buildTurnRecord(prevState, result, playerCard, enemyCard),
    ]);

    setState((prev) => ({
      ...prev,
      playerHeartsHalf: result.nextPlayerHeartsHalf,
      enemyHeartsHalf: result.nextEnemyHeartsHalf,
      playerTension: result.nextPlayerTension,
      enemyTension: result.nextEnemyTension,
      playerX: result.nextPlayerX,
      enemyX: result.nextEnemyX,
      playerPose: result.nextPlayerPose,
      enemyPose: result.nextEnemyPose,
      phase: result.nextPhase,
      playerRoleInPhase: result.nextPlayerRoleInPhase,
      playerStateText: result.nextPlayerStateText,
      enemyStateText: result.nextEnemyStateText,
      message: result.message,
      commentary: result.commentary,
      effectText: result.effectText ?? "",
      turn: prev.turn + 1,
      lastPlayerCardId: playerCard.id,
      lastEnemyCardId: enemyCard.id,
      playerBurstUsed:
        prev.playerBurstUsed || playerCard.id === UNIVERSAL_BURST_CARD.id,
      enemyBurstUsed:
        prev.enemyBurstUsed || enemyCard.id === UNIVERSAL_BURST_CARD.id,
      playerVulnerable: result.nextPlayerVulnerable,
      enemyVulnerable: result.nextEnemyVulnerable,
    }));

    setDuelOverlay(null);
    setHoveredCard(null);

    const willGameEnd =
      result.nextPlayerHeartsHalf <= 0 || result.nextEnemyHeartsHalf <= 0;

    if (!willGameEnd) {
      showBanner(result.nextPhase);
    }
  };

  const startResolution = (
    currentStateForTurn: GameState,
    playerCard: CardDefinition,
    enemyCard: CardDefinition
  ) => {
    const context: GameContext = {
      currentState: currentStateForTurn,
      playerCard,
      enemyCard,
    };

    const result = resolvePhaseTurn(context);

    setDuelOverlay({
      playerCard,
      enemyCard,
      outcome: result.duelOutcome,
    });

    if (duelApplyTimerRef.current) clearTimeout(duelApplyTimerRef.current);

    duelApplyTimerRef.current = setTimeout(() => {
      applyResolvedResult(currentStateForTurn, result, playerCard, enemyCard);
    }, DUEL_ANIMATION_MS);
  };

  const spendTensionForCard = (baseTension: number, card: CardDefinition) => {
    return Math.max(0, baseTension - (card.tensionCost ?? 0));
  };

  const pickEnemyCard = (snapshot: GameState) => {
    if (snapshot.enemyVulnerable) return FORCED_VULNERABLE_CARD;

    const pool = buildCardPool(
      snapshot.phase,
      enemyRole,
      !snapshot.enemyBurstUsed,
      snapshot.enemyTension >= 50
    ).filter((card) => (card.tensionCost ?? 0) <= snapshot.enemyTension);

    return pickWeightedRandomCard({
      cards: pool,
      state: snapshot,
      role: enemyRole,
      personality: snapshot.enemyPersonality,
    });
  };

  const handleSelectCard = (playerCard: CardDefinition) => {
    if (isGameOver || isDuelPlaying || state.playerVulnerable) return;
    if ((playerCard.tensionCost ?? 0) > state.playerTension) return;

    const enemyCardPreview = pickEnemyCard(state);

    const snapshot: GameState = {
      ...state,
      playerTension: spendTensionForCard(state.playerTension, playerCard),
      enemyTension: spendTensionForCard(state.enemyTension, enemyCardPreview),
    };

    startResolution(snapshot, playerCard, enemyCardPreview);
  };

  const handleAdvanceVulnerableTurn = () => {
    if (isGameOver || isDuelPlaying || !state.playerVulnerable) return;

    const enemyCard = pickEnemyCard(state);
    const snapshot: GameState = {
      ...state,
      enemyTension: spendTensionForCard(state.enemyTension, enemyCard),
    };

    startResolution(snapshot, FORCED_VULNERABLE_CARD, enemyCard);
  };

  const handleReset = () => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    if (duelApplyTimerRef.current) clearTimeout(duelApplyTimerRef.current);

    setDuelOverlay(null);
    setHoveredCard(null);
    setHistory([]);

    setState({
      playerHeartsHalf: TOTAL_HEARTS_HALF,
      enemyHeartsHalf: TOTAL_HEARTS_HALF,
      playerTension: 0,
      enemyTension: 0,
      playerX: INITIAL_PLAYER_X,
      enemyX: INITIAL_ENEMY_X,
      playerPose: "stand",
      enemyPose: "stand",
      phase: "opening",
      playerRoleInPhase: "neutral",
      playerStateText: "뉴트럴",
      enemyStateText: "뉴트럴",
      message: "개막이다. 거리와 높이를 먼저 읽어라.",
      commentary:
        "이번 버전은 4x9 전장과 하트 4개 체력을 기준으로 진행된다.",
      turn: 1,
      round: 1,
      effectText: "",
      enemyPersonality: ENEMY_PERSONALITY,
      lastPlayerCardId: null,
      lastEnemyCardId: null,
      playerBurstUsed: false,
      enemyBurstUsed: false,
      playerVulnerable: false,
      enemyVulnerable: false,
    });

    showBanner("opening");
  };

  const selectionTitle = useMemo(() => {
    if (state.playerVulnerable) return "무방비 상태";
    if (state.playerRoleInPhase === "attacker") return "공격자 선택지";
    if (state.playerRoleInPhase === "defender") return "수비자 선택지";
    return "뉴트럴 선택지";
  }, [state.playerRoleInPhase, state.playerVulnerable]);

  const selectionDescription = useMemo(() => {
    if (state.playerVulnerable) {
      return "잡기/무적/각성 필살기 실패 후 딜레이가 길게 남았다.";
    }
    if (state.playerRoleInPhase === "attacker") {
      return "지금은 네가 흐름을 쥐고 있다. 압박의 방향을 고르자.";
    }
    if (state.playerRoleInPhase === "defender") {
      return "지금은 수세다. 버틸지, 탈출할지, 뒤집을지 고르자.";
    }
    return "마우스를 올리면 빨간 박스로 공격 판정 범위를 미리 볼 수 있다.";
  }, [state.playerRoleInPhase, state.playerVulnerable]);

  return (
    <>
      <style jsx global>{`
        html,
        body {
          height: 100%;
          overflow: hidden;
        }

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
          animation: phaseSlideCenter 1.55s cubic-bezier(0.22, 0.9, 0.22, 1)
            forwards;
        }
      `}</style>

      <main className="h-screen overflow-hidden bg-black p-3 text-white sm:p-6">
        <div className="mx-auto flex h-full w-full max-w-[1700px] flex-col">
          <div className="mb-3 flex items-center justify-between sm:mb-4">
            <div className="text-[10px] font-black tracking-[0.28em] text-zinc-500 sm:text-xs">
              TRAINING BUILD V4 · 4x9 GRID · HEART SYSTEM
            </div>

            <button
              onClick={handleReset}
              className="relative z-30 rounded-md border border-zinc-500 bg-zinc-900 px-3 py-2 text-[11px] font-black tracking-[0.12em] hover:border-white sm:text-sm"
            >
              다시 시작
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden rounded-[20px] border border-zinc-700 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 shadow-[0_0_60px_rgba(0,0,0,0.65)] sm:rounded-[28px]">
            <div className="pointer-events-none absolute inset-0 z-0 opacity-20 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_60%)]" />

            {banner && <PhaseBanner banner={banner} />}
            {duelOverlay && (
              <DuelOverlay
                playerCard={duelOverlay.playerCard}
                enemyCard={duelOverlay.enemyCard}
                outcome={duelOverlay.outcome}
              />
            )}

            {!isGameOver ? (
              <div className="relative z-10 flex h-full flex-col">
                <BattleHud
                  playerHeartsHalf={state.playerHeartsHalf}
                  enemyHeartsHalf={state.enemyHeartsHalf}
                  playerTension={state.playerTension}
                  enemyTension={state.enemyTension}
                  round={state.round}
                  distanceLabel={distanceLabel}
                  phaseTitle={phaseTitle}
                  playerStateText={state.playerStateText}
                  enemyStateText={state.enemyStateText}
                  enemyPersonalityLabel={
                    state.enemyPersonality === "defensive"
                      ? "수비형 상대"
                      : "균형형 상대"
                  }
                  playerBurstUsed={state.playerBurstUsed}
                  enemyBurstUsed={state.enemyBurstUsed}
                  playerVulnerable={state.playerVulnerable}
                  enemyVulnerable={state.enemyVulnerable}
                />

                <div className="flex-1 overflow-y-auto">
                  <div className="relative z-20 flex flex-col gap-3 p-3 sm:gap-4 sm:p-4">
                    <BattleField
                      message={state.message}
                      phaseTitle={phaseTitle}
                      playerRoleInPhase={state.playerRoleInPhase}
                      playerX={state.playerX}
                      enemyX={state.enemyX}
                      playerPose={state.playerPose}
                      enemyPose={state.enemyPose}
                      effectText={state.effectText}
                      previewCard={hoveredCard}
                    />

                    <CommentaryBox commentary={state.commentary} />

                    {!state.playerVulnerable ? (
                      <ActionCardRow
                        title={selectionTitle}
                        description={selectionDescription}
                        cards={currentCards}
                        onSelect={handleSelectCard}
                        onHoverCard={setHoveredCard}
                        disabled={isDuelPlaying}
                      />
                    ) : (
                      <div className="relative z-30 overflow-hidden border border-zinc-700 bg-zinc-950/80 shadow-lg">
                        <div className="border-b border-zinc-800 bg-black/30 px-4 py-3 sm:px-5">
                          <div className="mb-1 text-lg font-black text-red-100">{selectionTitle}</div>
                          <div className="text-xs text-zinc-400 sm:text-sm">{selectionDescription}</div>
                        </div>
                        <div className="p-4">
                          <button
                            type="button"
                            onClick={handleAdvanceVulnerableTurn}
                            disabled={isDuelPlaying}
                            className="rounded-md border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm font-black text-red-100 hover:border-red-300 disabled:opacity-40"
                          >
                            무방비 턴 진행
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative z-20 h-full overflow-y-auto">
                <ReviewScreen
                  history={history}
                  didWin={state.enemyHeartsHalf <= 0}
                  onRestart={handleReset}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}