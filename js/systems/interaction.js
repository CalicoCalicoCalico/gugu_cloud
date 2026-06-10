// ═══════════════════════════════════════════════════════
// systems/interaction.js — 상호작용 시스템 (담배 줍기)
//
//   isColliding(a, b)   순수 함수, 부작용 없음
//   addGauge(amount)    playerLungGauge 한 개만 씀 (clamp)
//   smoke()             겹친 담배를 줍고 게이지를 올린다 [트랜잭션]
// ═══════════════════════════════════════════════════════

// ─────────────────────────────────────────
// 순수 헬퍼
// ─────────────────────────────────────────

/**
 * 두 박스의 겹침 판정.
 * @param {{x:number,y:number,w:number,h:number}} a
 * @param {{x:number,y:number,w:number,h:number}} b
 * @returns {boolean}
 */
function isColliding(a, b) {
    return aabbOverlap(a, b); // helpers.js 의 AABB
}

/**
 * 게이지를 더하고 [0, LUNG_GAUGE_MAX] 로 가둔다.
 * 씀: playerLungGauge 한 개. 트랜잭션 아님.
 * @param {number} amount
 */
function addGauge(amount) {
    STATE.playerLungGauge = clamp(
        STATE.playerLungGauge + amount,
        0,
        DATA.CONFIG.LUNG_GAUGE_MAX,
    );
}

// ─────────────────────────────────────────
// 줍기 (트랜잭션)
// ─────────────────────────────────────────

/**
 * smoke() — 겹친 담배를 줍고 게이지를 올린다. [트랜잭션]
 *
 * 사전 조건: input.interactPressed == true · 겹친 담배 c 존재 · c.collected == false
 * 실패: 하나라도 거짓 → 중단(아무 상태도 안 바꿈)
 *
 * E 는 "탭" 입력이라 한 번 누를 때마다 한 개만 줍는다. (꾹 눌러도 한 개)
 * 담배를 더 주우려면 플레이어가 직접 다음 담배 위로 가서 E 를 다시 눌러야 한다.
 *
 * 변경 순서 (지키면 점수 이중 가산이 불가능):
 *   (1) c.collected = true   ← 먼저 플래그를 뒤집어 다음 프레임 재충돌을 막음
 *   (2) addGauge(종류별 points)
 *
 * 씀: cigarette.collected, playerLungGauge.
 */
function smoke() {
    // 사전 조건 1: E 를 "막 눌렀나" (홀드로는 발동 안 함 — 한 번 누를 때마다 한 개)
    if (!STATE.input.interactPressed) return;

    // (다음 스코프) 피우는 중엔 재진입 금지 — 줍기/피우기 상태가 들어오면 부활.
    // if (STATE.player.playerStatus !== "idle") return;

    // 플레이어 충돌 박스는 플레이어가 스스로 알려준다.
    const playerBox = STATE.player.getBox();

    // 겹쳤고 아직 안 주운 담배 찾기. (담배도 자기 박스를 getBox() 로 알려줌)
    const c = STATE.cigarettesArray.find(
        (cig) => !cig.collected && isColliding(playerBox, cig.getBox()),
    );
    if (!c) return; // 대상 없음 → 중단

    // ── 트랜잭션 본체 (순서 고정) ──
    c.collect(); // (1) 먼저 주운 것으로 표시 → 이중 가산 차단
    addGauge(c.points); // (2) 담배가 가진 점수만큼 게이지 가산

    // (다음 스코프) 줍기/피우기 상태·애니 + currentCigarette 세팅이 여기 들어온다.
    // STATE.currentCigarette = c;
    // STATE.player.playerStatus = "smoking";
    // STATE.player.animTimer = ...;
}
