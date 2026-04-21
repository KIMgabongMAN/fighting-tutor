type Props = {
  commentary: string;
};

export function CommentaryBox({ commentary }: Props) {
  return (
    <div className="overflow-hidden border border-blue-900 bg-zinc-950 shadow-lg [clip-path:polygon(2%_0,100%_0,98%_100%,0_100%)]">
      <div className="border-b border-blue-950 bg-blue-950/30 px-4 py-2 text-xs font-black tracking-[0.2em] text-blue-300 sm:px-5 sm:text-sm">
        COMMENTARY
      </div>
      <div className="px-4 py-3 text-xs leading-5 text-zinc-200 sm:px-5 sm:text-sm">
        {commentary}
      </div>
    </div>
  );
}