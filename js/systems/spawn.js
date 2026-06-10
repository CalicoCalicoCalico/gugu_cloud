// ═══════════════════════════════════════════════════════
// systems/spawn.js — 담배 생성 시스템
//
// 일정 간격(INTERVAL)마다, 바닥 담배가 최대치(MAX_ON_FIELD) 미만이면
// 새 담배 하나를 랜덤 종류·랜덤 위치로 만든다.
// ═══════════════════════════════════════════════════════

// ─────────────────────────────────────────
// 매 프레임 호출 (루프 3번)
// ─────────────────────────────────────────

/**
 * 생성 간격이 차고 담배가 최대치 미만이면 한 개 생성한다.
 */
function spawnCigarette() {
    const { INTERVAL, MAX_ON_FIELD } = DATA.CONFIG.SPAWN;

    STATE.framesSinceLastSpawn += 1;
    if (STATE.framesSinceLastSpawn < INTERVAL) return;
    STATE.framesSinceLastSpawn = 0;

    // 아직 안 주운(살아있는) 담배 수가 최대치면 생성 안 함
    const aliveCount = STATE.cigarettesArray.filter((c) => !c.collected).length;
    if (aliveCount >= MAX_ON_FIELD) return;

    spawnOneCigarette(); // 위치 미지정 → 무대 안 랜덤
}

// ─────────────────────────────────────────
// 생성 헬퍼
// ─────────────────────────────────────────

/**
 * 확률(percentage)에 따라 담배 종류 키 하나를 뽑는다.
 * (단초 45 / 중초 45 / 장초 10 → 합 100 가정)
 * @returns {("cigar_s"|"cigar_m"|"cigar_l")}
 */
function pickRandomCigaretteType() {
    const roll = Math.random() * 100; // 0 이상 100 미만
    let cumulative = 0;
    for (const [type, def] of Object.entries(DATA.CIGARETTE_TYPES)) {
        cumulative += def.percentage;
        if (roll < cumulative) return type;
    }
    // 부동소수 오차 등으로 안 걸리면 마지막 종류 반환 (안전장치)
    const typeKeys = Object.keys(DATA.CIGARETTE_TYPES);
    return typeKeys[typeKeys.length - 1];
}

/**
 * 담배 인스턴스 하나를 만들어 STATE.cigarettesArray 에 추가한다.
 * main.js 의 dev 버튼도 이 함수를 직접 호출한다(수동 생성 테스트용).
 * @param {number} [x] 배치 x. 없으면 무대 안 랜덤.
 */
function spawnOneCigarette(x) {
    const type = pickRandomCigaretteType();
    const def = DATA.CIGARETTE_TYPES[type];

    const { WIDTH, GROUND_Y } = DATA.CONFIG.FIELD;
    const { BOX_H } = DATA.CONFIG.PLAYER;

    const px = x ?? Math.random() * (WIDTH - def.boxW);
    // y: 담배 밑면이 플레이어 발밑(바닥선)과 같은 높이에 오도록.
    const py = GROUND_Y + BOX_H - def.boxH;

    STATE.cigarettesArray.push({
        id: `cig_${STATE.cigaretteIdCounter++}`,
        type,
        x: px,
        y: py,
        boxW: def.boxW,
        boxH: def.boxH,
        collected: false,
    });
}
