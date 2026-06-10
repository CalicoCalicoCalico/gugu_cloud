// ═══════════════════════════════════════════════════════
// systems/input.js — 입력 시스템
//
// 매 프레임 "지금 눌려 있는 키"를 읽어 STATE.input 플래그로 바꾼다.
//   읽음: 키보드   →   씀: STATE.input
//
// 이동(←/→)은 "홀드" 입력 — 누르는 동안 계속 움직인다.
// 줍기(E)는 "탭" 입력 — 한 번 누를 때마다 한 번만 발동한다(꾹 눌러도 한 번).
//   → 막 눌린 그 한 프레임만 true 인 interactPressed 를 만들어 준다(엣지 감지).
// ═══════════════════════════════════════════════════════

// 현재 눌려 있는 키 집합 (모두 소문자)
const pressedKeys = new Set();

// ─────────────────────────────────────────
// 초기화 — main.js 부팅 때 한 번 호출
// ─────────────────────────────────────────

/** 전역 키 리스너를 등록한다. */
function initInput() {
    window.addEventListener("keydown", (e) =>
        pressedKeys.add(e.key.toLowerCase()),
    );
    window.addEventListener("keyup", (e) =>
        pressedKeys.delete(e.key.toLowerCase()),
    );
}

// ─────────────────────────────────────────
// 매 프레임 갱신
// ─────────────────────────────────────────

/**
 * 한 액션의 키(DATA.CONFIG.KEYS[action]) 중 하나라도 눌려 있나?
 * @param {("left"|"right"|"interact")} action
 * @returns {boolean}
 */
function isActionDown(action) {
    return DATA.CONFIG.KEYS[action].some((key) => pressedKeys.has(key));
}

/**
 * 눌린 키를 읽어 STATE.input 을 갱신한다. (루프 1번)
 * 씀: STATE.input 만. 실패 모드 없음.
 */
function handleInput() {
    // 이동: 홀드 — 누르는 동안 계속 true
    STATE.input.left = isActionDown("left");
    STATE.input.right = isActionDown("right");

    // 줍기(E): 탭 — "막 눌린" 한 프레임만 true 로 만든다 (rising edge).
    //   직전 프레임엔 안 눌렸는데(interactDown == false) 지금 눌렸으면 → 막 눌림.
    //   꾹 누르고 있으면 둘째 프레임부터 interactDown 이 true 라서 pressed 는 false.
    const interactDownNow = isActionDown("interact");
    STATE.input.interactPressed = interactDownNow && !STATE.input.interactDown;
    STATE.input.interactDown = interactDownNow; // 다음 프레임 비교용으로 현재 상태 저장
}
