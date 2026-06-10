// ═══════════════════════════════════════════════════════
// systems/judge.js — 판정 시스템
//
// 폐 게이지가 최대치에 도달하면 엔딩 영상 씬으로 넘어간다.
//   play → (게이지 가득) → endingVideo → (자동) → end
// ═══════════════════════════════════════════════════════

/**
 * 게임 종료 조건 검사. (루프 5번)
 * 폐 게이지가 최대치 이상이면 엔딩 영상 씬으로 전환한다.
 */
function checkEnding() {
    if (STATE.playerLungGauge >= DATA.CONFIG.LUNG_GAUGE_MAX) {
        switchScene("endingVideo");
    }
}
