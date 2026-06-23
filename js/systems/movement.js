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

    // 줍기/피우기/스턴 중엔 이동 잠금 (애니가 끊기지 않도록) — 대기일 때만 움직인다
    if (p.playerStatus !== "idle") {
        p.walk(0); // 멈춤(isMoving=false → 걷기 애니 해제)
        return;
    }

    // 입력 → 방향(dir). 둘 다거나 아무것도 아니면 0.
    let dir = 0;
    if (STATE.input.left) dir -= 1;
    if (STATE.input.right) dir += 1;

    p.walk(dir);
}
