type Props = { commentary: string };

export function CommentaryBox({ commentary }: Props) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-zinc-700 bg-black/80 shadow-xl">
      <div className="border-b border-zinc-800 bg-zinc-950/70 px-4 py-2 text-xs font-black tracking-[0.24em] text-blue-300">
        COMMENTARY
      </div>
      <div className="px-4 py-3 text-sm leading-6 text-zinc-300">{commentary}</div>
    </div>
  );
}
