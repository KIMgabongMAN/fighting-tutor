"use client";

import { useMemo, useState } from "react";
import { ACTIONS, getActionById } from "../lib/semiTurn/actions";
import { resolveSemiTurn } from "../lib/semiTurn/engine";
import type {
  ActionDefinition,
  FighterState,
  TimelineEvent
} from "../lib/semiTurn/types";

const INITIAL_PLAYER: FighterState = {
  name: "플레이어",
  hp: 100,
  x: 2,
  pose: "stand",
  flow: "neutral",
  hitstun: 0,
  recoveryLock: 0,
  vulnerable: false,
  airborne: false,
  knockedDown: false
};

const INITIAL_ENEMY: FighterState = {
  name: "상대",
  hp: 100,
  x: 6,
  pose: "stand",
  flow: "neutral",
  hitstun: 0,
  recoveryLock: 0,
  vulnerable: false,
  airborne: false,
  knockedDown: false
};

function randomEnemyAction(player: FighterState, enemy: FighterState) {
  const gap = Math.max(0, enemy.x - player.x - 1);

  if (enemy.knockedDown) return getActionById("wait");

  if (gap === 0) {
    return Math.random() < 0.45 ? getActionById("throw") : getActionById("jab");
  }

  if (gap <= 2) {
    const pool = ["jab", "low_kick", "guard", "back_step"];
    return getActionById(pool[Math.floor(Math.random() * pool.length)]);
  }

  const pool = ["forward_step", "far_slash", "guard", "jump"];
  return getActionById(pool[Math.floor(Math.random() * pool.length)]);
}

function hpBarClass(hp: number) {
  if (hp > 60) return "#22c55e";
  if (hp > 30) return "#facc15";
  return "#ef4444";
}

function tileStyle(index: number, playerX: number, enemyX: number) {
  if (index === playerX && index === enemyX) {
    return {
      border: "1px solid #a855f7",
      background: "rgba(168, 85, 247, 0.20)"
    };
  }

  if (index === playerX) {
    return {
      border: "1px solid #f87171",
      background: "rgba(239, 68, 68, 0.20)"
    };
  }

  if (index === enemyX) {
    return {
      border: "1px solid #fcd34d",
      background: "rgba(251, 191, 36, 0.20)"
    };
  }

  return {
    border: "1px solid #3f3f46",
    background: "rgba(0, 0, 0, 0.20)"
  };
}

