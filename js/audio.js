// ═══════════════════════════════════════════════════════
// audio.js — BGM(배경음악) 담당
//
// BGM Audio 객체 하나를 소유하고, 재생/볼륨을 관리한다.
// 설정 팝업의 슬라이더가 setBgmVolume() 을 호출해 볼륨을 바꾼다.
// ═══════════════════════════════════════════════════════

let bgm = null; // BGM Audio 인스턴스 (initAudio 에서 생성)

/** 초기화 — main.js 부팅 때 한 번 호출. Audio 객체 생성 + 초기 볼륨. */
function initAudio() {
    bgm = new Audio(DATA.CONFIG.AUDIO.BGM);
    bgm.loop = true; // 끝나면 다시 재생 (배경음악이니까)
    bgm.volume = DATA.CONFIG.AUDIO.BGM_VOLUME; // 초기 볼륨 (슬라이더와 같은 값)
}

/** BGM 재생 시작. 브라우저 자동재생 정책상 '사용자 클릭' 시점에 불러야 한다. */
function startBgm() {
    if (!bgm) return;
    bgm.play().catch(() => {}); // 자동재생이 막히면 조용히 무시
}

/** BGM 일시정지 (영상 씬 동안 겹치지 않게) */
function pauseBgm() {
    if (!bgm) return;
    bgm.pause();
}

/** 볼륨 설정 (0~1 로 가둠). 슬라이더 input 이 호출. */
function setBgmVolume(volume) {
    if (!bgm) return;
    bgm.volume = clamp(volume, 0, 1); // helpers.js 의 clamp
}
