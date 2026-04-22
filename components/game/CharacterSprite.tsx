import type { CharacterPose } from "@/lib/game/types";

type Props = {
  side: "player" | "enemy";
  pose: CharacterPose;
};

function gifPath(side: "player" | "enemy", pose: CharacterPose) {
  if (pose === "crouch") return side === "player" ? "/sprites/crouch_player.gif" : "/sprites/crouch_enemy.gif";
  if (pose === "air") return side === "player" ? "/sprites/air_player.gif" : "/sprites/air_enemy.gif";
  return side === "player" ? "/sprites/stand_player.gif" : "/sprites/stand_enemy.gif";
}

function sizeByPose(pose: CharacterPose) {
  if (pose === "crouch") {
    return { width: 150, height: 150 };
  }
  if (pose === "air") {
    return { width: 138, height: 138 };
  }
  return { width: 168, height: 168 };
}

export function CharacterSprite({ side, pose }: Props) {
  const size = sizeByPose(pose);

  return (
    <div
      className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
      style={{ width: size.width, height: size.height }}
    >
      <img
        src={gifPath(side, pose)}
        alt=""
        draggable={false}
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 select-none object-contain ${
          side === "enemy" ? "-scale-x-100" : ""
        }`}
        style={{
          width: size.width,
          height: size.height,
          imageRendering: "pixelated",
          transformOrigin: "bottom center",
        }}
      />
    </div>
  );
}
