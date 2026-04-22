import type { TurnRecord } from "@/lib/game/types";
type Props = { history: TurnRecord[]; didWin: boolean; onRestart: () => void; };
export function ReviewScreen({ history, didWin, onRestart }: Props) {
  return (
    <div className="p-6">
      <div className="mb-5 border border-zinc-700 bg-zinc-950/70 p-5 shadow-xl sm:p-6">
        <div className="mb-2 text-xs font-black tracking-[0.3em] text-zinc-500">REVIEW</div>
        <div className="mb-2 text-2xl font-black sm:text-4xl">{didWin ? "승리 복기" : "패배 복기"}</div>
        <div className="text-sm text-zinc-300 sm:text-base">턴별 선택과 하트 감소 흐름을 정리했다.</div>
      </div>
      <div className="flex justify-end">
        <button onClick={onRestart} className="rounded-md border border-zinc-500 bg-zinc-900 px-4 py-2 text-sm font-black hover:border-white">다시 시작</button>
      </div>
    </div>
  );
}
