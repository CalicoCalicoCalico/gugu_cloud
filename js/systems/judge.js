// ═══════════════════════════════════════════════════════
// systems/judge.js — 판정 시스템
//
// 폐 게이지가 최대치에 도달하면 엔딩 영상 씬으로 넘어간다.
//   play → (게이지 가득) → endingVideo → (자동) → end
// ═══════════════════════════════════════════════════════

/*
 * 게임 종료 조건 검사. (루프 5번)
 * 폐 게이지가 최대치 이상이면 → 바로 엔딩 영상으로 가지 않고,
 * '비둘기 떠오르기 연출'을 시작한다. (연출이 끝나면 엔딩 영상으로 넘어감)
 */
function checkEnding() {
    if (STATE.ending.active) return; // 이미 연출 중이면 중복 시작 방지
    if (STATE.playerLungGauge >= DATA.CONFIG.LUNG_GAUGE_MAX) {
        startEndingSequence();
    }
}

/**
 * 엔딩 연출 시작: 게임플레이를 멈추고(loop 가 ending 분기로 감) 대기 단계로 들어간다.
 */
function startEndingSequence() {
    STATE.ending.active = true;
    STATE.ending.phase = "before";
    STATE.ending.phaseStartMs = performance.now(); // 실제 시각 기준 타이머
    STATE.ending.risen = false;

    // 비둘기를 멈춰 idle 모습으로 (걷기/줍기 애니 끊고 깔끔하게 떠오르도록)
    STATE.player.playerStatus = "idle";
    STATE.player.isMoving = false;

    // 게이지 가득 → BGM/환경음 멈춤 (떠오르기 연출은 조용히, 이후 엔딩 영상으로)
    pauseBgm();

    // pauseAmbience();
}

/**
 * 엔딩 연출 진행 (loop 의 ending 분기에서 매 프레임 호출).
 *   before 단계: HOLD_BEFORE_MS 동안 멈춰 대기 → 떠오르기 시작
 *   after  단계: 떠오른 뒤 HOLD_AFTER_MS 동안 유지 → 엔딩 영상으로
 */
function updateEnding() {
    const E = DATA.CONFIG.ENDING;
    const now = performance.now();
    const elapsed = now - STATE.ending.phaseStartMs;

    if (STATE.ending.phase === "before") {
        // (1) 대기 시간이 끝나면 → 떠오르기 시작
        if (elapsed >= E.HOLD_BEFORE_MS) {
            STATE.ending.risen = true; // render 가 위로 RISE_OFFSET_PX 만큼 올림 (CSS 로 부드럽게)
            STATE.ending.phase = "after";
            STATE.ending.phaseStartMs = now;
        }
    } else {
        // (3) 떠오른 채 유지 시간이 끝나면 → 엔딩 영상으로
        if (elapsed >= E.HOLD_AFTER_MS) {
            STATE.ending.active = false; // 연출 종료
            switchScene("endingVideo");
        }
    }
}
