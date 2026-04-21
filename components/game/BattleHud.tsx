type Props = {
  playerHp: number;
  enemyHp: number;
  playerTension: number;
  enemyTension: number;
  round: number;
  distanceLabel: string;
  phaseTitle: string;
  playerStateText: string;
  enemyStateText: string;
};

function fighterStateClass(state: string) {
  switch (state) {
    case "압박 찬스":
      return "text-red-200 border-red-500/50 bg-red-950/50";
    case "가드 상황":
      return "text-blue-100 border-blue-500/50 bg-blue-950/50";
    case "하드 다운":
      return "text-yellow-100 border-yellow-500/50 bg-yellow-950/50";
    case "콤보 상황":
      return "text-orange-100 border-orange-500/50 bg-orange-950/50";
    default:
      return "text-zinc-100 border-zinc-600 bg-zinc-900/60";
  }
}

export function BattleHud({
  playerHp,
  enemyHp,
  playerTension,
  enemyTension,
  round,
  distanceLabel,
  phaseTitle,
  playerStateText,
  enemyStateText,
}: Props) {
  return (
    <>
      <div className="border-b border-zinc-800 bg-zinc-950/90 px-3 py-3 sm:px-5 sm:py-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 sm:gap-3">
              <div className="border border-red-500/40 bg-red-950 px-2 py-1 text-[10px] font-black tracking-[0.2em] text-red-300 [clip-path:polygon(0_0,100%_0,92%_100%,0_100%)] sm:text-xs">
                PLAYER
              </div>
              <div className="text-xs text-zinc-400 sm:text-sm">격투 입문자</div>
            </div>

            <div className="h-6 w-full overflow-hidden border border-zinc-700 bg-zinc-800 [clip-path:polygon(0_0,100%_0,96%_100%,0_100%)] sm:h-8">
              <div
                className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-300"
                style={{ width: `${playerHp}%` }}
              />
            </div>

            <div className="mt-2 flex items-center gap-2 sm:gap-3">
              <div className="w-12 text-[10px] text-zinc-400 sm:w-16 sm:text-xs">텐션</div>
              <div className="h-2.5 flex-1 overflow-hidden border border-zinc-700 bg-zinc-800 [clip-path:polygon(0_0,100%_0,96%_100%,0_100%)] sm:h-3">
                <div
                  className="h-full bg-gradient-to-r from-red-900 to-red-400 transition-all duration-300"
                  style={{ width: `${playerTension}%` }}
                />
              </div>
              <div className="w-8 text-right text-xs font-bold text-zinc-200 sm:w-10 sm:text-sm">{playerHp}</div>
            </div>
          </div>

          <div className="flex flex-row justify-center gap-3 sm:flex-col sm:items-center sm:px-3">
            <div className="hidden text-xs tracking-[0.35em] text-zinc-500 sm:block">ROUND</div>
            <div className="border border-zinc-600 bg-zinc-900 px-4 py-1.5 text-2xl font-black shadow-lg [clip-path:polygon(10%_0,100%_0,90%_100%,0_100%)] sm:px-5 sm:py-2 sm:text-3xl">
              {round}
            </div>
            <div className="border border-zinc-700 bg-black px-3 py-1 text-xl font-black text-zinc-100 [clip-path:polygon(8%_0,100%_0,92%_100%,0_100%)] sm:mt-2 sm:px-4 sm:py-1 sm:text-2xl">
              99
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex items-center justify-end gap-2 sm:gap-3">
              <div className="text-xs text-zinc-400 sm:text-sm">압박형 상대</div>
              <div className="border border-yellow-500/40 bg-yellow-950 px-2 py-1 text-[10px] font-black tracking-[0.2em] text-yellow-200 [clip-path:polygon(8%_0,100%_0,100%_100%,0_100%)] sm:text-xs">
                ENEMY
              </div>
            </div>

            <div className="h-6 w-full overflow-hidden border border-zinc-700 bg-zinc-800 [clip-path:polygon(4%_0,100%_0,100%_100%,0_100%)] sm:h-8">
              <div
                className="ml-auto h-full bg-gradient-to-l from-yellow-600 to-yellow-400 transition-all duration-300"
                style={{ width: `${enemyHp}%` }}
              />
            </div>

            <div className="mt-2 flex items-center gap-2 sm:gap-3">
              <div className="w-8 text-xs font-bold text-zinc-200 sm:w-10 sm:text-sm">{enemyHp}</div>
              <div className="h-2.5 flex-1 overflow-hidden border border-zinc-700 bg-zinc-800 [clip-path:polygon(4%_0,100%_0,100%_100%,0_100%)] sm:h-3">
                <div
                  className="ml-auto h-full bg-gradient-to-l from-yellow-800 to-yellow-300 transition-all duration-300"
                  style={{ width: `${enemyTension}%` }}
                />
              </div>
              <div className="w-12 text-right text-[10px] text-zinc-400 sm:w-16 sm:text-xs">텐션</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 px-3 pt-3 sm:grid-cols-4 sm:gap-3 sm:px-4 sm:pt-4">
        <div className="border border-zinc-700 bg-zinc-900 px-3 py-2 [clip-path:polygon(0_0,100%_0,96%_100%,0_100%)] sm:px-4 sm:py-3">
          <div className="mb-1 text-[10px] tracking-[0.2em] text-zinc-500 sm:text-xs">거리 판정</div>
          <div className="text-lg font-black sm:text-xl">{distanceLabel}</div>
        </div>

        <div className="border border-zinc-700 bg-zinc-900 px-3 py-2 [clip-path:polygon(4%_0,100%_0,100%_100%,0_100%)] sm:px-4 sm:py-3">
          <div className="mb-1 text-[10px] tracking-[0.2em] text-zinc-500 sm:text-xs">현재 국면</div>
          <div className="text-lg font-black sm:text-xl">{phaseTitle}</div>
        </div>

        <div className={`border px-3 py-2 [clip-path:polygon(0_0,100%_0,96%_100%,0_100%)] sm:px-4 sm:py-3 ${fighterStateClass(playerStateText)}`}>
          <div className="mb-1 text-[10px] tracking-[0.2em] opacity-70 sm:text-xs">내 상태</div>
          <div className="text-sm font-black sm:text-lg">{playerStateText}</div>
        </div>

        <div className={`border px-3 py-2 [clip-path:polygon(4%_0,100%_0,100%_100%,0_100%)] sm:px-4 sm:py-3 ${fighterStateClass(enemyStateText)}`}>
          <div className="mb-1 text-[10px] tracking-[0.2em] opacity-70 sm:text-xs">상대 상태</div>
          <div className="text-sm font-black sm:text-lg">{enemyStateText}</div>
        </div>
      </div>
    </>
  );
}