// ═══════════════════════════════════════════════════════
// systems/humanWalk.js — 인간 발(적) 갱신 시스템
//
//   updateHumans()    : 모든 사람의 두 발 진행 + 공중 발 데미지/스턴 + 맵 밖 제거
//   isBlockedByFoot() : ground(밟고 선) 발과 겹치나? (movement.js 가 벽 판정에 사용)
//   spawnOneHuman()   : 사람 한 명 생성 (dev 키가 호출)
//
//   읽음: STATE.humansArray, STATE.player
//   씀:   각 발의 y·상태(foot.step 내부), STATE.playerLungGauge, player 상태(스턴)
// ═══════════════════════════════════════════════════════

function updateHumans() {
    const playerBox = STATE.player.getBox();

    for (const human of STATE.humansArray) {
        human.update();

        for (const foot of human.feet) {
            // 공중(down/up) 발 → "처음 겹치는 순간" 딱 1회 데미지 + 스턴
            if (
                foot.isAttacking() &&
                !foot.hasHitPlayer &&
                isColliding(playerBox, foot.getBox())
            ) {
                foot.hasHitPlayer = true; // 먼저 잠가 재타격 차단
                addGauge(-DATA.CONFIG.HUMAN.AIR_DAMAGE); // 폐 게이지 -5

                // 스턴: 어떤 상태든(줍기·피우기·불붙음 포함) 무조건 스턴으로 덮어쓴다.
                STATE.player.enterStatus(DATA.CONFIG.HUMAN.STUN_STATUS);

                // ── SFX: 발에 밟힘 (공격당함) ──
                playSfx("hitByFoot");
            }
        }
    }

    // 맵 밖으로 다 걸어 나간 사람 제거 (DOM 도 정리 — render.js 의 removeHumanDom)
    for (let i = STATE.humansArray.length - 1; i >= 0; i--) {
        if (STATE.humansArray[i].dead) {
            removeHumanDom(STATE.humansArray[i]);
            STATE.humansArray.splice(i, 1);
        }
    }
}

/** ground 상태의 발과 겹치는지 (벽 판정). 움직임 막을 때 movement.js 가 부른다. */
function isBlockedByFoot(box) {
    for (const human of STATE.humansArray) {
        for (const foot of human.feet) {
            if (foot.isWall() && isColliding(box, foot.getBox())) return true;
        }
    }
    return false;
}
/**
 * 자동 생성: 간격(SPAWN_INTERVAL)이 차면 사람 한 명을 생성한다. (루프가 매 프레임 호출)
 * 지금은 동시 인원 제한 없음(스코프1: 한 명씩 걸어오고 나가면 끝). 3차에서 최대 3명 제한 추가 예정.
 */
function spawnHuman() {
    const { SPAWN_INTERVAL } = DATA.CONFIG.HUMAN;

    STATE.framesSinceLastHuman += 1;
    if (STATE.framesSinceLastHuman < SPAWN_INTERVAL) return;
    STATE.framesSinceLastHuman = 0;

    spawnOneHuman();
}

/** 사람 한 명 생성 (dev 테스트용 — 정식 스포너 생기면 이걸 호출하게 바꾸면 됨). */
function spawnOneHuman() {
    const id = `human_${STATE.humanIdCounter++}`;
    STATE.humansArray.push(new Human(id));
}
