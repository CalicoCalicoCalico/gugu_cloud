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
    let cigaTypesArray = ["cigar_s", "cigar_m", "cigar_l"]; // 1. 담배 종류 어레이 만들기
    let cigaTypesWeights = [45, 45, 10]; // 2. 각 담배의 가중치 어레이 만들기
    let totalCigaTypesWeights = 100; // 3. 가중치의 총합 변수 설정하기
    let randomValue = Math.random() * totalCigaTypesWeights; // 4. 0부터 가중치 총합 사이의 랜덤 숫자 뽑기

    // 5. for문을 이용해 가중치를 더해가며 랜덤숫자가 어디에 있는지 확인하기(뽑은 랜덤 숫자가 누적된 가중치 보다 작으면 해당 담배 출력, 크면 다시 for loop)
    let cumulativeWeights = 0; // 누적된 가중치 변수 설정
    for (let i = 0; i < cigaTypesArray.length; i++) {
        cumulativeWeights += cigaTypesWeights[i];
        if (randomValue < cumulativeWeights) {
            return cigaTypesArray[i];
        }
    }
}

/**
 * 겹치지 않는 x 좌표를 골라 돌려준다. (rejection sampling — 업계 표준)
 *
 * 방법: 랜덤 x 를 하나 뽑아 → 이미 있는 담배들과 x 가 너무 가까운지 검사 →
 *       가까우면 버리고 다시 뽑는다. 최대 MAX_TRIES 번까지만 시도한다.
 *   (무한 루프 방지용으로 횟수를 제한. MAX_ON_FIELD 로 담배 수가 적어서
 *    대부분 몇 번 안에 빈자리를 찾는다.)
 *
 * x(가로)만 검사한다 — 담배는 전부 같은 바닥선에 놓이므로 가로 간격만 보면 충분.
 * air(떨어지는 중)·ground(땅) 가리지 않고, 아직 안 주운 담배는 모두 검사한다.
 *   (둘이 가까운 x 로 떨어지면 착지 후 겹쳐 보이기 때문)
 *
 * @param {number} boxW 새로 놓을 담배의 가로 크기(px)
 * @returns {number} 겹치지 않는 x (못 찾으면 마지막 후보를 그냥 반환)
 */
function pickNonOverlappingX(boxW) {
    const { MIN_GAP } = DATA.CONFIG.SPAWN;
    const maxX = DATA.CONFIG.MAP.WIDTH - boxW; // x 가 가질 수 있는 최대값
    const MAX_TRIES = 30; // 빈자리 못 찾으면 포기할 횟수

    for (let i = 0; i < MAX_TRIES; i++) {
        const candidateX = Math.random() * maxX; // 1. 후보 x 하나 뽑기

        // 2. 이미 있는(안 주운) 담배 중 하나라도 너무 가까우면 → 겹침
        //    후보가 차지하는 가로 범위 [candidateX, candidateX + boxW] 를
        //    MIN_GAP 만큼 양쪽으로 부풀려서 상대 담배 범위와 겹치는지 본다.
        const overlaps = STATE.cigarettesArray.some((c) => {
            if (c.collected) return false; // 주운 담배는 자리 안 차지함
            return (
                candidateX < c.x + c.boxW + MIN_GAP &&
                candidateX + boxW + MIN_GAP > c.x
            );
        });

        if (!overlaps) return candidateX; // 3. 빈자리 발견 → 그대로 사용
    }

    // 30번 안에 못 찾으면(맵이 거의 꽉 참) 마지막 후보를 그냥 쓴다.
    //   MAX_ON_FIELD 가 담배 수를 제한하므로 여기까지 오는 일은 드물다.
    return Math.random() * maxX;
}

/**
 * 담배 인스턴스 하나를 만들어 STATE.cigarettesArray 에 추가한다.
 * main.js 의 dev 버튼도 이 함수를 직접 호출한다(수동 생성 테스트용).
 * @param {number} [x] 배치 x. 없으면 무대 안 랜덤.
 */
function spawnOneCigarette(x) {
    const type = pickRandomCigaretteType();
    // x 를 안 주면(자동 생성) 겹치지 않는 자리를 직접 골라 넘긴다.
    //   x 를 준 경우(dev 수동 생성 등)는 그 자리를 그대로 존중한다.
    const placeX = x ?? pickNonOverlappingX(DATA.CIGARETTE_TYPES[type].boxW);
    const id = `cig_${STATE.cigaretteIdCounter++}`;
    STATE.cigarettesArray.push(new Cigarette(id, type, placeX));

    // ── SFX: 적담배가 하늘에서 떨어질 때 ──
    // (생성된 담배는 air 상태로 시작해 떨어진다)
    // ⚠ seedCigarettes()(게임 시작 시 미리 깔기)도 이 함수를 부르니,
    //    시작 순간 소리를 안 내려면 seed 쪽엔 별도 플래그가 필요. 일단 켤 땐 보면서 조절.
    playSfx("cigaretteFalling");
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
