type Props = {
  side: "player" | "enemy";
  pose: "stand" | "crouch" | "air";
  className?: string;
};

export function CharacterSprite({ side, pose, className = "" }: Props) {
  const spriteUrl =
    side === "player"
      ? "/sprites/player-idle-strip.png"
      : "/sprites/enemy-idle-strip.png";

  const poseClass =
    pose === "crouch" ? "scale-y-[0.82] origin-bottom" : pose === "air" ? "translate-y-[-16%]" : "";

  return (
    <div className={`relative h-full w-full ${className}`}>
      <div
        className={`sprite-idle absolute inset-0 ${poseClass}`}
        style={{
          backgroundImage: `url(${spriteUrl})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "400% 100%",
          imageRendering: "auto",
        }}
      />
    </div>
  );
}
