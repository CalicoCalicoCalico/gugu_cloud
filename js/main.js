// ═══════════════════════════════════════════════════════
// main.js — 부팅 + 이벤트 연결 + 게임 루프 시작
// 대응 TDD: 전체를 엮는 진입점. (엽전인생 game.js 의 DOMContentLoaded 패턴)
//
// "이 게임 어디서 시작해?" → 맨 아래 DOMContentLoaded.
// ═══════════════════════════════════════════════════════

/**
 * 타이틀 "시작하기" → STATE 리셋 후 play 씬 진입.
 * ⚠ 이 흐름(startGame)은 TDD 9단계에서 ❌(타이틀 흐름 미추출)로 표시된 부분.
 *   0차 동작을 위해 최소 구현했다. 정식 설계 시 1단계 흐름 추출 필요.
 */
function onTitleStart() {
    resetGameState();
    switchScene("play");
}

window.addEventListener("DOMContentLoaded", () => {
    // ── 입력 리스너 등록 ──
    initInput();

    // ── 버튼 연결 ──
    $("btn-game-start").addEventListener("click", onTitleStart);

    // ⚠ dev 폴백: spawnCigarette() 의 생성 규칙(간격·분포·재생성)이
    //   1차 BLOCKING 미해결이라, 버튼으로 담배를 한 개씩 수동 생성한다.
    //   (TDD 명시: "0차만이면 dev 버튼이 한 번 직접 생성")
    $("btn-dev-spawn").addEventListener("click", () => {
        if (STATE.scene !== "play") return;
        devSpawnCigarette();
    });

    // ── 게임 루프 시작 (requestAnimationFrame) ──
    // 0차는 프레임 기반 이동(speed = 프레임당 px)이라 delta 안 씀.
    function frame() {
        tick();
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
});
