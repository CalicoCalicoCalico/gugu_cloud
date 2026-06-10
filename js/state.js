// ═══════════════════════════════════════════════════════
// state.js — 게임 동적 상태 (Runtime State)
//
// 게임 중에 바뀌는 값들이 여기 들어간다. data.js 와 정반대:
//   data.js  → 게임 규칙 (정해지면 안 변함, 읽기 전용)
//   state.js → 현재 상황 (계속 변함, 읽기/쓰기)
//
// 판단법: "이 값이 플레이 중 변하나?"
//   변함 → state.js   /   안 변함 → data.js
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════
// STATE — 게임 현재 상태 (한 객체에 모든 동적 데이터)
// 디버깅: 콘솔에 `STATE` 만 쳐도 전체 상태가 한눈에 보인다.
// ═══════════════════════════════════════════════
const STATE = {
    // 현재 씬 (씬 FSM).
    // 흐름(개발문서 참고): title → introVideo → play → endingVideo → end
    currentScene: "title",

    // ── 플레이어 ──
    // TODO(다음 스코프): Player 클래스로 전환 예정 (지금은 평범한 객체).
    player: {
        x: 0, // 좌상단 x (resetGameState 에서 무대 중앙으로 설정)
        y: 0, // 좌상단 y (resetGameState 에서 바닥 y 로 설정)
        looking: "right", // 바라보는 방향: "left" | "right"  (개발문서: looking)
        playerStatus: "idle", // 개발문서 플레이어 상태: "idle" | "picking" | "smoking"
        // 지금은 항상 "idle". 상태 전환은 다음 스코프(애니) 담당.
        // animTimer: 0,        // 다음 스코프(애니메이션 재설계)에서 사용 예정
    },

    // ── 바닥에 있는 담배들 ──
    // 각 원소(지금은 평범한 객체): { id, type, x, y, boxW, boxH, collected }
    //   type 은 DATA.CIGARETTE_TYPES 의 키 ("cigar_s" | "cigar_m" | "cigar_l")
    // TODO(다음 스코프): Cigarette 클래스 인스턴스 배열로 전환 예정.
    cigarettesArray: [],

    // 현재 플레이어와 상호작용 중인 담배 (없으면 null).
    // 지금은 사용 안 함 — 줍기/상호작용 흐름(picking)이 들어오는 다음 스코프용 자리.
    currentCigarette: null,

    // ── 폐 게이지 ── (도메인 [0, DATA.CONFIG.LUNG_GAUGE_MAX])
    playerLungGauge: 0,

    // ── 입력 플래그 ── (handleInput 이 매 프레임 갱신)
    input: {
        left: false, // ← 가 눌려 있나 (홀드: 누르는 동안 계속 true)
        right: false, // → 가 눌려 있나 (홀드: 누르는 동안 계속 true)

        // E(줍기)는 "탭" 입력이다. 두 값으로 나눠서 관리한다:
        interactDown: false, // E 가 지금 눌려 있나 (홀드). 엣지 감지의 "직전 상태" 역할도 함.
        interactPressed: false, // E 가 "이번 프레임에 막 눌렸나" (한 프레임만 true). 줍기는 이걸 본다.
    },

    // ── 내부 카운터 / 타이머 (런타임에 변하므로 STATE 에 둔다) ──
    cigaretteIdCounter: 0, // 담배 id 발급용 (계속 증가). 예: "cig_0", "cig_1"...
    framesSinceLastSpawn: 0, // 마지막 담배 생성 후 지난 프레임 수 (spawn 이 사용)
    framesInCurrentScene: 0, // 현재 씬에 머문 프레임 수 (영상 씬 자동 전환용)
};

// ═══════════════════════════════════════════════
// 함수
// ═══════════════════════════════════════════════

/**
 * STATE 를 플레이 시작 시점 값으로 리셋한다. (시작 / 재시작 공용)
 * currentScene 은 건드리지 않는다 — 씬 결정은 호출하는 쪽(main.js) 책임.
 */
function resetGameState() {
    const { FIELD, PLAYER } = DATA.CONFIG;

    // 플레이어: 무대 가운데, 바닥 위에 서기
    STATE.player.x = FIELD.WIDTH / 2 - PLAYER.BOX_W / 2;
    STATE.player.y = FIELD.GROUND_Y;
    STATE.player.looking = "right";
    STATE.player.playerStatus = "idle";
    // STATE.player.animTimer = 0; // 다음 스코프(애니)에서 사용 예정

    // 담배 · 상호작용 초기화
    STATE.cigarettesArray = [];
    STATE.currentCigarette = null;
    STATE.cigaretteIdCounter = 0;

    // 게이지 비우기
    STATE.playerLungGauge = 0;

    // 입력 초기화
    STATE.input.left = false;
    STATE.input.right = false;
    STATE.input.interactDown = false;
    STATE.input.interactPressed = false;

    // 타이머 초기화 (씬 진입 시점에 씬 시스템이 다시 세팅한다)
    STATE.framesSinceLastSpawn = 0;
    STATE.framesInCurrentScene = 0;
}
