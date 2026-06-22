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
    const initialVolume = DATA.CONFIG.AUDIO.BGM_VOLUME; // 초기값은 DATA 에 써있음
    volumeSlider.value = initialVolume; 

    // 초기 켜졌을 때도 갈색/흰색 게이지 비율을 맞춰주는 밑작업
    const initPercentage = initialVolume * 100;
    volumeSlider.style.background = `linear-gradient(to right, #c69c6d 0%, #c69c6d ${initPercentage}%, #ffffff ${initPercentage}%, #ffffff 100%)`;

    // 이전 슬라이더 값을 기억할 변수
    let lastValue = parseFloat(volumeSlider.value);

    // 슬라이더를 움직일 때 실시간 처리
    volumeSlider.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        setBgmVolume(value); // 기존 볼륨 반영 로직

        // ① 실시간 게이지 색상 나누기 (왼쪽 갈색, 오른쪽 흰색)
        const percentage = value * 100;
        volumeSlider.style.background = `linear-gradient(to right, #c69c6d 0%, #c69c6d ${percentage}%, #ffffff ${percentage}%, #ffffff 100%)`;

        // ② 이전 값과 현재 값을 비교하여 불꽃 방향 결정
        if (value > lastValue) {
            // 값이 커졌다 = 오른쪽으로 이동 중! -> 불꽃은 왼쪽으로 (.move-right)
            volumeSlider.classList.add("move-right");
            volumeSlider.classList.remove("move-left");
        } else if (value < lastValue) {
            // 값이 작아졌다 = 왼쪽으로 이동 중! -> 불꽃은 오른쪽으로 (.move-left)
            volumeSlider.classList.add("move-left");
            volumeSlider.classList.remove("move-right");
        }

        // 현재 값을 다음 비교를 위해 저장!
        lastValue = value;
    });
    const resetFlame = () => {
        volumeSlider.classList.remove("move-left", "move-right");
        lastX = 0;
    };
    volumeSlider.addEventListener("mouseup", resetFlame);
    volumeSlider.addEventListener("mouseleave", resetFlame);
    volumeSlider.addEventListener("touchend", resetFlame);
}
