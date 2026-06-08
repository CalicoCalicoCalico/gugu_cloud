// ═══════════════════════════════════════════════════════
// data.js — 정적 데이터 (DATA)
// 대응 TDD: 4단계 "데이터 모델 확정" 의 DATA 블록들. (0차 범위만)
//
// 규칙: 플레이 중 절대 안 변하는 값만. 읽기 전용 상수.
//       변하는 값은 state.js 로.
// ═══════════════════════════════════════════════════════

const DATA = {
    // ── 플레이어 정적 설정 (TDD: DATA.PLAYER) ──
    PLAYER: {
        w: 24, // 폭(px)  — tokens.css --player-width 와 일치
        h: 32, // 높이(px) — tokens.css --player-height 와 일치
        speed: 3, // 프레임당 이동 픽셀
    },

    // ── 담배 (TDD: DATA.CIG_TYPES) ──
    // ⚠ 0차는 "한 종류 담배" 뿐 → 단일 상수로 단순화.
    //   1차에서 이 자리에 DATA.CIG_TYPES = { S:{...}, M:{...}, L:{...} } 가 들어오고
    //   담배 인스턴스에 type 필드가 생긴다. (지금은 type 없음)
    CIGARETTE: {
        score: 10, // 한 개비당 게이지 증가량 (TDD 가정: S=10)
        w: 16, // tokens.css --cig-width 와 일치
        h: 16, // tokens.css --cig-height 와 일치
        // sprite: "img/cig.png",  // ⚠ TODO(에셋): 0차는 색 박스 플레이스홀더
    },

    // ── 폐 게이지 (TDD: DATA.GAUGE_MAX) ──
    // 0차에서는 "최대치 = clamp 상한" 으로만 쓴다.
    // (게이지 도달 → 엔딩 전환은 2차. 0차엔 checkEnding 없음)
    GAUGE_MAX: 100,

    // ── 입력 키 바인딩 (TDD: DATA.KEYS) ──
    // 0차는 좌우 이동 + 상호작용(E)만. (소문자로 비교)
    KEYS: {
        left: ["arrowleft", "a"],
        right: ["arrowright", "d"],
        interact: ["e"],
    },

    // ── 플레이 무대 (TDD 4단계의 "생성처: 필드 ...", 6단계 clamp 경계) ──
    // ⚠ TDD 에 구체 수치가 없던 값 → 임의 지정. tokens.css 의 --field-* 와 일치시킬 것.
    FIELD: {
        width: 720,
        height: 360,
        groundY: 360 - 64 - 32, // 바닥(64px) 위에 플레이어(h=32)가 서는 y
    },
};
