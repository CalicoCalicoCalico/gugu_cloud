// ═══════════════════════════════════════════════════════
// systems/movement.js — 이동 시스템
// 대응 TDD: 5단계 "이동 / movePlayer(dir)", 6단계 루프 2번.
//   읽음: input, player.x, DATA.PLAYER(w·speed)
//   씀:   player.x, player.facing
//   트랜잭션? 아니오 (x 와 facing 사이에 지켜야 할 관계 없음)
// ═══════════════════════════════════════════════════════

/**
 * STATE.input 의 좌/우에 따라 플레이어를 한 프레임 이동시킨다.
 * 0차는 좌우(x)만 — y 는 바닥 고정.
 * 부작용: player.x, player.facing.  실패 모드 없음.
 */
function movePlayer() {
    // 1. 입력 → 방향(dir) 결정. 둘 다/아무것도 아니면 0.
    let dir = 0;
    if (STATE.input.left) dir -= 1;
    if (STATE.input.right) dir += 1;
    if (dir === 0) return; // 움직임 없음

    // 2. x 갱신 후 무대 경계로 clamp [0, fieldW - playerW]
    const maxX = DATA.FIELD.width - DATA.PLAYER.w;
    STATE.player.x = clamp(
        STATE.player.x + dir * DATA.PLAYER.speed,
        0,
        maxX,
    );

    // 3. 바라보는 방향 갱신 (한 프레임 어긋나도 손상 없음 → 비트랜잭션)
    STATE.player.facing = dir < 0 ? "left" : "right";
}
