import type { CardDefinition, CharacterPose, PlayerRoleInPhase } from "@/lib/game/types";
import { GRID_COLS, GRID_ROW_LABELS } from "@/lib/game/data";
import { CharacterSprite } from "@/components/game/CharacterSprite";

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

function buildPreviewTiles(playerX: number, card?: CardDefinition | null) {
  if (!card || card.rangeMax < 0) return [];
  const result: Array<{ row: number; col: number }> = [];
  const start = Math.max(0, playerX + card.rangeMin + 1);
  const end = Math.min(GRID_COLS - 1, playerX + card.rangeMax + 1);

  for (let col = start; col <= end; col += 1) {
    for (const row of card.targetRows) {
      const rowIndex = GRID_ROW_LABELS.indexOf(row);
      if (rowIndex >= 0) result.push({ row: rowIndex, col });
    }
  }
  return result;
}

function poseVisual(pose: CharacterPose) {
  if (pose === "stand") return { bottom: "2%", height: "58%" };
  if (pose === "crouch") return { bottom: "2%", height: "46%" };
  return { bottom: "24%", height: "55%" };
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
      <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('/battlefield/grid-room-bg.png')" }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_60%)]" />
      <div className="relative z-10 flex items-center justify-between border-b border-zinc-800 bg-black/35 px-4 py-2 sm:px-6 sm:py-3">
        <div className="border border-zinc-600 bg-zinc-900 px-2 py-1 text-[10px] font-black tracking-[0.22em] text-zinc-300 sm:px-3 sm:text-xs">
          BATTLE FIELD · 4x9
        </div>
        <div className="text-[10px] text-zinc-300 sm:text-sm">4x9 전장 · 높이 판정 분리</div>
      </div>

      <div className="absolute left-1/2 top-3 z-20 w-full max-w-4xl -translate-x-1/2 px-3 sm:top-4 sm:px-4">
        <div className="border border-zinc-700 bg-black/55 px-4 py-2 text-center text-xs font-semibold text-zinc-100 shadow-xl backdrop-blur-sm sm:px-5 sm:py-3 sm:text-sm">
          {message}
        </div>
      </div>

      {effectText ? (
        <div className="absolute left-1/2 top-16 z-30 -translate-x-1/2 sm:top-20">
          <div className="border border-red-400/60 bg-red-950/80 px-5 py-2 text-sm font-black tracking-[0.18em] text-red-100 shadow-2xl sm:px-7 sm:text-lg sm:tracking-[0.22em]">
            {effectText}
          </div>
        </div>
      ) : null}

      <div className="relative z-10 min-h-[460px] px-4 pb-20 pt-20 sm:min-h-[560px] sm:px-8 sm:pb-24 sm:pt-20">
        <div className="absolute top-[84px] left-1/2 z-20 -translate-x-1/2 sm:top-[92px]">
          <div className="border border-zinc-500 bg-zinc-900/80 px-4 py-2 text-xs font-black tracking-[0.12em] text-zinc-100 shadow-lg sm:px-5 sm:text-sm sm:tracking-[0.18em]">
            {phaseTitle} · {playerRoleInPhase === "attacker" ? "공격자" : playerRoleInPhase === "defender" ? "수비자" : "교전"}
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-10 sm:bottom-6 sm:left-8 sm:right-8">
          <div className="grid gap-1.5 sm:gap-2" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}>
            {Array.from({ length: GRID_COLS * 4 }, (_, index) => {
              const row = Math.floor(index / GRID_COLS);
              const col = index % GRID_COLS;
              const isPreview = previewTiles.some((tile) => tile.row === row && tile.col === col);

              return (
                <div
                  key={`${row}-${col}`}
                  className={`relative h-16 border transition-all duration-200 sm:h-20 ${
                    isPreview
                      ? "border-red-400/70 bg-red-500/20 shadow-[0_0_24px_rgba(239,68,68,0.22)]"
                      : "border-white/20 bg-black/10"
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-zinc-100/80 sm:text-xs">
                    {GRID_ROW_LABELS[row]}-{col + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-[48px] left-4 right-4 z-20 sm:bottom-[60px] sm:left-8 sm:right-8">
          <div className="relative h-[300px] sm:h-[360px]">
            <div className="absolute -translate-x-1/2 transition-all duration-300" style={{ left: playerLeft, bottom: playerVisual.bottom, height: playerVisual.height, width: "170px" }}>
              <CharacterSprite side="player" pose={playerPose} />
            </div>
            <div className="absolute -translate-x-1/2 transition-all duration-300" style={{ left: enemyLeft, bottom: enemyVisual.bottom, height: enemyVisual.height, width: "170px" }}>
              <CharacterSprite side="enemy" pose={enemyPose} />
            </div>
          </div>
        </div>

        {previewCard && previewCard.rangeMax >= 0 ? (
          <div className="absolute bottom-[110px] right-6 z-30 sm:right-10">
            <div className="rounded-md border border-red-500/40 bg-black/70 px-3 py-2 text-xs font-semibold text-zinc-100 shadow-xl">
              선택 미리보기 · 빨간 박스가 이 행동의 판정 범위
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
