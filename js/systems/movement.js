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
    // 1. 입력 → 방향(dir). 둘 다거나 아무것도 아니면 0 (안 움직임).
    let dir = 0;
    if (STATE.input.left) dir -= 1;
    if (STATE.input.right) dir += 1;
    if (dir === 0) return;

    // 2. x 갱신 후 무대 경계로 가둔다 [0, 무대너비 − 플레이어너비]
    const { WIDTH } = DATA.CONFIG.FIELD;
    const { BOX_W, SPEED } = DATA.CONFIG.PLAYER;
    const maxX = WIDTH - BOX_W;
    STATE.player.x = clamp(STATE.player.x + dir * SPEED, 0, maxX);

    // 3. 바라보는 방향 갱신
    STATE.player.looking = dir < 0 ? "left" : "right";
}
