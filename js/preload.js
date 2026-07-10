// ═══════════════════════════════════════════════════════
// preload.js — 이미지 프리로드
//
// 타이틀 화면이 떠 있는 동안(할 일 없는 시간), 게임에서 쓰일 모든 이미지를
// 미리 브라우저 캐시에 태워둔다. 이렇게 하면 play 씬으로 넘어갔을 때
// 처음 보는 이미지(플레이어 애니, 담배, 발 등)가 느리게 뜨는 문제가 없어진다.
//
// 방법: new Image() 로 각 경로를 만들어주기만 하면, onload 결과를 안 써도
//   브라우저가 알아서 다운로드해서 캐시에 저장한다. (실제 화면엔 안 붙임)
// ═══════════════════════════════════════════════════════

/**
 * DATA 전체를 훑어서, 게임에서 쓰이는 모든 이미지 경로를 모은다.
 * @returns {string[]} 중복 제거된 이미지 경로 목록
 */
function collectAllImagePaths() {
    const paths = new Set();
    const { CONFIG, CIGARETTE_TYPES, HUMAN_TYPES } = DATA;

    // ── 정적 단일 이미지들 ──
    paths.add(CONFIG.PLAYER.SPRITE);
    paths.add(CONFIG.MAP.SPRITE);
    paths.add(CONFIG.LUNG.SPRITE);

    // ── 플레이어 애니메이션 프레임들 (CLIPS + SMOKE_CLIPS) ──
    const dir = CONFIG.ANIM.DIR;
    const addClipFrames = (clip) => {
        for (const frame of clip) {
            paths.add(dir + frame.img); // 기본(default) 버전
            paths.add(dir + frame.img.replace("99_default", "99_round")); // 뚱띠(round) 버전
        }
    };
    for (const key in CONFIG.ANIM.CLIPS) addClipFrames(CONFIG.ANIM.CLIPS[key]);
    for (const key in CONFIG.ANIM.SMOKE_CLIPS)
        addClipFrames(CONFIG.ANIM.SMOKE_CLIPS[key]);

    // ── 담배 종류별 이미지 ──
    for (const key in CIGARETTE_TYPES) paths.add(CIGARETTE_TYPES[key].sprite);

    // ── 인간 발 종류별 이미지 (R/L × down/ground/up) ──
    for (const key in HUMAN_TYPES) {
        const { sprites } = HUMAN_TYPES[key];
        for (const side of ["R", "L"]) {
            for (const phase of ["down", "ground", "up"]) {
                paths.add(sprites[side][phase]);
            }
        }
    }

    return [...paths];
}

/**
 * 모아둔 모든 이미지 경로를 실제로 미리 불러온다(캐시에 태움).
 * main.js 의 DOMContentLoaded 에서, 타이틀 화면이 뜨자마자 1번 호출한다.
 */
function preloadAllImages() {
    const paths = collectAllImagePaths();
    for (const path of paths) {
        const img = new Image();
        img.src = path; // 화면에 붙이지 않아도 요청은 나가고 캐시에 저장됨
    }
    console.log(`[preload] ${paths.length}개 이미지 프리로드 시작`); // 확인용 로그
}
