import type { PhaseBannerState } from "@/lib/game/types";
type Props = { banner: PhaseBannerState };
const toneClasses = {
  neutral: "border-zinc-400/70 bg-zinc-900/85 text-zinc-100",
  danger: "border-yellow-400/70 bg-yellow-950/85 text-yellow-100",
  advantage: "border-red-400/70 bg-red-950/85 text-red-100",
  system: "border-blue-400/70 bg-blue-950/85 text-blue-100",
};
export function PhaseBanner({ banner }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[60] flex items-center justify-center overflow-hidden">
      <div key={banner.id} className={`phase-banner-anim min-w-[220px] max-w-[88vw] border px-8 py-4 text-center text-xl font-black tracking-[0.18em] backdrop-blur-sm sm:text-3xl ${toneClasses[banner.tone]}`}>
        {banner.text}
      </div>
    </div>
  );
}
