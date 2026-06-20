// ═══════════════════════════════════════════════════════
// settings.js — 설정 팝업 (esc 로 열고 닫기 + 다시 시작)
//
// 설정 팝업은 '씬'이 아니라 play 화면 위에 뜨는 '오버레이'다.
// esc 를 누르면 토글되고, 열려 있는 동안 게임은 멈춘다(STATE.paused).
// ═══════════════════════════════════════════════════════

/** 팝업을 연다: 오버레이 보이기 + 게임 일시정지 */
function openSettings() {
    $("settings-overlay").classList.remove("hidden");
    STATE.paused = true; // 루프가 play 시뮬레이션을 건너뛰게 함
}

/** 팝업을 닫는다: 오버레이 숨기기 + 게임 재개 */
function closeSettings() {
    $("settings-overlay").classList.add("hidden");
    STATE.paused = false;
}

/** 열려 있으면 닫고, 닫혀 있으면 연다 */
function toggleSettings() {
    if (STATE.paused) closeSettings();
    else openSettings();
}

/** 초기화 — main.js 부팅 때 한 번 호출 */
function initSettings() {
    // esc 키
    window.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() !== "escape") return;
        // 열려 있으면 어느 씬에서든 닫는다 (타이틀에서 연 팝업도 esc 로 닫힘)
        if (STATE.paused) {
            closeSettings();
            return;
        }
        // 열 때는 play 중에만 (타이틀에선 '설정' 버튼으로 연다)
        if (STATE.currentScene !== "play") return;
        openSettings();
    });

    // '다시 시작' 버튼: 팝업 닫고 타이틀로. (시작하기 누르면 resetGameState 로 전부 초기화)
    $("btn-settings-restart").addEventListener("click", () => {
        closeSettings(); // 일시정지 해제
        switchScene("title"); // 타이틀 화면으로 복귀
    });

    // 타이틀의 '설정' 버튼: 클릭하면 같은 팝업을 연다
    $("btn-game-setting").addEventListener("click", openSettings);

    // BGM 볼륨 슬라이더: 움직일 때마다 볼륨 반영
    const volumeSlider = $("bgm-volume");
    volumeSlider.value = DATA.CONFIG.AUDIO.BGM_VOLUME; // 초기값은 DATA 에 써있음
    volumeSlider.addEventListener("input", (e) => {
        setBgmVolume(parseFloat(e.target.value));
    });
}
