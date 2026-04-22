import type { CardDefinition, Lane, PlayerRoleInPhase } from "@/lib/game/types";
import { TILE_COUNT } from "@/lib/game/data";

type Props = {
  message: string;
  phaseTitle: string;
  playerRoleInPhase: PlayerRoleInPhase;
  playerX: number;
  enemyX: number;
  playerLane: Lane;
  enemyLane: Lane;
  effectText: string;
  previewCard?: CardDefinition | null;
};

function tileCenterPercent(tileIndex: number) {
  return ((tileIndex + 0.5) / TILE_COUNT) * 100;
}

function laneBottom(lane: Lane) {
  return lane === "air" ? "52%" : "18%";
}

function buildPreviewTiles(playerX: number, card?: CardDefinition | null) {
  if (!card || card.rangeMax < 0) return [];

  const result: Array<{ row: number; col: number }> = [];
  const start = Math.max(0, playerX + card.rangeMin + 1);
  const end = Math.min(TILE_COUNT - 1, playerX + card.rangeMax + 1);

  const rows =
    card.laneTarget === "both"
      ? [0, 1]
      : card.laneTarget === "air"
      ? [0]
      : [1];

  for (let col = start; col <= end; col += 1) {
    for (const row of rows) {
      result.push({ row, col });
    }
  }

  return result;
}

export function BattleField({
  message,
  phaseTitle,
  playerRoleInPhase,
  playerX,
  enemyX,
  playerLane,
  enemyLane,
  effectText,
  previewCard,
}: Props) {
  const playerLeft = `${tileCenterPercent(playerX)}%`;
  const enemyLeft = `${tileCenterPercent(enemyX)}%`;
  const previewTiles = buildPreviewTiles(playerX, previewCard);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-700 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_58%)]" />
      <div className="absolute inset-0 opacity-25 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_60%)]" />

      <div className="relative z-10 flex items-center justify-between border-b border-zinc-800 bg-black/40 px-4 py-3 sm:px-6 sm:py-4">
        <div className="border border-zinc-600 bg-zinc-900 px-2 py-1 text-[10px] font-black tracking-[0.22em] text-zinc-300 sm:px-3 sm:text-xs">
          BATTLE FIELD · 2x7
        </div>
        <div className="text-[10px] text-zinc-400 sm:text-sm">공중 / 지상 판정 분리</div>
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

      <div className="relative z-10 min-h-[500px] px-4 pb-28 pt-24 sm:min-h-[700px] sm:px-8 sm:pb-32 sm:pt-28">
        <div className="absolute bottom-[126px] left-1/2 z-20 -translate-x-1/2 sm:bottom-[148px]">
          <div className="border border-zinc-500 bg-zinc-900/80 px-4 py-2 text-xs font-black tracking-[0.12em] text-zinc-100 shadow-lg sm:px-5 sm:text-sm sm:tracking-[0.18em]">
            {phaseTitle} ·{" "}
            {playerRoleInPhase === "attacker"
              ? "공격자"
              : playerRoleInPhase === "defender"
              ? "수비자"
              : "교전"}
          </div>
        </div>

        <div className="absolute bottom-6 left-4 right-4 z-10 sm:bottom-8 sm:left-8 sm:right-8">
          <div
            className="grid gap-1.5 sm:gap-2"
            style={{ gridTemplateColumns: `repeat(${TILE_COUNT}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: TILE_COUNT * 2 }, (_, index) => {
              const row = Math.floor(index / TILE_COUNT);
              const col = index % TILE_COUNT;
              const isPreview = previewTiles.some((tile) => tile.row === row && tile.col === col);

              return (
                <div
                  key={`${row}-${col}`}
                  className={`relative h-20 border transition-all duration-200 sm:h-28 ${
                    isPreview
                      ? "border-red-400/70 bg-red-500/20 shadow-[0_0_24px_rgba(239,68,68,0.22)]"
                      : "border-zinc-700 bg-zinc-900/70"
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-zinc-500 sm:text-xs">
                    {row === 0 ? `A-${col + 1}` : `G-${col + 1}`}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] font-black tracking-[0.18em] text-zinc-400 sm:text-xs">
            <span>AIR ROW</span>
            <span>GROUND ROW</span>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-[92px] left-4 right-4 z-20 sm:bottom-[112px] sm:left-8 sm:right-8">
          <div className="relative h-[280px] sm:h-[390px]">
            <div
              className="absolute w-[110px] -translate-x-1/2 transition-all duration-300 sm:w-[180px]"
              style={{
                left: playerLeft,
                bottom: laneBottom(playerLane),
              }}
            >
              <div className="mb-2 border border-red-500/30 bg-red-950/50 px-2 py-1 text-center text-[10px] font-black tracking-[0.16em] text-red-200 sm:px-3 sm:text-xs">
                PLAYER
              </div>
              <div className="flex h-[150px] items-center justify-center border border-red-900/60 bg-red-950/40 text-center text-sm font-bold sm:h-[260px] sm:text-lg">
                내 캐릭터
              </div>
            </div>

            <div
              className="absolute w-[110px] -translate-x-1/2 transition-all duration-300 sm:w-[180px]"
              style={{
                left: enemyLeft,
                bottom: laneBottom(enemyLane),
              }}
            >
              <div className="mb-2 border border-yellow-500/30 bg-yellow-950/40 px-2 py-1 text-center text-[10px] font-black tracking-[0.16em] text-yellow-100 sm:px-3 sm:text-xs">
                ENEMY
              </div>
              <div className="flex h-[150px] items-center justify-center border border-yellow-700/60 bg-yellow-950/30 text-center text-sm font-bold sm:h-[260px] sm:text-lg">
                상대 캐릭터
              </div>
            </div>
          </div>
        </div>

        {previewCard && previewCard.rangeMax >= 0 ? (
          <div className="absolute bottom-[154px] right-6 z-30 sm:right-10">
            <div className="rounded-md border border-red-500/40 bg-black/70 px-3 py-2 text-xs font-semibold text-zinc-100 shadow-xl">
              선택 미리보기 · 빨간 박스가 이 행동의 타격 판정 범위
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}