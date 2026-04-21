"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ActionCardRow } from "@/components/game/ActionCardRow";
import { BattleField } from "@/components/game/BattleField";
import { BattleHud } from "@/components/game/BattleHud";
import { CommentaryBox } from "@/components/game/CommentaryBox";
import { PhaseBanner } from "@/components/game/PhaseBanner";
import { PHASE_META, getCardsForPhase } from "@/lib/game/data";
import { pickRandomCard } from "@/lib/game/random";
import {
  deriveDistanceLabel,
  deriveDistanceNeutralPhase,
  resolvePhaseTurn,
} from "@/lib/game/phase";
import type {
  CardDefinition,
  GameContext,
  GameState,
  PhaseBannerState,
  PhaseId,
  PlayerRoleInPhase,
  ResolutionResult,
} from "@/lib/game/types";

const INITIAL_DISTANCE = 2;

export default function Page() {
  const [state, setState] = useState<GameState>({
    playerHp: 100,
    enemyHp: 100,
    playerTension: 0,
    enemyTension: 0,
    distance: INITIAL_DISTANCE,
    phase: "opening",
    playerRoleInPhase: "neutral",
    playerStateText: "뉴트럴",
    enemyStateText: "뉴트럴",
    message: "개막 상황이다. 신중히 첫 선택을 골라 이후의 흐름을 정하자.",
    commentary: "현재 국면에 맞는 카드만 아래에 표시된다. 상대는 보이지 않게 랜덤으로 선택한다.",
    turn: 1,
    round: 1,
    effectText: "",
    lastPlayerCardId: null,
    lastEnemyCardId: null,
    history: [],
  });

  const [banner, setBanner] = useState<PhaseBannerState | null>(null);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentCards = useMemo(() => {
    return getCardsForPhase(state.phase, state.playerRoleInPhase);
  }, [state.phase, state.playerRoleInPhase]);

  const phaseTitle = useMemo(() => {
    return PHASE_META[state.phase]?.label ?? "국면";
  }, [state.phase]);

  const distanceLabel = useMemo(() => deriveDistanceLabel(state.distance), [state.distance]);

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
    };
  }, []);

  const moveToNextPhase = (result: ResolutionResult, playerCard: CardDefinition, enemyCard: CardDefinition) => {
    setState((prev) => {
      const nextPhase =
        result.nextPhase ??
        deriveDistanceNeutralPhase(result.nextDistance ?? prev.distance);

      return {
        ...prev,
        playerHp: result.nextPlayerHp,
        enemyHp: result.nextEnemyHp,
        playerTension: result.nextPlayerTension,
        enemyTension: result.nextEnemyTension,
        distance: result.nextDistance,
        phase: nextPhase,
        playerRoleInPhase: result.nextPlayerRoleInPhase,
        playerStateText: result.nextPlayerStateText,
        enemyStateText: result.nextEnemyStateText,
        message: result.message,
        commentary: result.commentary,
        turn: prev.turn + 1,
        effectText: result.effectText ?? "",
        lastPlayerCardId: playerCard.id,
        lastEnemyCardId: enemyCard.id,
        history: [
          ...prev.history,
          {
            turn: prev.turn,
            phase: prev.phase,
            playerCardTitle: playerCard.title,
            enemyCardTitle: enemyCard.title,
            resultMessage: result.message,
            nextPhase,
          },
        ],
      };
    });

    showBanner(result.nextPhase ?? deriveDistanceNeutralPhase(result.nextDistance ?? state.distance));
  };

  const handleSelectCard = (playerCard: CardDefinition) => {
    if (state.playerHp <= 0 || state.enemyHp <= 0) return;

    const enemyCards = getCardsForPhase(
      state.phase,
      state.playerRoleInPhase === "attacker"
        ? "defender"
        : state.playerRoleInPhase === "defender"
        ? "attacker"
        : "neutral"
    );

    const enemyCard = pickRandomCard(enemyCards);

    const context: GameContext = {
      currentState: state,
      playerCard,
      enemyCard,
    };

    const result = resolvePhaseTurn(context);

    moveToNextPhase(result, playerCard, enemyCard);
  };

  const handleReset = () => {
    setState({
      playerHp: 100,
      enemyHp: 100,
      playerTension: 0,
      enemyTension: 0,
      distance: INITIAL_DISTANCE,
      phase: "opening",
      playerRoleInPhase: "neutral",
      playerStateText: "뉴트럴",
      enemyStateText: "뉴트럴",
      message: "개막 상황이다. 신중히 첫 선택을 골라 이후의 흐름을 정하자.",
      commentary: "현재 국면에 맞는 카드만 아래에 표시된다. 상대는 보이지 않게 랜덤으로 선택한다.",
      turn: 1,
      round: 1,
      effectText: "",
      lastPlayerCardId: null,
      lastEnemyCardId: null,
      history: [],
    });

    showBanner("opening");
  };

  const selectionTitle = useMemo(() => {
    if (state.playerRoleInPhase === "attacker") return "공격자 선택지";
    if (state.playerRoleInPhase === "defender") return "수비자 선택지";
    return "개막 / 교전 선택지";
  }, [state.playerRoleInPhase]);

  const selectionDescription = useMemo(() => {
    if (state.playerRoleInPhase === "attacker") {
      return "이번 국면에서는 네가 주도권을 잡았다. 공격자 카드만 표시된다.";
    }

    if (state.playerRoleInPhase === "defender") {
      return "이번 국면에서는 네가 수세에 있다. 수비자 카드만 표시된다.";
    }

    return "개막과 일반 교전에서는 중립 선택지를 사용한다.";
  }, [state.playerRoleInPhase]);

  const isGameOver = state.playerHp <= 0 || state.enemyHp <= 0;

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
              TRAINING BUILD
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
              />

              <div className="flex flex-col gap-3 p-3 sm:gap-4 sm:p-4">
                <BattleField
                  message={state.message}
                  phaseTitle={phaseTitle}
                  distance={state.distance}
                  playerRoleInPhase={state.playerRoleInPhase}
                  effectText={state.effectText}
                />

                <CommentaryBox commentary={state.commentary} />

                {!isGameOver ? (
                  <ActionCardRow
                    title={selectionTitle}
                    description={selectionDescription}
                    cards={currentCards}
                    onSelect={handleSelectCard}
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