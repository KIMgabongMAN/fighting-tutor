"use client";

export type CharacterGifPose = "stand" | "crouch" | "air";
export type CharacterGifSide = "player" | "enemy";

type CharacterSpriteProps = {
  side: CharacterGifSide;
  pose: CharacterGifPose;
  className?: string;
};

function getGifPath(side: CharacterGifSide, pose: CharacterGifPose) {
  if (side === "player") {
    if (pose === "crouch") return "/sprites/player/crouch.gif";
    if (pose === "air") return "/sprites/player/air.gif";
    return "/sprites/player/stand.gif";
  }

  if (pose === "crouch") return "/sprites/enemy/crouch.gif";
  if (pose === "air") return "/sprites/enemy/air.gif";
  return "/sprites/enemy/stand.gif";
}

function getSpriteSize(pose: CharacterGifPose) {
  if (pose === "crouch") {
    return {
      width: 156,
      height: 132,
      bottom: 0,
    };
  }

  if (pose === "air") {
    return {
      width: 168,
      height: 168,
      bottom: 18,
    };
  }

  return {
    width: 170,
    height: 215,
    bottom: 0,
  };
}

export function CharacterSprite({
  side,
  pose,
  className = "",
}: CharacterSpriteProps) {
  const src = getGifPath(side, pose);
  const size = getSpriteSize(pose);

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        left: "50%",
        bottom: `${size.bottom}px`,
        transform: "translateX(-50%)",
        width: `${size.width}px`,
        height: `${size.height}px`,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      <img
        src={src}
        alt={`${side}-${pose}`}
        draggable={false}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          userSelect: "none",
          pointerEvents: "none",
          display: "block",
        }}
      />
    </div>
  );
}