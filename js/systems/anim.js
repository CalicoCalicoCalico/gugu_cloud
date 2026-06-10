// ═══════════════════════════════════════════════════════
// systems/anim.js — 애니메이션 시스템 (사용 보류)
//
// ⚠ 이 시스템은 다음 스코프에서 재설계 예정이라 지금은 통째로 주석 처리한다.
//   재설계 시 다룰 것:
//     - 플레이어 상태(playerStatus) 전환: idle → picking → smoking → idle
//     - 타이머(animTimer)
//     - 종류별 줍기/피우기 gif 프레임
//
// 지금은 loop.js 의 updateAnim() 호출도 함께 주석 처리되어 있다.
// 부활시키려면: 아래 주석을 풀고, loop.js play 케이스의 updateAnim() 주석도 풀 것.
// ═══════════════════════════════════════════════════════

// function updateAnim() {
//     if (STATE.player.playerStatus !== "smoking") return;
//     STATE.player.animTimer -= 1;
//     if (STATE.player.animTimer <= 0) {
//         STATE.player.playerStatus = "idle"; // 복귀
//     }
// }
