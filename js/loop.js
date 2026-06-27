// ═══════════════════════════════════════════════════════
// loop.js — 씬 전환 + 게임 루프
//
// "지금 어느 씬인가(STATE.currentScene)" 가 매 프레임 무엇이 도는지를 정한다.
//
// 씬 흐름 (개발문서): title → introVideo → play → endingVideo → end
//   - introVideo / endingVideo : 이미지 한 장을 보여주고 시간이 지나면 자동 전환
//   - play                     : 실제 게임 루프
//   - title / end              : 정적 화면 (버튼 클릭이 전환을 담당)
// ═══════════════════════════════════════════════════════

// ─────────────────────────────────────────
// 씬 전환
// ─────────────────────────────────────────

/**
 * 씬을 전환한다. .active 클래스를 토글하고 STATE.currentScene 을 갱신한다.
 * 씬에 머문 시간(framesInCurrentScene)도 0 으로 리셋한다.
 * @param {("title"|"introVideo"|"play"|"endingVideo"|"end")} name
 */
function switchScene(name) {
    document
        .querySelectorAll(".scene")
        .forEach((el) => el.classList.remove("active"));
    $(`scene-${name}`).classList.add("active");

    STATE.currentScene = name;
    STATE.framesInCurrentScene = 0; // 새 씬에 막 들어왔으니 0 부터 센다

    // ── 영상 씬이면 재생 시작 (fallbackMs = 영상이 안 끝날 때 강제 전환 시간) ──
    if (name === "introVideo"){
        playSceneVideo($("intro-video"), "play", 20000);
    } 
    if (name === "endingVideo"){
        pauseBgm();
        playSceneVideo($("ending-video"), "end", 35000);
    } 
    if (name === "play") {
        startBgm();
    }
}

// 현재 재생 중인 영상 씬의 "건너뛰기" 함수를 여기 담아둔다.
// 건너뛰기 버튼(main.js)이 이걸 호출한다. 영상 씬이 아니면 null.
let _skipSceneVideo = null;

/**
 * 영상 씬용: 영상을 0초부터 재생하고, 끝나면 다음 씬으로 넘긴다.
 * 전환을 일으키는 길은 4가지 — (1)영상 정상 종료 (2)건너뛰기 버튼
 * (3)안전 타이머 만료 (4)로드/디코드 실패. 어느 쪽이 먼저 와도
 * done() 이 단 한 번만 실행되도록 막는다(이중 전환 방지).
 *
 * 영상이 없거나 멈춰서 onended/onerror 가 영영 안 올 때:
 *   → poster 이미지가 화면에 남아 있고, fallbackMs 후 안전 타이머가 넘긴다.
 *
 * @param {HTMLVideoElement} videoEl
 * @param {string} nextScene 끝나면 갈 씬
 * @param {number} fallbackMs 영상이 끝나지 않을 때 강제로 넘길 최대 시간(ms)
 */
function playSceneVideo(videoEl, nextScene, fallbackMs) {
    if (!videoEl) {
        switchScene(nextScene);
        return;
    } // 안전장치

    let finished = false; // 이미 넘어갔는지 (이중 전환 차단)
    let safetyTimer = null; // 안전 타이머 id

    function done() {
        if (finished) return; // 두 번째 호출부턴 무시
        finished = true;
        clearTimeout(safetyTimer); // 남은 타이머 해제
        videoEl.onended = null; // 리스너 정리
        videoEl.onerror = null;
        videoEl.pause(); // 영상 음향 멈춤 (다음 씬으로 새어나가지 않게)
        _skipSceneVideo = null; // 건너뛰기 핸들 비우기
        switchScene(nextScene); // 진짜 전환은 여기 한 곳에서만
    }

    _skipSceneVideo = done; // 건너뛰기 버튼이 부를 수 있게 노출
    safetyTimer = setTimeout(done, fallbackMs); // (3) 멈춰도 결국 넘어가게

    videoEl.onended = done; // (1) 정상 종료
    videoEl.onerror = () => {}; // (4) 실패: 즉시 안 넘김 → poster 보이고 타이머가 넘김

    videoEl.currentTime = 0; // 재시작 대비 처음으로
    videoEl.play().catch(() => {}); // 자동재생 막혀도 poster 보이고 타이머가 넘김
}

// ─────────────────────────────────────────
// 게임 루프 (매 프레임 1회)
// ─────────────────────────────────────────

/**
 * 시간이 지나면 자동으로 다음 씬으로 넘어가는 "영상(이미지) 씬" 처리.
 * @param {number} durationFrames 머물 프레임 수 (DATA.CONFIG.SCENE.*)
 * @param {string} nextScene 시간이 다 되면 갈 씬
 */
function advanceTimedScene(durationFrames, nextScene) {
    STATE.framesInCurrentScene += 1;
    if (STATE.framesInCurrentScene >= durationFrames) {
        switchScene(nextScene);
    }
}

/**
 * 매 프레임 1회 호출. 현재 씬에 맞는 시스템들을 정해진 순서로 돌린다.
 */
function tick() {
    const { SCENE } = DATA.CONFIG;

    switch (STATE.currentScene) {
        case "introVideo":
            // 전환은 video.onended 가 담당(switchScene 에서 등록). 루프는 할 일 없음.
            break;

        case "play":
            // 설정 팝업이 열려 있으면(일시정지) 시뮬레이션을 멈춘다
            if (STATE.paused) break;

            // ── play 루프 순서 ──
            // 1. 입력 수집
            handleInput();
            // 2. 이동
            movePlayer();
            // 3. 담배 생성
            spawnCigarette();
            // 4. 담배 갱신 (낙하 + 공중 담배 데미지, air→ground 전환)
            updateCigarettes();

            // 4-1. 인간 발 자동 생성 (간격은 DATA.HUMAN.SPAWN_INTERVAL)
            spawnHuman();
            // 4-2. 인간 발 갱신 (낙하 + 데미지/스턴 + 벽, 맵 밖 제거)
            updateHumans();

            // 5. 상호작용(줍기) — 내부에서 충돌 판정 (ground 담배만 주움)
            smoke();

            // 6. 종료 판정
            checkEnding();
            // 7. 애니 갱신 (상태 전환 타이머 + 프레임 진행)
            updateAnim();
            // 8. 카메라 갱신 (플레이어 최종 위치 기준으로 스크롤 결정)
            updateCamera();
            // 9. 렌더 (맨 끝, 읽기 전용)
            render();
            break;

        case "endingVideo":
            // 전환은 video.onended 가 담당. 루프는 할 일 없음.
            break;

        case "title":
        case "end":
        default:
            // 정적 화면 — 루프에서 할 일 없음 (버튼 클릭이 전환을 담당)
            break;
    }
}
