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
 * @returns {("cigar_s"|"cigar_m"|"cigar_l")}
 */
function pickRandomCigaretteType() {
    let cigaTypesArray = ["cigar_s", "cigar_m", "cigar_l"];
    // 랜덤 인덱스 만들기 0, 1, 2 중 하나
    let randIndex = Math.floor(Math.random() * 3);

    // TODO: 학률 추가하기

    return cigaTypesArray[randIndex];
}

/**
 * 담배 인스턴스 하나를 만들어 STATE.cigarettesArray 에 추가한다.
 * main.js 의 dev 버튼도 이 함수를 직접 호출한다(수동 생성 테스트용).
 * @param {number} [x] 배치 x. 없으면 무대 안 랜덤.
 */
function spawnOneCigarette(x) {
    const type = pickRandomCigaretteType();
    // 위치 계산·크기 설정은 Cigarette 생성자가 알아서 한다 (x 안 주면 랜덤).
    const id = `cig_${STATE.cigaretteIdCounter++}`;
    STATE.cigarettesArray.push(new Cigarette(id, type, x));
}

/**
 * 게임 시작 시 맵에 담배를 미리 여러 개 뿌린다 (빈 맵 방지).
 * main.js 가 새 게임을 시작할 때 호출. count 만큼 맵 전체에 랜덤 배치한다.
 * @param {number} count 미리 깔 담배 개수 (보통 MAX_ON_FIELD)
 */
function seedCigarettes(count) {
    for (let i = 0; i < count; i++) {
        spawnOneCigarette(); // 위치 미지정 → 맵 전체 랜덤
    }
}
