"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ActionCardRow } from "@/components/game/ActionCardRow";
import { BattleField } from "@/components/game/BattleField";
import { BattleHud } from "@/components/game/BattleHud";
import { CommentaryBox } from "@/components/game/CommentaryBox";
import { DuelOverlay } from "@/components/game/DuelOverlay";
import { PhaseBanner } from "@/components/game/PhaseBanner";
import {
  PHASE_META,
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
  ResolutionResult,
} from "@/lib/game/types";

const INITIAL_PLAYER_TILE = 1;
const INITIAL_ENEMY_TILE = 4;
const ENEMY_PERSONALITY: OpponentPersonality = "defensive";
const DUEL_ANIMATION_MS = 4800;

function buildCardPool(
  phase: PhaseId,
  role: PlayerRoleInPhase,
  canUseBurst: boolean
) {
  const cards = [...getCardsForPhase(phase, role)];
  if (canUseBurst) cards.push(UNIVERSAL_BURST_CARD);
  return cards;
}

export default function Page() {
  const [state, setState] = useState<GameState>({
    playerHp: 100,
    enemyHp: 100,
    playerTension: 0,
    enemyTension: 0,
    playerTile: INITIAL_PLAYER_TILE,
    enemyTile: INITIAL_ENEMY_TILE,
    phase: "opening",
    playerRoleInPhase: "neutral",
    playerStateText: "뉴트럴",
    enemyStateText: "뉴트럴",
    message: "개막이다. 의도를 고르고, 거리와 국면의 흐름을 먼저 잡아라.",
    commentary:
      "v2는 세부 조작 대신 의도 카드 중심으로 진행된다. 상대도 같은 방식으로 카드를 고른다.",
    turn: 1,
    round: 1,
    effectText: "",
    enemyPersonality: ENEMY_PERSONALITY,
    lastPlayerCardId: null,
    lastEnemyCardId: null,
    playerBurstUsed: false,
    enemyBurstUsed: false,
  });

  const [banner, setBanner] = useState<PhaseBannerState | null>(null);
  const [duelOverlay, setDuelOverlay] = useState<DuelOverlayState | null>(null);

  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const duelApplyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentCards = useMemo(() => {
    return buildCardPool(state.phase, state.playerRoleInPhase, !state.playerBurstUsed);
  }, [state.phase, state.playerRoleInPhase, state.playerBurstUsed]);

  const phaseTitle = useMemo(() => PHASE_META[state.phase]?.label ?? "국면", [state.phase]);

  const distanceLabel = useMemo(() => {
    return deriveDistanceLabel(state.playerTile, state.enemyTile);
  }, [state.playerTile, state.enemyTile]);

  const enemyRole: PlayerRoleInPhase = useMemo(() => {
    if (state.playerRoleInPhase === "attacker") return "defender";
    if (state.playerRoleInPhase === "defender") return "attacker";
    return "neutral";
  }, [state.playerRoleInPhase]);

  const isGameOver = state.playerHp <= 0 || state.enemyHp <= 0;
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
    result: ResolutionResult,
    playerCard: CardDefinition,
    enemyCard: CardDefinition
  ) => {
    setState((prev) => ({
      ...prev,
      playerHp: result.nextPlayerHp,
      enemyHp: result.nextEnemyHp,
      playerTension: result.nextPlayerTension,
      enemyTension: result.nextEnemyTension,
      playerTile: result.nextPlayerTile,
      enemyTile: result.nextEnemyTile,
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
      playerBurstUsed: prev.playerBurstUsed || playerCard.id === UNIVERSAL_BURST_CARD.id,
      enemyBurstUsed: prev.enemyBurstUsed || enemyCard.id === UNIVERSAL_BURST_CARD.id,
    }));

    setDuelOverlay(null);
    showBanner(result.nextPhase);
  };

  const handleSelectCard = (playerCard: CardDefinition) => {
    if (isGameOver || isDuelPlaying) return;

    const enemyCards = buildCardPool(state.phase, enemyRole, !state.enemyBurstUsed);

    const enemyCard = pickWeightedRandomCard({
      cards: enemyCards,
      state,
      role: enemyRole,
      personality: state.enemyPersonality,
    });

    const context: GameContext = {
      currentState: state,
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
      applyResolvedResult(result, playerCard, enemyCard);
    }, DUEL_ANIMATION_MS);
  };

  const handleReset = () => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    if (duelApplyTimerRef.current) clearTimeout(duelApplyTimerRef.current);

    setDuelOverlay(null);

    setState({
      playerHp: 100,
      enemyHp: 100,
      playerTension: 0,
      enemyTension: 0,
      playerTile: INITIAL_PLAYER_TILE,
      enemyTile: INITIAL_ENEMY_TILE,
      phase: "opening",
      playerRoleInPhase: "neutral",
      playerStateText: "뉴트럴",
      enemyStateText: "뉴트럴",
      message: "개막이다. 의도를 고르고, 거리와 국면의 흐름을 먼저 잡아라.",
      commentary:
        "v2는 세부 조작 대신 의도 카드 중심으로 진행된다. 상대도 같은 방식으로 카드를 고른다.",
      turn: 1,
      round: 1,
      effectText: "",
      enemyPersonality: ENEMY_PERSONALITY,
      lastPlayerCardId: null,
      lastEnemyCardId: null,
      playerBurstUsed: false,
      enemyBurstUsed: false,
    });

    showBanner("opening");
  };

  const selectionTitle = useMemo(() => {
    if (state.playerRoleInPhase === "attacker") return "공격자 선택지";
    if (state.playerRoleInPhase === "defender") return "수비자 선택지";
    return "뉴트럴 선택지";
  }, [state.playerRoleInPhase]);

  const selectionDescription = useMemo(() => {
    if (state.playerRoleInPhase === "attacker") {
      return "지금은 네가 흐름을 쥐고 있다. 압박의 방향을 고르자.";
    }

    if (state.playerRoleInPhase === "defender") {
      return "지금은 수세다. 버틸지, 탈출할지, 뒤집을지 고르자.";
    }

    return "세부 행동이 아니라 의도를 선택한다. 거리 변화는 먼저 반영되고, 그 후 승패를 판정한다.";
  }, [state.playerRoleInPhase]);

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

      <main className="min-h-screen overflow-y-auto bg-black p-3 text-white sm:p-6">
        <div className="mx-auto w-full max-w-[1700px]">
          <div className="mb-3 flex items-center justify-between sm:mb-4">
            <div className="text-[10px] font-black tracking-[0.28em] text-zinc-500 sm:text-xs">
              TRAINING BUILD V2
            </div>

            <button
              onClick={handleReset}
              className="border border-zinc-500 bg-zinc-900 px-3 py-2 text-[11px] font-black tracking-[0.12em] hover:border-white [clip-path:polygon(4%_0,100%_0,96%_100%,0_100%)] sm:text-sm"
            >
              다시 시작
            </button>
          </div>

          <div className="relative w-full rounded-[20px] border border-zinc-700 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 shadow-[0_0_60px_rgba(0,0,0,0.65)] sm:rounded-[28px]">
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_60%)]" />

            {banner && <PhaseBanner banner={banner} />}

            {duelOverlay && (
              <DuelOverlay
                playerCard={duelOverlay.playerCard}
                enemyCard={duelOverlay.enemyCard}
                outcome={duelOverlay.outcome}
              />
            )}

            <div className="flex flex-col pb-4 sm:pb-6">
              <BattleHud
                playerHp={state.playerHp}
                enemyHp={state.enemyHp}
                playerTension={state.playerTension}
                enemyTension={state.enemyTension}
                round={state.round}
                distanceLabel={distanceLabel}
                phaseTitle={phaseTitle}
                playerStateText={state.playerStateText}
                enemyStateText={state.enemyStateText}
                enemyPersonalityLabel={state.enemyPersonality === "defensive" ? "수비형 상대" : "균형형 상대"}
                playerBurstUsed={state.playerBurstUsed}
                enemyBurstUsed={state.enemyBurstUsed}
              />

              <div className="flex flex-col gap-3 p-3 sm:gap-4 sm:p-4">
                <BattleField
                  message={state.message}
                  phaseTitle={phaseTitle}
                  playerRoleInPhase={state.playerRoleInPhase}
                  playerTile={state.playerTile}
                  enemyTile={state.enemyTile}
                  effectText={state.effectText}
                />

                <CommentaryBox commentary={state.commentary} />

                {!isGameOver ? (
                  <ActionCardRow
                    title={selectionTitle}
                    description={selectionDescription}
                    cards={currentCards}
                    onSelect={handleSelectCard}
                    disabled={isDuelPlaying}
                  />
                ) : (
                  <div className="border-t border-zinc-800 bg-black/60 px-4 py-3 sm:px-5">
                    <div className="text-center text-lg font-black tracking-[0.12em] text-zinc-100 sm:text-2xl sm:tracking-[0.18em]">
                      {state.enemyHp <= 0 ? "승리! 상대를 쓰러뜨렸다." : "패배... 네가 쓰러졌다."}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}