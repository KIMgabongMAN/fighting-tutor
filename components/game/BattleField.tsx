import type {
  BattlefieldRow,
  CardDefinition,
  CharacterPose,
  PlayerRoleInPhase,
} from "@/lib/game/types";
import { GRID_COLS, GRID_ROW_LABELS } from "@/lib/game/data";

type Props = {
  message: string;
  phaseTitle: string;
  playerRoleInPhase: PlayerRoleInPhase;
  playerX: number;
  enemyX: number;
  playerPose: CharacterPose;
  enemyPose: CharacterPose;
  effectText: string;
  previewCard?: CardDefinition | null;
};

function tileCenterPercent(tileIndex: number) {
  return ((tileIndex + 0.5) / GRID_COLS) * 100;
}

function rowToIndex(row: BattlefieldRow) {
  return GRID_ROW_LABELS.indexOf(row);
}

function buildPreviewTiles(playerX: number, card?: CardDefinition | null) {
  if (!card || card.rangeMax < 0) return [];

  const result: Array<{ row: number; col: number }> = [];
  const start = Math.max(0, playerX + card.rangeMin + 1);
  const end = Math.min(GRID_COLS - 1, playerX + card.rangeMax + 1);

  for (let col = start; col <= end; col += 1) {
    for (const row of card.targetRows) {
      result.push({ row: rowToIndex(row), col });
    }
  }

  return result;
}

function poseVisual(pose: CharacterPose) {
  if (pose === "stand") {
    return { bottom: "3%", height: "42%" };
  }

  if (pose === "crouch") {
    return { bottom: "3%", height: "26%" };
  }

  return { bottom: "34%", height: "38%" };
}

export function BattleField({
  message,
  phaseTitle,
  playerRoleInPhase,
  playerX,
  enemyX,
  playerPose,
  enemyPose,
  effectText,
  previewCard,
}: Props) {
  const playerLeft = `${tileCenterPercent(playerX)}%`;
  const enemyLeft = `${tileCenterPercent(enemyX)}%`;
  const previewTiles = buildPreviewTiles(playerX, previewCard);

  const playerVisual = poseVisual(playerPose);
  const enemyVisual = poseVisual(enemyPose);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-700 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_58%)]" />
      <div className="absolute inset-0 opacity-25 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_60%)]" />

      <div className="relative z-10 flex items-center justify-between border-b border-zinc-800 bg-black/40 px-4 py-3 sm:px-6 sm:py-4">
        <div className="border border-zinc-600 bg-zinc-900 px-2 py-1 text-[10px] font-black tracking-[0.22em] text-zinc-300 sm:px-3 sm:text-xs">
          BATTLE FIELD · 4x9
        </div>
        <div className="text-[10px] text-zinc-400 sm:text-sm">
          H/A/M/G 높이 판정 분리
        </div>
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

      <div className="relative z-10 min-h-[560px] px-4 pb-28 pt-24 sm:min-h-[760px] sm:px-8 sm:pb-32 sm:pt-28">
        <div className="absolute bottom-[126px] left-1/2 z-20 -translate-x-1/2 sm:bottom-[156px]">
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
          <div className="flex gap-2">
            <div className="grid w-[36px] grid-rows-4 gap-1.5 sm:w-[44px] sm:gap-2">
              {GRID_ROW_LABELS.map((row) => (
                <div
                  key={row}
                  className="flex h-16 items-center justify-center border border-zinc-700 bg-zinc-900/80 text-[10px] font-black text-zinc-400 sm:h-20 sm:text-xs"
                >
                  {row}
                </div>
              ))}
            </div>

            <div
              className="grid flex-1 gap-1.5 sm:gap-2"
              style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: GRID_COLS * 4 }, (_, index) => {
                const row = Math.floor(index / GRID_COLS);
                const col = index % GRID_COLS;
                const isPreview = previewTiles.some(
                  (tile) => tile.row === row && tile.col === col
                );

                return (
                  <div
                    key={`${row}-${col}`}
                    className={`relative h-16 border transition-all duration-200 sm:h-20 ${
                      isPreview
                        ? "border-red-400/70 bg-red-500/20 shadow-[0_0_24px_rgba(239,68,68,0.22)]"
                        : "border-zinc-700 bg-zinc-900/70"
                    }`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-zinc-500 sm:text-xs">
                      {GRID_ROW_LABELS[row]}-{col + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-[98px] left-4 right-4 z-20 sm:bottom-[122px] sm:left-8 sm:right-8">
          <div className="relative h-[340px] sm:h-[430px]">
            <div
              className="absolute w-[120px] -translate-x-1/2 transition-all duration-300 sm:w-[190px]"
              style={{
                left: playerLeft,
                bottom: playerVisual.bottom,
                height: playerVisual.height,
              }}
            >
              <div className="mb-2 border border-red-500/30 bg-red-950/50 px-2 py-1 text-center text-[10px] font-black tracking-[0.16em] text-red-200 sm:px-3 sm:text-xs">
                PLAYER
              </div>
              <div className="flex h-full items-end justify-center border border-red-900/60 bg-red-950/40 text-center text-sm font-bold sm:text-lg">
                내 캐릭터
              </div>
            </div>

            <div
              className="absolute w-[120px] -translate-x-1/2 transition-all duration-300 sm:w-[190px]"
              style={{
                left: enemyLeft,
                bottom: enemyVisual.bottom,
                height: enemyVisual.height,
              }}
            >
              <div className="mb-2 border border-yellow-500/30 bg-yellow-950/40 px-2 py-1 text-center text-[10px] font-black tracking-[0.16em] text-yellow-100 sm:px-3 sm:text-xs">
                ENEMY
              </div>
              <div className="flex h-full items-end justify-center border border-yellow-700/60 bg-yellow-950/30 text-center text-sm font-bold sm:text-lg">
                상대 캐릭터
              </div>
            </div>
          </div>
        </div>

        {previewCard && previewCard.rangeMax >= 0 ? (
          <div className="absolute bottom-[180px] right-6 z-30 sm:right-10">
            <div className="rounded-md border border-red-500/40 bg-black/70 px-3 py-2 text-xs font-semibold text-zinc-100 shadow-xl">
              선택 미리보기 · 빨간 박스가 이 행동의 판정 범위
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}