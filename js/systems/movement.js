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
    // 입력 → 방향(dir). 둘 다거나 아무것도 아니면 0.
    let dir = 0;
    if (STATE.input.left) dir -= 1;
    if (STATE.input.right) dir += 1;

    // 실제 이동·경계 가두기·방향 갱신은 플레이어가 스스로 한다.
    STATE.player.walk(dir);
}
