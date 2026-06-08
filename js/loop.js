// ═══════════════════════════════════════════════════════
// loop.js — 씬 전환 + 게임 루프 순서
// 대응 TDD: 2단계 씬 FSM(루프 지배), 6단계 게임 루프 순서표.
//
// "지금 어느 scene 인가" 가 어떤 시스템이 도는지를 정한다 → 최상단 분기.
// 아래 play 순서는 TDD 6단계 표에서 0차에 없는 단계
// (생성·판정·애니)를 뺀 것이다.
// ═══════════════════════════════════════════════════════

/**
 * 씬을 전환한다. .active 클래스를 토글하고 STATE.scene 갱신.
 * @param {('title'|'play')} name
 */
function switchScene(name) {
    document
        .querySelectorAll(".scene")
        .forEach((el) => el.classList.remove("active"));
    $(`scene-${name}`).classList.add("active");
    STATE.scene = name;
}

/**
 * 매 프레임 1회 호출. 현재 씬에 맞는 시스템들을 정해진 순서로 돌린다.
 */
function tick() {
    switch (STATE.scene) {
        case "play":
            // ── play 루프 순서 (TDD 6단계, 0차) ──
            handleInput(); // 1. 입력 수집
            movePlayer(); // 2. 이동
            // (3. 생성 spawnCigarette  — ⚠ 1차)
            smoke(); // 4. 상호작용 (내부에서 isColliding)
            // (5. 종료 판정 checkEnding — ⚠ 2차)
            // (6. 애니 갱신 updateAnim — ⚠ 1차)
            render(); // 7. 렌더 (맨 끝, 읽기 전용)
            break;

        case "title":
        default:
            // 타이틀은 정적 화면 — 루프에서 할 일 없음 (버튼 클릭이 전환)
            break;
    }
}
