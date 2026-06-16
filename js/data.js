// ═══════════════════════════════════════════════════════
// data.js — 게임의 정적 데이터 (Static Data)
//
// 게임 시작부터 끝까지 변하지 않는 값들이 여기 들어간다.
//   예: 무대 크기, 플레이어 속도, 담배 종류·점수, 키 설정...
//
// 반대로, 게임 중에 바뀌는 값(플레이어 위치, 폐 게이지 등)은
// state.js 에 들어간다.
//
// 규칙: data 는 읽기만, state 는 읽기/쓰기. (이렇게 분리해야 관리가 쉬움)
//
// 네이밍 규칙 (업계 통용):
//   - CONFIG 안의 "고정 설정값"   → ALL_CAPS  (예: SPEED, GROUND_HEIGHT)
//   - 데이터 레코드의 "필드"       → camelCase (예: points, boxW)
//     (담배 종류표 CIGARETTE_TYPES 가 레코드 — 엽전인생의 DATA.ITEMS 와 같은 자리)
// ═══════════════════════════════════════════════════════

const DATA = {
    // ═══════════════════════════════════════════════
    // 1. CONFIG — 게임 설정값 (밸런스 / 난이도 조정 손잡이)
    //    숫자를 바꾸고 싶으면 여기서만 수정한다.
    // ═══════════════════════════════════════════════
    CONFIG: {
        // 폐 게이지 최대치. 여기에 도달하면 게임 종료(엔딩)로 넘어간다.
        LUNG_GAUGE_MAX: 100,

        // ── 플레이 무대(필드) ──
        // ⚠ tokens.css 의 --field-* 와 값을 일치시킬 것 (main.js 가 주입).
        FIELD: {
            WIDTH: 1200,
            HEIGHT: 440,
            GROUND_HEIGHT: 40 - 16, // 바닥 띠의 높이(px). layout.css 의 바닥과 일치시킬 것.
            // GROUND_Y 는 위 값들에서 "파생"되므로 객체 아래에서 계산해 넣는다.
        },
        // 뷰포트 = 화면에 실제로 보이는 창 (스크롤되지 않는 고정 크기)
        VIEWPORT: {
            WIDTH: 1200,
            HEIGHT: 440,
            GROUND_HEIGHT: 40 - 16, // 바닥 띠의 높이(px). layout.css 의 바닥과 일치시킬 것.
            // GROUND_Y 는 위 값들에서 "파생"되므로 객체 아래에서 계산해 넣는다.
        },

        // 맵(월드) = 플레이어가 돌아다니는 전체 공간. 뷰포트가 이 안을 좌우로 스크롤한다.
        // 배경 원본 11000x1100 을 뷰포트 높이(440)에 맞춰 0.4배 축소한 표시 크기.
        MAP: {
            WIDTH: 11000 * 0.4, // = 4400
            HEIGHT: 1100 * 0.4, // = 440 (= VIEWPORT.HEIGHT, 세로 스크롤 없음)
            SPRITE: "img/map.png", // ⚠ TODO(에셋): 실제 배경 이미지 경로로 교체
        },

        // 카메라(스크롤) 설정
        CAMERA: {
            // 데드존: 플레이어가 화면 좌/우 끝에서 이만큼 안쪽에 닿으면 카메라가 따라 스크롤.
            // 값 ↑ = 더 일찍(가운데서) 스크롤 / 값 ↓ = 화면 끝에 더 붙어야 스크롤. 보면서 조절.
            EDGE_MARGIN: 400,
        },

        // ── 플레이어 ──
        // BOX_W / BOX_H = 충돌 박스 크기(px). 지금은 화면 표시 크기와 같다.
        // (개발문서의 boxW / boxH. 나중에 스프라이트 크기와 달라질 수 있음)
        PLAYER: {
            BOX_W: 100, //24,
            BOX_H: 100, //32,
            SPEED: 3, // 프레임당 이동 픽셀
            SPRITE: "img_assets/characters/99_default.png", // ⚠ index.html 기준 경로
        },

        // ── 담배 생성 규칙 ──
        SPAWN: {
            // TODO: INTERVAL 을 랜덤하게 생성해야함 (스코프1)
            INTERVAL: 90, // 생성 간격(프레임). ≈1.5초 @60fps
            MAX_ON_FIELD: 7, // 바닥에 동시에 존재 가능한 최대 개수 (개발문서)
        },

        // ── 영상(이미지) 씬 지속 시간 ──
        // introVideo / endingVideo 는 이미지 한 장을 보여주고 자동으로 다음 씬으로 간다.
        // 현재 이미지 한장을 3초동안만 보여줌
        SCENE: {
            INTRO_FRAMES: 180, // ≈3초 @60fps
            ENDING_FRAMES: 180, // ≈3초 @60fps
        },

        // ── 키 설정 ──
        // 액션 이름(left/right/interact)은 STATE.input 의 필드명과 짝을 이루므로
        // 소문자로 둔다 (ALL_CAPS 아님). 값은 "눌렸는지" 비교할 키 목록(소문자).
        KEYS: {
            left: ["arrowleft", "a"],
            right: ["arrowright", "d"],
            interact: ["e"],
        },

        // ── 폐 게이지 ──
        LUNG: {
            SPRITE: "/ui/lung.png",
            WIDTH: 80, // #lung-gauge 크기 (폐 이미지 비율에 맞게) 420 x 379
            HEIGHT: (379 * 80) / 420,

            // 채움이 멈추는 위쪽 천장 (이미지 높이의 %). 기관지(위 줄기)는 안 채워지고,
            // 폐가 시작되는 "핑크 지점"까지만 채운다.
            // 숫자 ↓ = 더 위까지 채움 / 숫자 ↑ = 더 아래에서 멈춤. 보면서 조절.
            FILL_TOP_PERCENT: 22,

            // 게이지를 몇 조각(계단)으로 나눠 채울지. 20 → 30 으로 바꾸면 더 잘게 나뉨.
            // ⚠ 순수 시각용 — LUNG_GAUGE_MAX(100)와는 독립. 둘은 따로 바꿔도 됨.
            SEGMENTS: 20,
        },
    },

    // ═══════════════════════════════════════════════
    // 2. CIGARETTE_TYPES — 담배 종류 정의표 (데이터 레코드)
    //    엽전인생의 DATA.ITEMS 와 같은 자리. 각 종류의 "변하지 않는 정보".
    //
    //    points     : 주웠을 때 폐 게이지 증가량 (개발문서 점수)
    //    percentage : 랜덤 생성 시 뽑힐 확률(%) — 셋의 합 = 100
    //    boxW/boxH  : 충돌 박스 크기(px)
    //    sprite     : 이미지 경로
    //
    //    ⚠ TODO(에셋): boxW/boxH 실제 값은 응이/디자인 확정 후 교체. 지금은 16x16 임시값.
    // ═══════════════════════════════════════════════
    CIGARETTE_TYPES: {
        cigar_s: {
            points: 5,
            percentage: 45,
            boxW: 20,
            boxH: 30,
            sprite: "img_assets/items/cigar_s.png",
        }, // 단초
        cigar_m: {
            points: 10,
            percentage: 45,
            boxW: 28,
            boxH: 30,
            sprite: "img_assets/items/cigar_m.png",
        }, // 중초
        cigar_l: {
            points: 20,
            percentage: 10,
            boxW: 36,
            boxH: 30,
            sprite: "img_assets/items/cigar_l.png",
        }, // 장초
    },

    // ── (구버전) 단일 담배 정의 — CIGARETTE_TYPES 로 대체됨.
    //    다음 정리 때 완전히 제거 예정. 지금은 참고용으로 주석 처리만.
    // CIGARETTE: {
    //     score: 10,
    //     w: 16,
    //     h: 16,
    // },
};

// ── 파생 상수 ──────────────────────────────────────────
// GROUND_Y: 플레이어가 바닥에 서 있을 때의 y 좌표(좌상단 기준).
//   = 무대 높이 − 바닥 높이 − 플레이어 높이
// 다른 CONFIG 값에서 계산되므로, 객체를 만든 직후 한 번만 채워 넣는다.
// (이렇게 하면 숫자를 한 곳에서만 관리 → 무대/플레이어 크기를 바꿔도 자동 반영)
DATA.CONFIG.FIELD.GROUND_Y =
    DATA.CONFIG.FIELD.HEIGHT -
    DATA.CONFIG.FIELD.GROUND_HEIGHT -
    DATA.CONFIG.PLAYER.BOX_H;

// DATA.CONFIG.VIEWPORT.GROUND_Y =
//     DATA.CONFIG.VIEWPORT.HEIGHT -
//     DATA.CONFIG.VIEWPORT.GROUND_HEIGHT -
//     DATA.CONFIG.PLAYER.BOX_H;
