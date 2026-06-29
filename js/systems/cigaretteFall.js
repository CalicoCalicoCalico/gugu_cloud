// ═══════════════════════════════════════════════════════
// systems/cigarettes.js — 담배 갱신 시스템 (낙하 + 공중 담배 데미지)
//
// 담배 FSM(개발문서 "적 Enemy" / cigarStatus):
//   air    : 하늘에서 떨어지는 중. 플레이어에 닿으면 폐 게이지 -AIR_DAMAGE (담배당 1회).
//   ground : 땅에 닿음. 공격 없음. E 로 주울 수 있음(interaction.js 의 smoke).
//
//   읽음: STATE.cigarettesArray, STATE.player
//   씀:   각 담배의 y·cigarStatus(fall 내부), 담배의 hasHitPlayer,
//         STATE.playerLungGauge(addGauge 통해)
// ═══════════════════════════════════════════════════════

/**
 * 매 프레임 1회(루프). 모든 담배를 낙하시키고, 공중 담배의 플레이어 충돌을 처리한다.
 *   - air 담배는 떨어진다(착지하면 fall 내부에서 ground 로 전환).
 *   - 떨어지는 중 플레이어와 "처음 겹치는 순간" 딱 한 번만 -AIR_DAMAGE.
 *     (이후엔 hasHitPlayer 로 막혀, 계속 떨어져 땅에 닿으면 평범하게 주울 수 있다)
 *
 * ⚠ 플레이어 충돌 박스(360px)가 화면만큼 커서, 막지 않으면 매 프레임 데미지가
 *   들어간다. 그래서 hasHitPlayer 플래그로 "담배당 1회"를 강제한다.
 */
function updateCigarettes() {
    const playerBox = STATE.player.getBox();

    for (const cig of STATE.cigarettesArray) {
        if (cig.collected) continue; // 주운 담배는 무시

        // 1. air 상태면 한 프레임 떨어뜨린다 (착지하면 fall 내부에서 ground 로 바뀜)
        cig.fall();

        // 2. 아직 공중(air) + 아직 안 때렸음 + 플레이어와 겹침 → 1회 데미지
        if (
            cig.cigarStatus === "air" &&
            !cig.hasHitPlayer &&
            isColliding(playerBox, cig.getBox())
        ) {
            cig.hasHitPlayer = true; // 먼저 잠가 다음 프레임 재타격 차단
            addGauge(-DATA.CONFIG.CIGARETTE.AIR_DAMAGE); // 폐 게이지 -5 (clamp 내장)
            // 떨어지는 담배에 맞으면 '불붙음(smokeFire)' 상태로.

            // ── SFX: 담배에 맞음 (공격당함) ──
            // playSfx("hitByCigarette");

            // smokeFire 는 idle 과 동작 동일(이동·줍기 가능), 이미지만 다르고 시간 지나면 자동 idle 복귀.
            // ⚠ 줍기/피우기 중(picking/smoking)에 맞으면 그 애니가 끊기지 않도록 idle/smokeFire 일 때만 덮어쓴다.
            const s = STATE.player.playerStatus;
            if (s === "idle" || s === "smokeFire") {
                STATE.player.enterStatus("smokeFire");
            }
        }
    }
}
