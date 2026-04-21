import type { PhaseBannerState } from "@/lib/game/types";

type Props = {
  banner: PhaseBannerState;
};

const toneClasses = {
  neutral:
    "border-zinc-400/70 bg-zinc-900/85 text-zinc-100 shadow-[0_0_30px_rgba(255,255,255,0.08)]",
  danger:
    "border-yellow-400/70 bg-yellow-950/85 text-yellow-100 shadow-[0_0_34px_rgba(250,204,21,0.14)]",
  advantage:
    "border-red-400/70 bg-red-950/85 text-red-100 shadow-[0_0_34px_rgba(248,113,113,0.14)]",
  system:
    "border-blue-400/70 bg-blue-950/85 text-blue-100 shadow-[0_0_34px_rgba(96,165,250,0.14)]",
};

export function PhaseBanner({ banner }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[60] flex items-center justify-center overflow-hidden">
      <div
        key={banner.id}
        className={`phase-banner-anim min-w-[220px] max-w-[88vw] border px-8 py-4 text-center text-xl font-black tracking-[0.18em] [clip-path:polygon(3%_0,100%_0,97%_100%,0_100%)] backdrop-blur-sm sm:text-3xl ${toneClasses[banner.tone]}`}
      >
        {banner.text}
      </div>
    </div>
  );
}