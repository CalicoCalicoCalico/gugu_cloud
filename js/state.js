// ═══════════════════════════════════════════════════════
// state.js — 런타임 상태 (STATE)
// 대응 TDD: 4단계 "데이터 모델 확정" 의 STATE 블록들. (0차 범위만)
//
// 규칙: 플레이 중 변하는 값만. 디버깅 시 콘솔에 `STATE` 만 쳐도 전부 보임.
// ═══════════════════════════════════════════════════════

const STATE = {
    // ── 씬 FSM (TDD: STATE.scene) ──
    // 0차 도메인: 'title' | 'play'  (intro/ending 은 0차 범위 밖)
    scene: "title",

    // ── 플레이어 (TDD: STATE.player) ──
    // ⚠ 0차엔 animState/animTimer 없음 (피우기 애니는 1차).
    //   1차에서 animState:'idle'|'picking'|'smoking' + animTimer 가 추가된다.
    player: {
        x: 0,
        y: 0,
        facing: "right", // 'left' | 'right'
    },

    // ── 담배 인스턴스 배열 (TDD: STATE.cigarettes[]) ──
    // 각 원소: { id, x, y, w, h, collected }
    //   id 는 render() 의 DOM 키 매칭용 (참고사전 §5 표준 속성).
    //   ⚠ 0차엔 type 없음 (1차에서 추가).
    cigarettes: [],

    // ── 폐 게이지 (TDD: STATE.lungGauge) ──
    lungGauge: 0, // 도메인 [0, DATA.GAUGE_MAX]

    // ── 입력 (TDD: STATE.input) ──
    input: {
        left: false,
        right: false,
        interact: false,
    },
};

// 담배 인스턴스 id 발급용 카운터 (단순 증가)
let _cigSeq = 0;

/**
 * STATE 를 플레이 시작 시점 값으로 리셋한다. (시작/재시작 공용)
 * currentScene 은 안 건드림 — 씬 결정은 호출하는 쪽 책임. (엽전인생 패턴)
 * 대응 TDD: 4단계 각 STATE 의 초기값.
 */
function resetGameState() {
    STATE.player.x = DATA.FIELD.width / 2 - DATA.PLAYER.w / 2; // 필드 중앙
    STATE.player.y = DATA.FIELD.groundY; // 바닥에 서기
    STATE.player.facing = "right";

    STATE.cigarettes = [];
    _cigSeq = 0;

    STATE.lungGauge = 0;

    STATE.input.left = false;
    STATE.input.right = false;
    STATE.input.interact = false;
}

/**
 * 담배 인스턴스 하나를 만들어 STATE.cigarettes 에 추가한다.
 * ⚠ 이것은 spawnCigarette() 의 자리지만, 0차 폴백이다.
 *   진짜 생성 규칙(간격·분포·재생성)은 1차 BLOCKING 미해결 → main.js 의
 *   dev 버튼이 이 함수를 한 번씩 호출한다.
 * @param {number} x - 배치 x (없으면 무대 안 랜덤)
 */
function devSpawnCigarette(x) {
    const px =
        x ?? Math.random() * (DATA.FIELD.width - DATA.CIGARETTE.w);
    STATE.cigarettes.push({
        id: `cig_${_cigSeq++}`,
        x: px,
        y: DATA.FIELD.groundY + DATA.PLAYER.h - DATA.CIGARETTE.h, // 바닥에 놓기
        w: DATA.CIGARETTE.w,
        h: DATA.CIGARETTE.h,
        collected: false,
    });
}
