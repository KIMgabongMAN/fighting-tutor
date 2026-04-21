import { TILE_COUNT } from "@/lib/game/data";
import type { PlayerRoleInPhase } from "@/lib/game/types";

type Props = {
  message: string;
  phaseTitle: string;
  playerRoleInPhase: PlayerRoleInPhase;
  playerTile: number;
  enemyTile: number;
  effectText: string;
};

function tileCenterPercent(tileIndex: number) {
  return ((tileIndex + 0.5) / TILE_COUNT) * 100;
}

export function BattleField({
  message,
  phaseTitle,
  playerRoleInPhase,
  playerTile,
  enemyTile,
  effectText,
}: Props) {
  const playerLeft = `${tileCenterPercent(playerTile)}%`;
  const enemyLeft = `${tileCenterPercent(enemyTile)}%`;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-700 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_58%)]" />
      <div className="absolute inset-0 opacity-25 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_60%)]" />
      <div className="absolute bottom-20 left-0 right-0 h-[2px] bg-zinc-700 sm:bottom-24" />

      <div className="relative z-10 flex items-center justify-between border-b border-zinc-800 bg-black/40 px-4 py-3 sm:px-6 sm:py-4">
        <div className="border border-zinc-600 bg-zinc-900 px-2 py-1 text-[10px] font-black tracking-[0.22em] text-zinc-300 sm:px-3 sm:text-xs">
          BATTLE FIELD
        </div>
        <div className="text-[10px] text-zinc-400 sm:text-sm">{TILE_COUNT} TILE FIELD</div>
      </div>

      <div className="absolute left-1/2 top-4 z-20 w-full max-w-5xl -translate-x-1/2 px-3 sm:top-6 sm:px-4">
        <div className="border border-zinc-700 bg-black/55 px-4 py-3 text-center text-sm font-semibold text-zinc-100 shadow-xl backdrop-blur-sm sm:px-5 sm:py-4 sm:text-base">
          {message}
        </div>
      </div>

      {effectText ? (
        <div className="absolute left-1/2 top-20 z-30 -translate-x-1/2 sm:top-28">
          <div className="border border-red-400/60 bg-red-950/80 px-5 py-2 text-sm font-black tracking-[0.18em] text-red-100 shadow-2xl sm:px-7 sm:text-xl sm:tracking-[0.22em]">
            {effectText}
          </div>
        </div>
      ) : null}

      <div className="relative z-10 min-h-[420px] px-4 pb-28 pt-24 sm:min-h-[620px] sm:px-8 sm:pb-32 sm:pt-28">
        <div className="absolute bottom-[126px] left-1/2 z-20 -translate-x-1/2 sm:bottom-[142px]">
          <div className="border border-zinc-500 bg-zinc-900/80 px-4 py-2 text-xs font-black tracking-[0.12em] text-zinc-100 shadow-lg sm:px-5 sm:text-sm sm:tracking-[0.18em]">
            {phaseTitle} · {playerRoleInPhase === "attacker" ? "공격자" : playerRoleInPhase === "defender" ? "수비자" : "교전"}
          </div>
        </div>

        <div className="absolute bottom-6 left-4 right-4 z-20 sm:bottom-8 sm:left-8 sm:right-8">
          <div
            className="grid gap-1.5 sm:gap-2"
            style={{ gridTemplateColumns: `repeat(${TILE_COUNT}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: TILE_COUNT }, (_, i) => {
              const isPlayerTile = i === playerTile;
              const isEnemyTile = i === enemyTile;

              return (
                <div
                  key={i}
                  className={`relative h-10 border transition-all duration-300 sm:h-14 ${
                    isPlayerTile
                      ? "border-red-400/70 bg-gradient-to-b from-red-900/40 to-zinc-900 shadow-[0_0_20px_rgba(248,113,113,0.18)]"
                      : isEnemyTile
                      ? "border-yellow-400/70 bg-gradient-to-b from-yellow-900/30 to-zinc-900 shadow-[0_0_20px_rgba(250,204,21,0.18)]"
                      : "border-zinc-700 bg-zinc-900/80"
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-zinc-500 sm:text-xs">
                    {i + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-[84px] left-4 right-4 z-10 sm:bottom-[104px] sm:left-8 sm:right-8">
          <div className="relative h-[220px] sm:h-[320px]">
            <div
              className="absolute bottom-0 w-[88px] -translate-x-1/2 transition-all duration-300 sm:w-[150px]"
              style={{ left: playerLeft }}
            >
              <div className="mb-2 border border-red-500/30 bg-red-950/50 px-2 py-1 text-center text-[10px] font-black tracking-[0.16em] text-red-200 sm:px-3 sm:text-xs sm:tracking-[0.2em]">
                PLAYER
              </div>
              <div className="flex h-[130px] items-center justify-center border border-red-900/60 bg-red-950/40 text-center text-sm font-bold sm:h-[220px] sm:text-lg">
                내 캐릭터
              </div>
            </div>

            <div
              className="absolute bottom-0 w-[88px] -translate-x-1/2 transition-all duration-300 sm:w-[150px]"
              style={{ left: enemyLeft }}
            >
              <div className="mb-2 border border-yellow-500/30 bg-yellow-950/40 px-2 py-1 text-center text-[10px] font-black tracking-[0.16em] text-yellow-100 sm:px-3 sm:text-xs sm:tracking-[0.2em]">
                ENEMY
              </div>
              <div className="flex h-[130px] items-center justify-center border border-yellow-700/60 bg-yellow-950/30 text-center text-sm font-bold sm:h-[220px] sm:text-lg">
                상대 캐릭터
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}