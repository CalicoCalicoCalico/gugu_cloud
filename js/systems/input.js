// ═══════════════════════════════════════════════════════
// systems/input.js — 입력 시스템
// 대응 TDD: 5단계 시스템 표 "입력 / handleInput()", 6단계 루프 1번.
//   읽음: (키 입력)   →   씀: STATE.input
//
// 엽전인생 프로젝트의 pressedKeys Set 패턴을 가져왔다:
//   keydown/keyup 으로 눌린 키 집합을 유지하고, 매 프레임 handleInput 이 읽는다.
// ═══════════════════════════════════════════════════════

// 현재 눌려 있는 키 집합 (소문자)
const pressedKeys = new Set();

/**
 * 전역 키 리스너 등록. main.js 부팅 때 한 번 호출.
 */
function initInput() {
    window.addEventListener("keydown", (e) =>
        pressedKeys.add(e.key.toLowerCase()),
    );
    window.addEventListener("keyup", (e) =>
        pressedKeys.delete(e.key.toLowerCase()),
    );
}

/** DATA.KEYS[action] 의 키 중 하나라도 눌려 있나? */
function isActionDown(action) {
    return DATA.KEYS[action].some((key) => pressedKeys.has(key));
}

/**
 * 눌린 키를 읽어 STATE.input 을 갱신한다. (루프 1번)
 * 부작용: STATE.input 만 쓴다. 실패 모드 없음. (TDD)
 */
function handleInput() {
    // 눌린 키 집합 → 의미 있는 입력 플래그로 변환
    STATE.input.left = isActionDown("left");
    STATE.input.right = isActionDown("right");
    STATE.input.interact = isActionDown("interact");
}