export function SemiTurnFighter() {
  const [player, setPlayer] = useState<FighterState>(INITIAL_PLAYER);
  const [enemy, setEnemy] = useState<FighterState>(INITIAL_ENEMY);
  const [selectedActionId, setSelectedActionId] = useState<string>("jab");
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [lastEnemyActionTitle, setLastEnemyActionTitle] = useState<string>("-");
  const [turn, setTurn] = useState(1);

  const selectedAction = useMemo(
    () => getActionById(selectedActionId),
    [selectedActionId]
  );

  const distanceLabel = useMemo(() => {
    const gap = Math.max(0, enemy.x - player.x - 1);
    if (gap <= 1) return "근거리";
    if (gap <= 4) return "중거리";
    return "원거리";
  }, [player.x, enemy.x]);

  const handleResolveTurn = () => {
    const enemyAction = randomEnemyAction(player, enemy);
    setLastEnemyActionTitle(enemyAction.title);

    const result = resolveSemiTurn(player, enemy, selectedAction, enemyAction);

    setPlayer(result.player);
    setEnemy(result.enemy);
    setEvents(result.events);
    setTurn((prev) => prev + 1);
  };

  const handleReset = () => {
    setPlayer(INITIAL_PLAYER);
    setEnemy(INITIAL_ENEMY);
    setEvents([]);
    setLastEnemyActionTitle("-");
    setTurn(1);
    setSelectedActionId("jab");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#f4f4f5",
        padding: "24px"
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.28em",
                color: "#71717a",
                marginBottom: 4
              }}
            >
              SEMI TURN FIGHTER TEST
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 32,
                fontWeight: 900
              }}
            >
              반턴제 격투 테스트버전
            </h1>
          </div>

          <button
            onClick={handleReset}
            style={{
              border: "1px solid #52525b",
              background: "#18181b",
              color: "#fafafa",
              padding: "10px 16px",
              borderRadius: 10,
              fontWeight: 700
            }}
          >
            리셋
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16
          }}
        >
          <div
            style={{
              border: "1px solid #27272a",
              background: "rgba(9,9,11,0.85)",
              borderRadius: 16,
              padding: 16
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8
              }}
            >
              <span style={{ fontWeight: 900, color: "#fca5a5" }}>PLAYER</span>
              <span style={{ color: "#a1a1aa", fontSize: 14 }}>{player.flow}</span>
            </div>
            <div
              style={{
                height: 16,
                background: "#27272a",
                borderRadius: 999,
                overflow: "hidden",
                marginBottom: 8
              }}
            >
              <div
                style={{
                  width: `${player.hp}%`,
                  height: "100%",
                  background: hpBarClass(player.hp)
                }}
              />
            </div>
            <div style={{ fontSize: 14, color: "#d4d4d8" }}>
              HP {player.hp} · pose {player.pose} · x {player.x}
              {player.vulnerable ? " · 무방비" : ""}
            </div>
          </div>

          <div
            style={{
              border: "1px solid #27272a",
              background: "rgba(9,9,11,0.85)",
              borderRadius: 16,
              padding: 16
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8
              }}
            >
              <span style={{ fontWeight: 900, color: "#fde68a" }}>ENEMY</span>
              <span style={{ color: "#a1a1aa", fontSize: 14 }}>{enemy.flow}</span>
            </div>
            <div
              style={{
                height: 16,
                background: "#27272a",
                borderRadius: 999,
                overflow: "hidden",
                marginBottom: 8
              }}
            >
              <div
                style={{
                  width: `${enemy.hp}%`,
                  height: "100%",
                  background: hpBarClass(enemy.hp)
                }}
              />
            </div>
            <div style={{ fontSize: 14, color: "#d4d4d8" }}>
              HP {enemy.hp} · pose {enemy.pose} · x {enemy.x}
              {enemy.vulnerable ? " · 무방비" : ""}
            </div>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #27272a",
            background: "rgba(9,9,11,0.85)",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12
            }}
          >
            <div style={{ fontWeight: 900 }}>전장</div>
            <div style={{ color: "#a1a1aa", fontSize: 14 }}>
              TURN {turn} · 거리 {distanceLabel}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(9, 1fr)",
              gap: 8
            }}
          >
            {Array.from({ length: 9 }, (_, index) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  height: 96,
                  borderRadius: 10,
                  ...tileStyle(index, player.x, enemy.x)
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    fontSize: 12,
                    color: "#71717a"
                  }}
                >
                  {index}
                </div>

                {index === player.x ? (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      bottom: 8,
                      transform: "translateX(-50%)",
                      background: "rgba(239,68,68,0.20)",
                      color: "#fecaca",
                      padding: "4px 8px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 900
                    }}
                  >
                    P
                  </div>
                ) : null}

                {index === enemy.x ? (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: 36,
                      transform: "translateX(-50%)",
                      background: "rgba(251,191,36,0.20)",
                      color: "#fef3c7",
                      padding: "4px 8px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 900
                    }}
                  >
                    E
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            border: "1px solid #27272a",
            background: "rgba(9,9,11,0.85)",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 12 }}>
            1단계: 행동 선택
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: 12
            }}
          >
            {ACTIONS.map((action: ActionDefinition) => {
              const selected = selectedActionId === action.id;

              return (
                <button
                  key={action.id}
                  onClick={() => setSelectedActionId(action.id)}
                  style={{
                    border: selected
                      ? "1px solid #f87171"
                      : "1px solid #3f3f46",
                    background: selected
                      ? "rgba(127, 29, 29, 0.45)"
                      : "#18181b",
                    color: "#fafafa",
                    borderRadius: 14,
                    padding: 12,
                    textAlign: "left"
                  }}
                >
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>
                    {action.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#a1a1aa",
                      marginBottom: 8,
                      lineHeight: 1.45
                    }}
                  >
                    {action.description}
                  </div>
                  <div style={{ fontSize: 11, color: "#71717a" }}>
                    startup {action.startup} / active {action.active} / recovery{" "}
                    {action.recovery}
                  </div>
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              border: "1px solid #27272a",
              background: "rgba(0,0,0,0.30)",
              borderRadius: 12,
              padding: 16
            }}
          >
            <div style={{ fontSize: 14, color: "#d4d4d8" }}>
              내 선택:{" "}
              <span style={{ fontWeight: 900, color: "#fff" }}>
                {selectedAction.title}
              </span>{" "}
              · 상대 선택:{" "}
              <span style={{ fontWeight: 900, color: "#fff" }}>
                {lastEnemyActionTitle}
              </span>
            </div>

            <button
              onClick={handleResolveTurn}
              style={{
                border: "1px solid #ef4444",
                background: "#450a0a",
                color: "#fee2e2",
                padding: "10px 18px",
                borderRadius: 10,
                fontWeight: 900
              }}
            >
              2단계+3단계 실행
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16
          }}
        >
          <div
            style={{
              border: "1px solid #27272a",
              background: "rgba(9,9,11,0.85)",
              borderRadius: 16,
              padding: 16
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 12 }}>
              2단계: 프레임 해석 로그
            </div>

            <div
              style={{
                maxHeight: 360,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 8
              }}
            >
              {events.length === 0 ? (
                <div style={{ color: "#71717a", fontSize: 14 }}>
                  아직 로그가 없다.
                </div>
              ) : (
                events.map((event, index) => (
                  <div
                    key={`${event.frame}-${index}`}
                    style={{
                      border: "1px solid #27272a",
                      background: "rgba(0,0,0,0.30)",
                      borderRadius: 10,
                      padding: "10px 12px",
                      fontSize: 14
                    }}
                  >
                    <span
                      style={{
                        marginRight: 8,
                        fontWeight: 900,
                        color: "#fca5a5"
                      }}
                    >
                      F{event.frame}
                    </span>
                    <span style={{ color: "#e4e4e7" }}>{event.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div
            style={{
              border: "1px solid #27272a",
              background: "rgba(9,9,11,0.85)",
              borderRadius: 16,
              padding: 16
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 12 }}>
              3단계: 상태 결과
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  border: "1px solid #27272a",
                  background: "rgba(0,0,0,0.30)",
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 14
                }}
              >
                <div
                  style={{
                    marginBottom: 6,
                    fontWeight: 900,
                    color: "#fca5a5"
                  }}
                >
                  플레이어
                </div>
                <div>HP: {player.hp}</div>
                <div>pose: {player.pose}</div>
                <div>flow: {player.flow}</div>
                <div>무방비: {player.vulnerable ? "예" : "아니오"}</div>
                <div>다운: {player.knockedDown ? "예" : "아니오"}</div>
              </div>

              <div
                style={{
                  border: "1px solid #27272a",
                  background: "rgba(0,0,0,0.30)",
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 14
                }}
              >
                <div
                  style={{
                    marginBottom: 6,
                    fontWeight: 900,
                    color: "#fde68a"
                  }}
                >
                  상대
                </div>
                <div>HP: {enemy.hp}</div>
                <div>pose: {enemy.pose}</div>
                <div>flow: {enemy.flow}</div>
                <div>무방비: {enemy.vulnerable ? "예" : "아니오"}</div>
                <div>다운: {enemy.knockedDown ? "예" : "아니오"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}