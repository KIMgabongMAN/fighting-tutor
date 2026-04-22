import type { TurnRecord } from "@/lib/game/types";

type Props = {
  history: TurnRecord[];
  didWin: boolean;
  onRestart: () => void;
};

function formatHearts(halfUnits: number) {
  return `${Math.floor(halfUnits / 2)}${halfUnits % 2 ? ".5" : ""}`;
}

export function ReviewScreen({ history, didWin, onRestart }: Props) {
  return (
    <div className="p-6">
      <div className="mb-5 rounded-[22px] border border-zinc-700 bg-zinc-950/70 p-6 shadow-xl">
        <div className="mb-2 text-xs font-black tracking-[0.3em] text-zinc-500">REVIEW</div>
        <div className="mb-2 text-4xl font-black">{didWin ? "승리 복기" : "패배 복기"}</div>
        <div className="text-base text-zinc-300">턴별 선택과 하트 감소 흐름을 정리했다.</div>
      </div>

      <div className="space-y-3">
        {history.map((turn) => (
          <div key={turn.turn} className="rounded-2xl border border-zinc-800 bg-black/40 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-lg font-black text-zinc-100">TURN {turn.turn} · {turn.phaseLabel}</div>
              <div className="text-sm font-black text-zinc-300">{turn.outcome === "player" ? "GOOD" : turn.outcome === "enemy" ? "BAD" : "PASS"}</div>
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-zinc-100">내 하트 {formatHearts(turn.playerLifeBefore)} → {formatHearts(turn.playerLifeAfter)}</div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-zinc-100">상대 하트 {formatHearts(turn.enemyLifeBefore)} → {formatHearts(turn.enemyLifeAfter)}</div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-zinc-100">{turn.note}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={onRestart} className="rounded-xl border border-zinc-500 bg-zinc-900 px-4 py-2 text-sm font-black hover:border-white">다시 시작</button>
      </div>
    </div>
  );
}
