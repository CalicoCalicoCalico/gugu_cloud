// ═══════════════════════════════════════════════════════
// systems/camera.js — 카메라(스크롤) 시스템
//
// 뷰포트가 맵(월드)의 어디를 보고 있는지(STATE.camera.x)를 매 프레임 갱신한다.
// 방식: 데드존(edge-scroll). 플레이어가 화면 가운데 영역(데드존) 안에 있으면
//        카메라는 안 움직이고, 좌/우 끝(EDGE_MARGIN)에 닿으면 그만큼 따라 민다.
//
//   읽음: STATE.player.x, STATE.camera.x, DATA.CONFIG(VIEWPORT·MAP·CAMERA·PLAYER)
//   씀:   STATE.camera.x
// ═══════════════════════════════════════════════════════

/**
 * 플레이어 위치에 따라 카메라(스크롤 위치)를 갱신한다. (루프 6번)
 * 데드존 밖으로 나가려 하면 그만큼 카메라를 밀고, 맵 밖이 안 보이게 가둔다.
 */
function updateCamera() {
    const { VIEWPORT, MAP, CAMERA } = DATA.CONFIG;
    const { BOX_W } = DATA.CONFIG.PLAYER;

    // 플레이어의 화면상 x (= 월드 x − 카메라 x)
    const playerScreenX = STATE.player.x - STATE.camera.x;

    // 데드존 좌/우 경계 (이 사이에 있으면 카메라 안 움직임)
    const leftBound = CAMERA.EDGE_MARGIN;
    const rightBound = VIEWPORT.WIDTH - CAMERA.EDGE_MARGIN - BOX_W;

    // 데드존을 벗어나면, 플레이어가 경계에 딱 붙도록 카메라를 민다
    if (playerScreenX < leftBound) {
        STATE.camera.x = STATE.player.x - leftBound;
    } else if (playerScreenX > rightBound) {
        STATE.camera.x = STATE.player.x - rightBound;
    }

    // 맵 밖(검은 여백)이 안 보이게 카메라를 맵 안으로 가둔다 (당신이 짚은 버그 #1)
    const maxCameraX = MAP.WIDTH - VIEWPORT.WIDTH;
    STATE.camera.x = clamp(STATE.camera.x, 0, maxCameraX);
}
