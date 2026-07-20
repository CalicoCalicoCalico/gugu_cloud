// ═══════════════════════════════════════════════════════
// systems/movement.js — 이동 시스템
//
//   읽음: STATE.input, STATE.player.x, DATA.CONFIG.PLAYER(BOX_W·SPEED), FIELD.WIDTH
//   씀:   STATE.player.x, STATE.player.looking
// ═══════════════════════════════════════════════════════

/**
 * STATE.input 의 좌/우에 따라 플레이어를 한 프레임 이동시킨다.
 * 좌우(x)만 다룬다 — y 는 바닥 고정.
 */
function movePlayer() {
    const p = STATE.player;

    // 이동 가능 상태: idle 과 smokeFire(불붙음). 줍기/피우기/스턴은 이동 잠금.
    // squashed 도 이동 가능 (밟힌 이미지 유지한 채 걸어다니며 담배 주울 수 있음)
    const canMove =
        p.playerStatus === "idle" ||
        p.playerStatus === "smokeFire" ||
        p.playerStatus === "squashed";

    if (!canMove) {
        p.walk(0); // 멈춤(isMoving=false → 걷기 애니 해제)
        return;
    }

    // 입력 → 방향(dir). 둘 다거나 아무것도 아니면 0.
    let dir = 0;
    if (STATE.input.left) dir -= 1;
    if (STATE.input.right) dir += 1;

    // 이동 전 위치 기억 → 벽(ground 발)에 부딪히면 되돌린다
    const oldX = p.x;
    p.walk(dir);

    // ground 상태의 발과 겹치면 그 방향으로는 못 지나감 (이동 취소)
    if (typeof isBlockedByFoot === "function" && isBlockedByFoot(p.getBox())) {
        p.x = oldX;
    }
}
