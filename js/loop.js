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
            advanceTimedScene(SCENE.INTRO_FRAMES, "play");
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
            // 4. 상호작용(줍기) — 내부에서 충돌 판정
            smoke();
            // 5. 종료 판정
            checkEnding();
            // 6. 애니 갱신 (상태 전환 타이머 + 프레임 진행)
            updateAnim();
            // 7. 카메라 갱신 (플레이어 최종 위치 기준으로 스크롤 결정)
            updateCamera();
            // 8. 렌더 (맨 끝, 읽기 전용)
            render();
            break;

        case "endingVideo":
            advanceTimedScene(SCENE.ENDING_FRAMES, "end");
            break;

        case "title":
        case "end":
        default:
            // 정적 화면 — 루프에서 할 일 없음 (버튼 클릭이 전환을 담당)
            break;
    }
}
