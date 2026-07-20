// ═══════════════════════════════════════════════════════
// audio.js — BGM(배경음악) 담당
//
// BGM Audio 객체 하나를 소유하고, 재생/볼륨을 관리한다.
// 설정 팝업의 슬라이더가 setBgmVolume() 을 호출해 볼륨을 바꾼다.
// ═══════════════════════════════════════════════════════

let bgm = null;
let ambience = null; // ← 추가: 환경음 Audio (고정 볼륨, 슬라이더 영향 없음)
let gameOverBgm = null; // 게임오버 씬 전용 BGM (mainBGM 과 별도 Audio 객체)

/** 초기화 — main.js 부팅 때 한 번 호출. */
function initAudio() {
    bgm = new Audio(DATA.CONFIG.AUDIO.BGM);
    bgm.loop = true;
    bgm.volume = DATA.CONFIG.AUDIO.BGM_VOLUME;

    // 환경음: 똑같이 루프. 단, 볼륨은 DATA 고정값으로만 정한다.
    // setBgmVolume() 는 bgm 만 건드리므로 슬라이더로는 절대 안 바뀐다.
    ambience = new Audio(DATA.CONFIG.AUDIO.AMBIENCE);
    ambience.loop = true;
    ambience.volume = DATA.CONFIG.AUDIO.AMBIENCE_VOLUME;

    // 게임오버 BGM: 루프. 볼륨은 DATA 고정값(설정 슬라이더 영향 없음 — bgm 만 슬라이더가 조절).
    gameOverBgm = new Audio(DATA.CONFIG.AUDIO.GAME_OVER_BGM);
    gameOverBgm.loop = true;
    gameOverBgm.volume = DATA.CONFIG.AUDIO.GAME_OVER_BGM_VOLUME;
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

/** 환경음 재생 시작. (play 씬 진입 시) */
function startAmbience() {
    if (!ambience) return;
    ambience.play().catch(() => {}); // 자동재생 막히면 조용히 무시
}

/** 환경음 일시정지. (엔딩 영상 등에서 끌 때) */
function pauseAmbience() {
    if (!ambience) return;
    ambience.pause();
}

/** 게임오버 BGM 재생 시작. (gameOver 씬 진입 시 호출) */
function startGameOverBgm() {
    if (!gameOverBgm) return;
    gameOverBgm.currentTime = 0; // 매번 처음부터 (재도전 시 자연스럽게 재시작)
    gameOverBgm.play().catch(() => {}); // 자동재생 막히면 조용히 무시
}

/** 게임오버 BGM 일시정지. (gameOver 씬을 떠날 때 호출) */
function pauseGameOverBgm() {
    if (!gameOverBgm) return;
    gameOverBgm.pause();
}
// ═══════════════════════════════════════════════════════
// 효과음(SFX)
//
// BGM 과 달리 효과음은 "겹쳐서 여러 번" 울릴 수 있어야 한다(연속 발소리 등).
// 그래서 원본 Audio 를 cloneNode() 로 복제해서 매번 새로 재생한다.
//
// ⚠ 지금은 mp3 파일이 없어서 DATA.CONFIG.AUDIO.SFX 경로가 다 비어("") 있다.
//    경로가 비어 있으면 playSfx 는 조용히 아무것도 안 한다(에러 안 남).
//    → 시스템 파일들의 // playSfx 주석은 미리 깔아둔 것. mp3 넣고 주석 해제만 하면 켜진다.
// ═══════════════════════════════════════════════════════
const _sfxCache = {}; // src(파일 경로) → 원본 Audio (재생 땐 복제)

/** {src, volume} 설정 객체를 직접 재생한다. (내부 공용) */
function _playSfxConfig(cfg, volumeOverride) {
    if (!cfg || !cfg.src) return; // 미설정(아직 mp3 없음) → 무시
    if (!_sfxCache[cfg.src]) _sfxCache[cfg.src] = new Audio(cfg.src);
    const sound = _sfxCache[cfg.src].cloneNode(); // 겹쳐 울리게 복제
    sound.volume = clamp(volumeOverride ?? cfg.volume ?? 1, 0, 1);
    sound.play().catch(() => {});
}

/** SFX 키로 재생 (단발 + 박자 공용). */
function playSfx(key, volumeOverride) {
    _playSfxConfig(DATA.CONFIG.AUDIO.SFX[key], volumeOverride);
}

/** 인간 발 종류별 발소리. type 에 맞는 HUMAN_TYPES[type].sound 를 재생. */
function playHumanWalkSfx(type) {
    const t = DATA.HUMAN_TYPES[type];
    _playSfxConfig(t && t.sound);
}
/**
 * 걷기/대시처럼 "특정 프레임에서 박자 맞춰" 울리는 효과음 전용.
 * data.js 의 frames(어느 프레임) + everyNCycles(몇 바퀴에 한 번) 를 읽어 판정한다.
 * → 박자 조절은 코드 안 건드리고 data.js 숫자만 바꾸면 됨.
 * @param {string} key         "walkStep" | "dash"
 * @param {number} animFrame   지금 클립의 프레임 인덱스
 * @param {number} cycleCount  클립이 몇 바퀴 돌았는지 (anim.js 가 셈)
 */
function playStepSfx(key, animFrame, cycleCount) {
    const cfg = DATA.CONFIG.AUDIO.SFX[key];
    if (!cfg || !cfg.src) return; // 미설정 → 무시
    if (!cfg.frames || !cfg.frames.includes(animFrame)) return; // 지정 프레임 아님
    if (cycleCount % (cfg.everyNCycles || 1) !== 0) return; // N바퀴에 한 번
    playSfx(key);
}
