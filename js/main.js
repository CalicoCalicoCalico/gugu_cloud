// ═══════════════════════════════════════════════════════
// main.js — 부팅 + 이벤트 연결 + 게임 루프 시작
//
// "이 게임 어디서 시작해?" → 맨 아래 DOMContentLoaded.
// ═══════════════════════════════════════════════════════

/**
 * 타이틀 "시작하기" → STATE 리셋 + 담배 DOM 정리 후 인트로 영상 씬으로.
 * (인트로 영상 씬은 시간이 지나면 자동으로 play 로 넘어간다)
 */
function onTitleStart() {
    resetGameState();
    clearCigaretteLayer(); // 이전 게임의 담배 DOM 정리 (재시작 안전)
    seedCigarettes(DATA.CONFIG.SPAWN.INITIAL_COUNT); // 맵에 시작 시 생성되어있는 담배 갯수
    switchScene("introVideo");
    startBgm(); // 사용자 클릭 시점 → 자동재생 정책 통과
}

window.addEventListener("DOMContentLoaded", () => {
    // 위생: 크기의 단일 출처 = DATA. CSS 변수로 주입 (tokens.css 의 복제 제거).
    const root = document.documentElement.style;

    const { VIEWPORT, MAP, PLAYER } = DATA.CONFIG;
    root.setProperty("--viewport-width", `${VIEWPORT.WIDTH}px`);
    root.setProperty("--viewport-height", `${VIEWPORT.HEIGHT}px`);
    root.setProperty("--ground-height", `${VIEWPORT.GROUND_HEIGHT}px`);
    root.setProperty("--player-width", `${PLAYER.BOX_W}px`);
    root.setProperty("--player-height", `${PLAYER.BOX_H}px`);

    // 맵(월드) 크기 + 배경 이미지 경로를 CSS 변수로 주입
    root.setProperty("--map-width", `${MAP.WIDTH}px`);
    root.setProperty("--map-height", `${MAP.HEIGHT}px`);
    root.setProperty("--map-sprite", `url("${MAP.SPRITE}")`);

    // 폐 이미지 경로·크기를 CSS 변수로 주입
    const { LUNG } = DATA.CONFIG;
    root.setProperty("--lung-sprite", `url("${LUNG.SPRITE}")`);
    root.setProperty("--lung-width", `${LUNG.WIDTH}px`);
    root.setProperty("--lung-height", `${LUNG.HEIGHT}px`);

    // ── 입력 리스너 등록 ──
    initInput();
    initSettings(); // 설정 팝업(esc) 초기화
    initAudio(); // BGM 준비 (Audio 객체 생성 + 초기 볼륨)

    // ── 버튼 연결 ──
    $("btn-game-start").addEventListener("click", onTitleStart);

    // 엔딩 "다시하기" → 타이틀로
    $("btn-restart").addEventListener("click", () => switchScene("title"));

    // dev 버튼: 담배를 한 개씩 수동 생성 (테스트용)
    // $("btn-dev-spawn").addEventListener("click", () => {
    //     if (STATE.currentScene !== "play") return;
    //     spawnOneCigarette();
    // });

    // ── 게임 루프 시작 (requestAnimationFrame) ──
    // 프레임 기반 이동(speed = 프레임당 px)이라 delta(경과시간) 안 씀.
    function frame() {
        tick();
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
});
