import type { TurnRecord } from "@/lib/game/types";

type Props = {
  history: TurnRecord[];
  didWin: boolean;
  onRestart: () => void;
};

function buildPoints(values: number[], width: number, height: number) {
  if (values.length === 0) return "";
  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - (value / 8) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

function formatHearts(halfUnits: number) {
  return `${Math.floor(halfUnits / 2)}${halfUnits % 2 ? ".5" : ""}`;
}

export function ReviewScreen({ history, didWin, onRestart }: Props) {
  const playerSeries = [8, ...history.map((h) => h.playerLifeAfter)];
  const enemySeries = [8, ...history.map((h) => h.enemyLifeAfter)];

  const playerPolyline = buildPoints(playerSeries, 1000, 260);
  const enemyPolyline = buildPoints(enemySeries, 1000, 260);

  const totalDealt = history.reduce(
    (sum, h) => sum + Math.max(0, h.enemyLifeBefore - h.enemyLifeAfter),
    0
  );
  const totalTaken = history.reduce(
    (sum, h) => sum + Math.max(0, h.playerLifeBefore - h.playerLifeAfter),
    0
  );
  const playerWins = history.filter((h) => h.outcome === "player").length;
  const enemyWins = history.filter((h) => h.outcome === "enemy").length;
  const draws = history.filter((h) => h.outcome === "none").length;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5 border border-zinc-700 bg-zinc-950/70 p-5 shadow-xl sm:p-6">
        <div className="mb-2 text-xs font-black tracking-[0.3em] text-zinc-500">
          REVIEW
        </div>
        <div className="mb-2 text-2xl font-black sm:text-4xl">
          {didWin ? "승리 복기" : "패배 복기"}
        </div>
        <div className="text-sm text-zinc-300 sm:text-base">
          턴별 선택과 하트 감소 흐름을 정리했다.
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="총 턴 수" value={`${history.length}`} />
        <StatCard label="가한 하트 피해" value={formatHearts(totalDealt)} />
        <StatCard label="받은 하트 피해" value={formatHearts(totalTaken)} />
        <StatCard label="판정 전적" value={`${playerWins}승 ${enemyWins}패 ${draws}무`} />
      </div>

      <div className="mb-5 border border-zinc-700 bg-zinc-950/70 p-4 shadow-xl sm:p-5">
        <div className="mb-3 text-lg font-black text-zinc-100 sm:text-xl">
          전황 그래프
        </div>
        <div className="mb-4 text-xs text-zinc-400 sm:text-sm">
          하트가 턴마다 어떻게 줄었는지 보여준다.
        </div>

        <div className="overflow-hidden rounded-md border border-zinc-800 bg-black/50 p-3 sm:p-4">
          <svg
            viewBox="0 0 1000 260"
            className="h-[240px] w-full"
            preserveAspectRatio="none"
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const y = (260 / 4) * i;
              return (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={y}
                  x2="1000"
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="2"
                />
              );
            })}

            {Array.from({ length: Math.max(history.length, 1) + 1 }).map((_, i, arr) => {
              const x = (1000 / Math.max(arr.length - 1, 1)) * i;
              return (
                <line
                  key={`v-${i}`}
                  x1={x}
                  y1="0"
                  x2={x}
                  y2="260"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="2"
                />
              );
            })}

            <polyline
              fill="none"
              stroke="rgb(248 113 113)"
              strokeWidth="6"
              points={playerPolyline}
            />
            <polyline
              fill="none"
              stroke="rgb(250 204 21)"
              strokeWidth="6"
              points={enemyPolyline}
            />
          </svg>

          <div className="mt-3 flex flex-wrap gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-red-400" />
              <span className="text-zinc-300">내 하트</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-yellow-300" />
              <span className="text-zinc-300">상대 하트</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 border border-zinc-700 bg-zinc-950/70 p-4 shadow-xl sm:p-5">
        <div className="mb-3 text-lg font-black text-zinc-100 sm:text-xl">
          턴별 복기
        </div>

        <div className="space-y-3">
          {history.map((turn) => (
            <div
              key={turn.turn}
              className="rounded-md border border-zinc-800 bg-black/40 p-3 sm:p-4"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-black text-zinc-100 sm:text-base">
                  TURN {turn.turn} · {turn.phaseLabel}
                </div>
                <div
                  className={`text-xs font-black tracking-[0.15em] ${
                    turn.outcome === "player"
                      ? "text-yellow-200"
                      : turn.outcome === "enemy"
                      ? "text-red-300"
                      : "text-zinc-300"
                  }`}
                >
                  {turn.outcome === "player"
                    ? "GOOD"
                    : turn.outcome === "enemy"
                    ? "BAD"
                    : "PASS"}
                </div>
              </div>

              <div className="mb-2 grid gap-2 sm:grid-cols-2">
                <div className="border border-zinc-800 bg-zinc-900/60 p-3">
                  <div className="mb-1 text-[10px] tracking-[0.2em] text-zinc-500">PLAYER CARD</div>
                  <div className="font-bold text-zinc-100">{turn.playerCardTitle}</div>
                </div>
                <div className="border border-zinc-800 bg-zinc-900/60 p-3">
                  <div className="mb-1 text-[10px] tracking-[0.2em] text-zinc-500">ENEMY CARD</div>
                  <div className="font-bold text-zinc-100">{turn.enemyCardTitle}</div>
                </div>
              </div>

              <div className="mb-2 grid gap-2 sm:grid-cols-3">
                <MiniInfo
                  label="내 하트"
                  value={`${formatHearts(turn.playerLifeBefore)} → ${formatHearts(turn.playerLifeAfter)}`}
                />
                <MiniInfo
                  label="상대 하트"
                  value={`${formatHearts(turn.enemyLifeBefore)} → ${formatHearts(turn.enemyLifeAfter)}`}
                />
                <MiniInfo
                  label="거리"
                  value={`${turn.distanceBefore} → ${turn.distanceAfter}`}
                />
              </div>

              <div className="text-sm text-zinc-300">{turn.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onRestart}
          className="rounded-md border border-zinc-500 bg-zinc-900 px-4 py-2 text-sm font-black hover:border-white"
        >
          다시 시작
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-zinc-700 bg-zinc-950/70 p-4">
      <div className="mb-1 text-[10px] tracking-[0.2em] text-zinc-500 sm:text-xs">
        {label}
      </div>
      <div className="text-lg font-black text-zinc-100 sm:text-2xl">{value}</div>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-zinc-800 bg-zinc-900/60 p-3">
      <div className="mb-1 text-[10px] tracking-[0.2em] text-zinc-500">{label}</div>
      <div className="text-sm font-bold text-zinc-100">{value}</div>
    </div>
  );
}