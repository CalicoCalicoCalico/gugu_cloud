// ═══════════════════════════════════════════════════════
// systems/interaction.js — 상호작용 시스템
// 대응 TDD: 5단계 상호작용 행, 6단계 루프 4번, 7단계 smoke() 트랜잭션.
//
//   isColliding(a, b)   순수 함수, 부작용 없음
//   addGauge(amount)    lungGauge 1개만 씀 (clamp) — 비트랜잭션
//   smoke()             [트랜잭션] — 아래 변경 순서를 글자대로 지킬 것
// ═══════════════════════════════════════════════════════

/**
 * 두 박스의 겹침 판정. (TDD: isColliding)
 * @param {{x,y,w,h}} a
 * @param {{x,y,w,h}} b
 * @returns {boolean}
 */
function isColliding(a, b) {
    return aabbOverlap(a, b); // helpers.js 의 AABB
}

/**
 * 게이지를 더하고 [0, GAUGE_MAX] 로 clamp 한다. (TDD: addGauge)
 * 씀: lungGauge 1개. 트랜잭션 아님.
 * @param {number} amount
 */
function addGauge(amount) {
    STATE.lungGauge = clamp(STATE.lungGauge + amount, 0, DATA.GAUGE_MAX);
}

/**
 * smoke() — 겹친 담배를 줍고 게이지를 올린다.  [트랜잭션]  (TDD 7단계)
 *
 * 사전 조건: input.interact == true · 겹친 담배 c 존재 · c.collected == false
 *   (⚠ 0차엔 player.animState 조건 없음 — 피우기 애니는 1차)
 * 실패: 위 중 하나라도 거짓 → 중단(아무 상태도 안 바꿈)
 *
 * 변경 순서 (TDD 그대로, animState 단계만 0차에서 제외):
 *   (1) c.collected = true
 *   (2) addGauge(DATA.CIGARETTE.score)        // [0,100] clamp
 *   // (3) player.animState = 'smoking'  ← ⚠ 1차에서 추가
 *   근거: collected 를 먼저 뒤집으면, 다음 프레임 재충돌이 사전 조건
 *         (collected==false)에서 걸려 점수 이중 가산이 불가능.
 *
 * 씀: cigarette.collected, lungGauge.
 */
function smoke() {
    // 사전 조건 1: 상호작용 키
    if (!STATE.input.interact) return;

    // 플레이어 충돌 박스 합성: 위치는 STATE.player, 크기는 DATA.PLAYER.
    // (STATE/DATA 분리 — STATE.player 엔 w·h 가 없다)
    const playerBox = {
        x: STATE.player.x,
        y: STATE.player.y,
        w: DATA.PLAYER.w,
        h: DATA.PLAYER.h,
    };

    // 사전 조건 2~3: 겹쳤고 아직 안 주운 담배 찾기
    const c = STATE.cigarettes.find(
        (cig) => !cig.collected && isColliding(playerBox, cig),
    );
    if (!c) return; // 대상 없음 → 중단

    // ── 트랜잭션 본체 (순서 고정) ──
    c.collected = true; // (1) 먼저 플래그 → 이중 가산 차단
    addGauge(DATA.CIGARETTE.score); // (2) 게이지 가산 (clamp 내장)
    // (3) player.animState = 'smoking';  // ⚠ 1차
}
