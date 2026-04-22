type Props = {
  playerHeartsHalf: number;
  enemyHeartsHalf: number;
  playerTension: number;
  enemyTension: number;
  round: number;
  distanceLabel: string;
  phaseTitle: string;
  playerStateText: string;
  enemyStateText: string;
  enemyPersonalityLabel: string;
  playerBurstUsed: boolean;
  enemyBurstUsed: boolean;
  playerVulnerable: boolean;
  enemyVulnerable: boolean;
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
    case "무방비":
      return "text-red-100 border-red-400/60 bg-red-950/70";
    default:
      return "text-zinc-100 border-zinc-600 bg-zinc-900/60";
  }
}

function HeartIcon({ fillPercent, size = 32 }: { fillPercent: number; size?: number }) {
  const heartPath =
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d={heartPath} fill="#27272a" stroke="#52525b" strokeWidth="1.2" />
      </svg>
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
        <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
          <path d={heartPath} fill="#ef4444" stroke="#fb7185" strokeWidth="1.2" />
        </svg>
      </div>
    </div>
  );
}

function HeartMeter({ halfUnits }: { halfUnits: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 4 }, (_, index) => {
        const remaining = Math.max(0, halfUnits - index * 2);
        const fillPercent = remaining >= 2 ? 100 : remaining === 1 ? 50 : 0;
        return <HeartIcon key={index} fillPercent={fillPercent} />;
      })}
    </div>
  );
}

export function BattleHud({
  playerHeartsHalf,
  enemyHeartsHalf,
  playerTension,
  enemyTension,
  round,
  distanceLabel,
  phaseTitle,
  playerStateText,
  enemyStateText,
  enemyPersonalityLabel,
  playerBurstUsed,
  enemyBurstUsed,
  playerVulnerable,
  enemyVulnerable,
}: Props) {
  return (
    <div className="relative z-40 border-b border-zinc-800 bg-black/90 backdrop-blur-sm">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-3">
            <div className="border border-red-500/40 bg-red-950 px-3 py-1 text-xs font-black tracking-[0.2em] text-red-300">
              PLAYER
            </div>
            <div className="text-sm text-zinc-300">격투 입문자</div>
          </div>
          <div className="mb-3"><HeartMeter halfUnits={playerHeartsHalf} /></div>
          <div className="flex items-center gap-3">
            <div className="w-10 text-xs text-zinc-400">텐션</div>
            <div className="h-3 flex-1 overflow-hidden rounded-sm border border-zinc-700 bg-zinc-900">
              <div
                className="h-full bg-gradient-to-r from-red-900 to-red-400 transition-all duration-300"
                style={{ width: `${playerTension}%` }}
              />
            </div>
            <div className="w-10 text-right text-sm font-bold text-zinc-100">{playerTension}</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 px-2">
          <div className="text-xs tracking-[0.35em] text-zinc-500">ROUND</div>
          <div className="border border-zinc-600 bg-zinc-900 px-5 py-2 text-3xl font-black shadow-lg">
            {round}
          </div>
          <div className="border border-zinc-700 bg-black px-4 py-1 text-2xl font-black text-zinc-100">
            99
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-end gap-3">
            <div className="text-sm text-zinc-300">{enemyPersonalityLabel}</div>
            <div className="border border-yellow-500/40 bg-yellow-950 px-3 py-1 text-xs font-black tracking-[0.2em] text-yellow-200">
              ENEMY
            </div>
          </div>
          <div className="mb-3 flex justify-end"><HeartMeter halfUnits={enemyHeartsHalf} /></div>
          <div className="flex items-center gap-3">
            <div className="w-10 text-sm font-bold text-zinc-100">{enemyTension}</div>
            <div className="h-3 flex-1 overflow-hidden rounded-sm border border-zinc-700 bg-zinc-900">
              <div
                className="ml-auto h-full bg-gradient-to-l from-yellow-800 to-yellow-300 transition-all duration-300"
                style={{ width: `${enemyTension}%` }}
              />
            </div>
            <div className="w-10 text-right text-xs text-zinc-400">텐션</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2 px-4 pb-4 sm:px-6">
        <InfoBox label="거리 판정" value={distanceLabel} />
        <InfoBox label="현재 국면" value={phaseTitle} />
        <InfoBox label="내 상태" value={playerVulnerable ? "무방비" : playerStateText} className={fighterStateClass(playerVulnerable ? "무방비" : playerStateText)} />
        <InfoBox label="상대 상태" value={enemyVulnerable ? "무방비" : enemyStateText} className={fighterStateClass(enemyVulnerable ? "무방비" : enemyStateText)} />
        <InfoBox label="내 버스트" value={playerBurstUsed ? "사용 완료" : "사용 가능"} />
        <InfoBox label="상대 버스트" value={enemyBurstUsed ? "사용 완료" : "사용 가능"} />
      </div>
    </div>
  );
}

function InfoBox({
  label,
  value,
  className = "border-zinc-700 bg-zinc-900 text-zinc-100",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`border px-3 py-2 ${className}`}>
      <div className="mb-1 text-[10px] tracking-[0.2em] opacity-70">{label}</div>
      <div className="text-sm font-black sm:text-base">{value}</div>
    </div>
  );
}
