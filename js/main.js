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
    clearHumanLayer(); // (이전 게임의 발 DOM 정리)
    seedCigarettes(DATA.CONFIG.SPAWN.INITIAL_COUNT); // 맵에 시작 시 생성되어있는 담배 갯수
    switchScene("introVideo");
}

/**
 * 타이틀 "시작하기" → STATE 리셋 + 담배 DOM 정리 후 인트로 영상 씬으로.
 * (인트로 영상 씬은 시간이 지나면 자동으로 play 로 넘어간다)
 */
function onPlayReStart() {
    resetGameState();
    clearCigaretteLayer(); // 이전 게임의 담배 DOM 정리 (재시작 안전)
    clearHumanLayer(); // (이전 게임의 발 DOM 정리)
    seedCigarettes(DATA.CONFIG.SPAWN.INITIAL_COUNT); // 맵에 시작 시 생성되어있는 담배 갯수
    switchScene("play");
    startBgm(); // 사용자 클릭 시점 → 자동재생 정책 통과
    startAmbience();
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

    // ⚠ dev: play 중 'h' 키 → 인간 발 1명 생성 (테스트용. 정식 스포너 생기면 제거)
    window.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "h" && STATE.currentScene === "play") {
            spawnOneHuman();
        }
    });

    // ── 버튼 연결 ──
    $("btn-game-start").addEventListener("click", onTitleStart);

    // 엔딩 "다시하기" → 타이틀로
    $("btn-restart").addEventListener("click", () => switchScene("title"));

    // 인트로 건너뛰기: 현재 영상 씬의 done() 을 호출 → 안전하게 다음 씬으로
    $("btn-skip-intro").addEventListener("click", () => {
        if (_skipSceneVideo) _skipSceneVideo();
    });

    // dev 버튼: 담배를 한 개씩 수동 생성 (테스트용)
    // $("btn-dev-spawn").addEventListener("click", () => {
    //     if (STATE.currentScene !== "play") return;
    //     spawnOneCigarette();
    // });

    // ── 게임 루프 시작 (고정 타임스텝 / fixed timestep) ──
    // ⚠ 모니터 주사율(refresh rate)이 컴퓨터마다 달라서(60Hz / 144Hz 등)
    //    그냥 매 프레임 tick() 하면 144Hz 화면에서 게임이 2.4배 빨라진다.
    //    → 화면이 몇 번 갱신되든 "1초에 정확히 60번"만 tick() 하도록 고정한다.
    //    이렇게 하면 기존의 '프레임 단위' 속도/타이머 값을 하나도 안 바꿔도 된다.

    // const FIXED_DT = 1000 / 60; // 한 논리 스텝의 길이(ms). 60fps 기준 = 약 16.67ms
    const FIXED_DT = 1000 / 115; // 한 논리 스텝의 길이(ms). 60fps 기준 = 약 16.67ms

    let _lastTime = performance.now(); // 직전 프레임 시각
    let _accumulator = 0; // 아직 처리 못한 누적 시간(ms)

    function frame(now) {
        // 1) 이번 콜백까지 실제로 흐른 시간(ms)
        let elapsed = now - _lastTime;
        _lastTime = now;

        // 2) 탭을 한참 비활성화했다 돌아오는 등 큰 점프 방지(과도한 따라잡기 차단)
        if (elapsed > 250) elapsed = 250;

        // 3) 흐른 시간을 쌓아두고, 16.67ms가 모일 때마다 tick() 한 번씩 소비
        //    144Hz면 콜백 여러 번에 한 번꼴로 tick, 느린 프레임이면 한 번에 여러 tick.
        //    → 결과적으로 어떤 화면에서도 평균 초당 60틱으로 수렴.
        _accumulator += elapsed;
        while (_accumulator >= FIXED_DT) {
            tick();
            _accumulator -= FIXED_DT;
        }

        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame); // 첫 호출 (now 인자는 브라우저가 자동으로 넣어줌)
});
