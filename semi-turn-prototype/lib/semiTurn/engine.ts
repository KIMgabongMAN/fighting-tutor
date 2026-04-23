import type {
  ActionDefinition,
  FighterState,
  ResolveResult,
  RuntimeAction,
  TimelineEvent
} from "./types";

const MAX_FRAME = 30;
const MIN_X = 0;
const MAX_X = 8;

function clampX(value: number) {
  return Math.max(MIN_X, Math.min(MAX_X, value));
}

function cloneFighter(fighter: FighterState): FighterState {
  return { ...fighter };
}

function isGuarding(def: ActionDefinition, frame: number) {
  return (
    def.kind === "defense" &&
    frame >= def.startup &&
    frame < def.startup + def.active
  );
}

function isAttackActive(def: ActionDefinition, frame: number) {
  return (
    def.kind === "attack" &&
    frame >= def.startup &&
    frame < def.startup + def.active
  );
}

function isMoveStarting(def: ActionDefinition, frame: number) {
  return def.kind === "move" && frame === def.startup;
}

function isInvincible(def: ActionDefinition, frame: number) {
  if (!def.invincibleFrames) return false;
  return frame < def.invincibleFrames;
}

function applyMove(
  fighter: FighterState,
  def: ActionDefinition,
  side: "player" | "enemy"
) {
  if (def.moveX === 0) return;
  const signedMove = side === "player" ? def.moveX : -def.moveX;
  fighter.x = clampX(fighter.x + signedMove);
}

function inRange(
  attacker: FighterState,
  defender: FighterState,
  def: ActionDefinition,
  side: "player" | "enemy"
) {
  const gap =
    side === "player"
      ? Math.max(0, defender.x - attacker.x - 1)
      : Math.max(0, attacker.x - defender.x - 1);

  return gap >= def.rangeMin && gap <= def.rangeMax;
}

function canThrowConnect(defender: FighterState) {
  return defender.pose !== "air" && !defender.airborne && !defender.knockedDown;
}

function doesGuardBeatAttack(
  attack: ActionDefinition,
  defenderAction: ActionDefinition
) {
  if (defenderAction.kind !== "defense") return false;
  if (attack.hitLevel === "throw") return false;
  return true;
}

function hitText(attacker: string, action: ActionDefinition, defender: string) {
  return `${attacker}의 ${action.title}가 ${defender}에게 적중`;
}

function guardText(
  attacker: string,
  action: ActionDefinition,
  defender: string
) {
  return `${defender}가 ${attacker}의 ${action.title}를 가드`;
}

function whiffText(attacker: string, action: ActionDefinition) {
  return `${attacker}의 ${action.title}가 빗나감`;
}

function knockdownText(defender: string) {
  return `${defender}가 하드 다운됨`;
}

function resolvePosition(player: FighterState, enemy: FighterState) {
  if (player.x >= enemy.x) {
    player.x = clampX(enemy.x - 1);
    if (player.x < MIN_X) {
      player.x = MIN_X;
      enemy.x = clampX(player.x + 1);
    }
  }
}

