import type { PlayerRoleInPhase } from "@/lib/game/types";

type Props = {
  message: string;
  phaseTitle: string;
  distance: number;
  playerRoleInPhase: PlayerRoleInPhase;
  effectText: string;
};

function getTileHighlight(distance: number) {
  if (distance <= 0) return [2, 3];
  if (distance >= 4) return [0, 5];
  if (distance >= 1 && distance <= 3) return [1, 4];
  return [2, 3];
}

export function BattleField({ message, phaseTitle, distance, playerRoleInPhase, effectText }: Props) {
  const activeTiles = getTileHighlight(distance);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-700 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_58%)]" />
      <div className="absolute inset-0 opacity-25 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_60%)]" />
      <div className="absolute bottom-20 left-0 right-0 h-[2px] bg-zinc-700 sm:bottom-24" />

      <div className="relative z-10 flex items-center justify-between border-b border-zinc-800 bg-black/40 px-4 py-3 sm:px-6 sm:py-4">
        <div className="border border-zinc-600 bg-zinc-900 px-2 py-1 text-[10px] font-black tracking-[0.22em] text-zinc-300 [clip-path:polygon(0_0,100%_0,90%_100%,0_100%)] sm:px-3 sm:text-xs">
          BATTLE FIELD
        </div>
        <div className="text-[10px] text-zinc-400 sm:text-sm">학습 전투 시뮬레이션</div>
      </div>

      <div className="absolute left-1/2 top-4 z-20 w-full max-w-5xl -translate-x-1/2 px-3 sm:top-6 sm:px-4">
        <div className="border border-zinc-700 bg-black/55 px-4 py-3 text-center text-sm font-semibold text-zinc-100 shadow-xl backdrop-blur-sm [clip-path:polygon(3%_0,100%_0,97%_100%,0_100%)] sm:px-5 sm:py-4 sm:text-base">
          {message}
        </div>
      </div>

      {effectText ? (
        <div className="absolute left-1/2 top-20 z-30 -translate-x-1/2 sm:top-28">
          <div className="border border-red-400/60 bg-red-950/80 px-5 py-2 text-sm font-black tracking-[0.18em] text-red-100 shadow-2xl [clip-path:polygon(6%_0,100%_0,94%_100%,0_100%)] sm:px-7 sm:text-xl sm:tracking-[0.22em]">
            {effectText}
          </div>
        </div>
      ) : null}

      <div className="relative z-10 flex min-h-[380px] items-end justify-between px-4 pb-28 pt-24 sm:min-h-[560px] sm:px-10 sm:pb-32 sm:pt-28">
        <div
          className={`flex flex-col items-center transition-all duration-300 ${
            distance <= 0 ? "translate-x-4 sm:translate-x-10" : distance >= 4 ? "translate-x-0" : "translate-x-2 sm:translate-x-6"
          }`}
        >
          <div className="mb-2 border border-red-500/30 bg-red-950/50 px-2 py-1 text-[10px] font-black tracking-[0.16em] text-red-200 [clip-path:polygon(0_0,100%_0,92%_100%,0_100%)] sm:mb-3 sm:px-3 sm:text-xs sm:tracking-[0.2em]">
            PLAYER SIDE
          </div>
          <div className="flex h-40 w-28 items-center justify-center border border-red-900/60 bg-red-950/40 px-2 text-center text-sm font-bold [clip-path:polygon(0_0,100%_0,92%_100%,0_100%)] sm:h-64 sm:w-48 sm:px-4 sm:text-lg">
            내 캐릭터
          </div>
        </div>

        <div className="absolute left-1/2 bottom-28 z-20 -translate-x-1/2 sm:bottom-32">
          <div className="border border-zinc-500 bg-zinc-900/80 px-4 py-2 text-xs font-black tracking-[0.12em] text-zinc-100 shadow-lg [clip-path:polygon(8%_0,100%_0,92%_100%,0_100%)] sm:px-5 sm:text-sm sm:tracking-[0.18em]">
            {phaseTitle} · {playerRoleInPhase === "attacker" ? "공격자" : playerRoleInPhase === "defender" ? "수비자" : "교전"}
          </div>
        </div>

        <div
          className={`flex flex-col items-center transition-all duration-300 ${
            distance <= 0 ? "-translate-x-4 sm:-translate-x-10" : distance >= 4 ? "translate-x-0" : "-translate-x-2 sm:-translate-x-6"
          }`}
        >
          <div className="mb-2 border border-yellow-500/30 bg-yellow-950/40 px-2 py-1 text-[10px] font-black tracking-[0.16em] text-yellow-100 [clip-path:polygon(8%_0,100%_0,100%_100%,0_100%)] sm:mb-3 sm:px-3 sm:text-xs sm:tracking-[0.2em]">
            ENEMY SIDE
          </div>
          <div className="flex h-40 w-28 items-center justify-center border border-yellow-700/60 bg-yellow-950/30 px-2 text-center text-sm font-bold [clip-path:polygon(8%_0,100%_0,100%_100%,0_100%)] sm:h-64 sm:w-48 sm:px-4 sm:text-lg">
            상대 캐릭터
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-4 right-4 z-20 sm:bottom-8 sm:left-8 sm:right-8">
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
          {Array.from({ length: 6 }, (_, i) => {
            const active = activeTiles.includes(i);
            return (
              <div
                key={i}
                className={`h-10 border transition-all duration-300 [clip-path:polygon(10%_0,100%_0,90%_100%,0_100%)] sm:h-14 ${
                  active
                    ? "border-red-400/60 bg-gradient-to-b from-red-900/40 to-zinc-900 shadow-[0_0_20px_rgba(248,113,113,0.12)]"
                    : "border-zinc-700 bg-zinc-900/80"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}