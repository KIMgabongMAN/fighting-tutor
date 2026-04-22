import Image from "next/image";
import type { BattlefieldRow, CardDefinition, CharacterPose, PlayerRoleInPhase } from "@/lib/game/types";
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

function poseRows(pose: CharacterPose) {
  if (pose === "stand") return [2, 3];
  if (pose === "crouch") return [3];
  return [0, 1];
}

function poseVisual(pose: CharacterPose) {
  if (pose === "stand") return { bottom: "2%", height: "60%" };
  if (pose === "crouch") return { bottom: "2%", height: "44%" };
  return { bottom: "24%", height: "56%" };
}

export function BattleField({ message, phaseTitle, playerRoleInPhase, playerX, enemyX, playerPose, enemyPose, effectText, previewCard }: Props) {
  const playerLeft = `${tileCenterPercent(playerX)}%`;
  const enemyLeft = `${tileCenterPercent(enemyX)}%`;
  const previewTiles = buildPreviewTiles(playerX, previewCard);
  const playerRows = poseRows(playerPose);
  const enemyRows = poseRows(enemyPose);
  const playerVisual = poseVisual(playerPose);
  const enemyVisual = poseVisual(enemyPose);

  return (
    <div className="relative overflow-hidden rounded-[26px] border border-zinc-700 bg-black shadow-2xl">
      <div className="absolute inset-0">
        <Image src="/images/training-room-bg.png" alt="training room background" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/15" />
      </div>

      <div className="relative z-10 border-b border-zinc-800 bg-black/70 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="rounded-md border border-zinc-600 bg-zinc-900/80 px-3 py-1 text-xs font-black tracking-[0.22em] text-zinc-200">
            TRAINING SIMULATOR V4.0 · 4x9 GRID · HEART SYSTEM
          </div>
          <button className="rounded-lg border border-zinc-600 bg-zinc-900/80 px-3 py-2 text-sm font-bold text-zinc-200">다시 시작</button>
        </div>
      </div>

      <div className="relative z-10 px-5 pb-4 pt-3">
        <div className="mb-3 flex items-start justify-between">
          <div className="w-[34%] rounded-xl border border-zinc-700 bg-black/55 p-3 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-md border border-red-500/40 bg-red-950 px-3 py-1 text-xs font-black tracking-[0.18em] text-red-200">플레이어</div>
              <div className="text-sm text-zinc-300">격투 입문자</div>
            </div>
            <div className="mb-2 flex items-center gap-2 text-3xl text-red-500"><span>♥</span><span>♥</span><span>♥</span><span>♥</span></div>
            <div className="flex items-center gap-3">
              <div className="w-9 text-sm text-zinc-400">텐션</div>
              <div className="h-4 flex-1 overflow-hidden rounded-sm border border-zinc-700 bg-zinc-900"><div className="h-full w-[35%] bg-gradient-to-r from-red-600 to-red-400" /></div>
              <div className="w-8 text-right text-sm font-bold text-zinc-300">35</div>
            </div>
          </div>

          <div className="mt-1 flex flex-col items-center gap-2">
            <div className="text-xs tracking-[0.4em] text-zinc-500">ROUND</div>
            <div className="rounded-lg border border-zinc-600 bg-zinc-900/80 px-5 py-2 text-6xl font-black leading-none">1</div>
            <div className="rounded-md border border-zinc-700 bg-black/80 px-4 py-1 text-4xl font-black leading-none">99</div>
          </div>

          <div className="w-[34%] rounded-xl border border-zinc-700 bg-black/55 p-3 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-end gap-3">
              <div className="text-sm text-zinc-300">수비형 상대</div>
              <div className="rounded-md border border-yellow-500/40 bg-yellow-950 px-3 py-1 text-xs font-black tracking-[0.18em] text-yellow-200">상대</div>
            </div>
            <div className="mb-2 flex items-center justify-end gap-2 text-3xl text-red-500"><span>♥</span><span>♥</span><span>♥</span><span>♥</span></div>
            <div className="flex items-center gap-3">
              <div className="w-8 text-right text-sm font-bold text-zinc-300">35</div>
              <div className="h-4 flex-1 overflow-hidden rounded-sm border border-zinc-700 bg-zinc-900"><div className="ml-auto h-full w-[35%] bg-gradient-to-l from-yellow-600 to-yellow-400" /></div>
              <div className="w-9 text-right text-sm text-zinc-400">텐션</div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[22px] border border-zinc-700 bg-black/10 px-4 pb-5 pt-4 backdrop-blur-[1px]">
          <div className="absolute left-1/2 top-6 z-20 -translate-x-1/2 rounded-lg border border-zinc-700 bg-black/75 px-8 py-3 text-2xl font-black text-zinc-100 shadow-lg">
            기록 · 조건
          </div>

          {effectText ? (
            <div className="absolute left-1/2 top-24 z-20 -translate-x-1/2 rounded-lg border border-red-400/70 bg-red-950/80 px-5 py-2 text-xl font-black text-red-100">
              {effectText}
            </div>
          ) : null}

          <div className="absolute left-1/2 top-0 bottom-0 z-10 -translate-x-1/2 border-l border-black/40" />

          <div className="relative z-10 h-[460px]">
            <div className="absolute inset-x-[22px] bottom-5 grid grid-cols-9 gap-0">
              {Array.from({ length: 36 }, (_, index) => {
                const row = Math.floor(index / 9);
                const col = index % 9;
                const isPreview = previewTiles.some((tile) => tile.row === row && tile.col === col);
                return (
                  <div
                    key={`${row}-${col}`}
                    className={`relative h-[70px] border border-white/20 ${isPreview ? "bg-red-500/18" : "bg-white/4"}`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-white/75">
                      {GRID_ROW_LABELS[row]}-{col + 1}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="absolute inset-x-[22px] bottom-5 pointer-events-none">
              <div className="relative h-[280px]">
                <div className="absolute -translate-x-1/2" style={{ left: playerLeft, bottom: playerVisual.bottom, height: playerVisual.height, width: "170px" }}>
                  <div className="absolute inset-x-3 bottom-0 h-4 rounded-full bg-red-400/25 blur-xl" />
                  <div className="absolute inset-x-0 bottom-0 mx-auto h-[24px] w-[120px] rounded-sm border border-red-400/55 bg-red-500/12" />
                  <div className="absolute inset-x-0 bottom-[20px] mx-auto h-full w-[140px]">
                    {playerRows.includes(2) || playerRows.includes(0) ? <div className="absolute left-[18px] right-[18px] top-0 bottom-[46%] rounded-sm border border-red-400/55 bg-red-500/10" /> : null}
                    {playerRows.includes(3) || playerRows.includes(1) ? <div className="absolute left-[18px] right-[18px] top-[32%] bottom-[12%] rounded-sm border border-red-400/55 bg-red-500/10" /> : null}
                    <div className="absolute inset-0 flex items-end justify-center text-[88px]">🪵</div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 mx-auto w-fit rounded-md border border-red-500/50 bg-black/75 px-4 py-2 text-xl font-black text-red-300">내 캐릭터</div>
                </div>

                <div className="absolute -translate-x-1/2" style={{ left: enemyLeft, bottom: enemyVisual.bottom, height: enemyVisual.height, width: "170px" }}>
                  <div className="absolute inset-x-3 bottom-0 h-4 rounded-full bg-yellow-400/25 blur-xl" />
                  <div className="absolute inset-x-0 bottom-0 mx-auto h-[24px] w-[120px] rounded-sm border border-yellow-400/55 bg-yellow-500/12" />
                  <div className="absolute inset-x-0 bottom-[20px] mx-auto h-full w-[140px]">
                    {enemyRows.includes(2) || enemyRows.includes(0) ? <div className="absolute left-[18px] right-[18px] top-0 bottom-[46%] rounded-sm border border-yellow-400/55 bg-yellow-500/10" /> : null}
                    {enemyRows.includes(3) || enemyRows.includes(1) ? <div className="absolute left-[18px] right-[18px] top-[32%] bottom-[12%] rounded-sm border border-yellow-400/55 bg-yellow-500/10" /> : null}
                    <div className="absolute inset-0 flex items-end justify-center text-[88px]">🪵</div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 mx-auto w-fit rounded-md border border-yellow-500/50 bg-black/75 px-4 py-2 text-xl font-black text-yellow-200">상대 캐릭터</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