export function resolveSemiTurn(
  prevPlayer: FighterState,
  prevEnemy: FighterState,
  playerActionDef: ActionDefinition,
  enemyActionDef: ActionDefinition
): ResolveResult {
  const player = cloneFighter(prevPlayer);
  const enemy = cloneFighter(prevEnemy);

  const events: TimelineEvent[] = [];
  const playerRuntime: RuntimeAction = {
    def: playerActionDef,
    owner: "player",
    connected: false
  };
  const enemyRuntime: RuntimeAction = {
    def: enemyActionDef,
    owner: "enemy",
    connected: false
  };

  let winner: "player" | "enemy" | "draw" | "none" = "none";
  let resolved = false;

  player.pose = playerActionDef.airborne ? "air" : "stand";
  enemy.pose = enemyActionDef.airborne ? "air" : "stand";
  player.airborne = !!playerActionDef.airborne;
  enemy.airborne = !!enemyActionDef.airborne;
  player.knockedDown = false;
  enemy.knockedDown = false;
  player.vulnerable = false;
  enemy.vulnerable = false;

  for (let frame = 0; frame <= MAX_FRAME; frame += 1) {
    if (isMoveStarting(playerActionDef, frame)) {
      applyMove(player, playerActionDef, "player");
      resolvePosition(player, enemy);
      events.push({ frame, text: `플레이어가 ${playerActionDef.title}` });
    }

    if (isMoveStarting(enemyActionDef, frame)) {
      applyMove(enemy, enemyActionDef, "enemy");
      resolvePosition(player, enemy);
      events.push({ frame, text: `상대가 ${enemyActionDef.title}` });
    }

    const playerGuarding = isGuarding(playerActionDef, frame);
    const enemyGuarding = isGuarding(enemyActionDef, frame);

    const playerAttackActive = isAttackActive(playerActionDef, frame);
    const enemyAttackActive = isAttackActive(enemyActionDef, frame);

    const playerCanHit =
      playerAttackActive &&
      inRange(player, enemy, playerActionDef, "player") &&
      (!playerActionDef.hitLevel ||
        playerActionDef.hitLevel !== "throw" ||
        canThrowConnect(enemy));

    const enemyCanHit =
      enemyAttackActive &&
      inRange(enemy, player, enemyActionDef, "enemy") &&
      (!enemyActionDef.hitLevel ||
        enemyActionDef.hitLevel !== "throw" ||
        canThrowConnect(player));

    if (resolved) continue;

    if (playerCanHit && enemyCanHit) {
      const playerInv = isInvincible(playerActionDef, frame);
      const enemyInv = isInvincible(enemyActionDef, frame);

      if (playerInv && !enemyInv) {
        enemy.hp = Math.max(0, enemy.hp - playerActionDef.damage);
        enemy.hitstun = playerActionDef.hitstun;
        enemy.flow = playerActionDef.knockdown ? "harddown" : "hit";
        events.push({
          frame,
          text: hitText("플레이어", playerActionDef, "상대")
        });
        if (playerActionDef.knockdown) {
          enemy.pose = "down";
          enemy.knockedDown = true;
          events.push({ frame, text: knockdownText("상대") });
        }
        winner = "player";
        playerRuntime.connected = true;
        resolved = true;
        continue;
      }

      if (!playerInv && enemyInv) {
        player.hp = Math.max(0, player.hp - enemyActionDef.damage);
        player.hitstun = enemyActionDef.hitstun;
        player.flow = enemyActionDef.knockdown ? "harddown" : "hit";
        events.push({
          frame,
          text: hitText("상대", enemyActionDef, "플레이어")
        });
        if (enemyActionDef.knockdown) {
          player.pose = "down";
          player.knockedDown = true;
          events.push({ frame, text: knockdownText("플레이어") });
        }
        winner = "enemy";
        enemyRuntime.connected = true;
        resolved = true;
        continue;
      }

      player.hp = Math.max(0, player.hp - enemyActionDef.damage);
      enemy.hp = Math.max(0, enemy.hp - playerActionDef.damage);
      events.push({ frame, text: "서로의 공격이 동시 히트" });
      winner = "draw";
      playerRuntime.connected = true;
      enemyRuntime.connected = true;
      resolved = true;
      continue;
    }

    if (playerCanHit) {
      if (doesGuardBeatAttack(playerActionDef, enemyActionDef) && enemyGuarding) {
        events.push({
          frame,
          text: guardText("플레이어", playerActionDef, "상대")
        });
        winner = "none";
        resolved = true;
        continue;
      }

      if (isInvincible(enemyActionDef, frame)) {
        events.push({ frame, text: "상대가 무적으로 공격을 회피" });
        winner = "none";
        resolved = true;
        continue;
      }

      enemy.hp = Math.max(0, enemy.hp - playerActionDef.damage);
      enemy.hitstun = playerActionDef.hitstun;
      enemy.flow = playerActionDef.knockdown ? "harddown" : "hit";
      events.push({
        frame,
        text: hitText("플레이어", playerActionDef, "상대")
      });
      if (playerActionDef.knockdown) {
        enemy.pose = "down";
        enemy.knockedDown = true;
        events.push({ frame, text: knockdownText("상대") });
      }
      winner = "player";
      playerRuntime.connected = true;
      resolved = true;
      continue;
    }

    if (enemyCanHit) {
      if (doesGuardBeatAttack(enemyActionDef, playerActionDef) && playerGuarding) {
        events.push({
          frame,
          text: guardText("상대", enemyActionDef, "플레이어")
        });
        winner = "none";
        resolved = true;
        continue;
      }

      if (isInvincible(playerActionDef, frame)) {
        events.push({ frame, text: "플레이어가 무적으로 공격을 회피" });
        winner = "none";
        resolved = true;
        continue;
      }

      player.hp = Math.max(0, player.hp - enemyActionDef.damage);
      player.hitstun = enemyActionDef.hitstun;
      player.flow = enemyActionDef.knockdown ? "harddown" : "hit";
      events.push({
        frame,
        text: hitText("상대", enemyActionDef, "플레이어")
      });
      if (enemyActionDef.knockdown) {
        player.pose = "down";
        player.knockedDown = true;
        events.push({ frame, text: knockdownText("플레이어") });
      }
      winner = "enemy";
      enemyRuntime.connected = true;
      resolved = true;
      continue;
    }
  }

  if (!playerRuntime.connected && playerActionDef.kind === "attack") {
    player.vulnerable =
      playerActionDef.id === "throw" || playerActionDef.id === "dp";
    events.push({
      frame: MAX_FRAME,
      text: whiffText("플레이어", playerActionDef)
    });
  }

  if (!enemyRuntime.connected && enemyActionDef.kind === "attack") {
    enemy.vulnerable =
      enemyActionDef.id === "throw" || enemyActionDef.id === "dp";
    events.push({
      frame: MAX_FRAME,
      text: whiffText("상대", enemyActionDef)
    });
  }

  if (winner === "none") {
    player.flow = player.knockedDown ? "harddown" : "neutral";
    enemy.flow = enemy.knockedDown ? "harddown" : "neutral";
  } else if (winner === "player") {
    player.flow = "pressure";
  } else if (winner === "enemy") {
    enemy.flow = "pressure";
  }

  return {
    player,
    enemy,
    events,
    winner
  };
}