// ═══════════════════════════════════════════════════════
// systems/anim.js — 애니메이션 시스템
//
// 두 가지 일을 한다:
//   1) 시간이 정해진 상태(picking/smoking/stunned)의 자동 전환
//        picking → smoking → idle,  stunned → idle
//   2) 현재 상태에 맞는 '클립'을 골라 한 프레임씩 그림을 넘김
//
// ⚠ FSM 상태(idle/picking/smoking/stunned)와 '보여줄 클립'은 다르다.
//   '걷기'는 상태가 아니라 "idle 인데 움직이는 중"일 뿐 → 여기서 판단한다.
// ═══════════════════════════════════════════════════════

/**
 * 지금 보여줄 클립(이미지 파일 배열)을 고른다.
 * @returns {string[]} DATA.CONFIG.ANIM.DIR 기준 파일명 목록
 */
function getPlayerClip(p) {
    const { CLIPS, SMOKE_CLIPS } = DATA.CONFIG.ANIM;
    switch (p.playerStatus) {
        case "smoking":
            // 담배 종류마다 피우기 프레임이 다름 (단/중/장). 못 찾으면 idle 로 폴백.
            return SMOKE_CLIPS[p.smokeType] ?? CLIPS.idle;
        case "picking":
            return CLIPS.picking;
        case "stunned":
            return CLIPS.stunned;
        case "onFire":
            // 불붙음: 움직여도/주워도 idle 과 동일. 차이는 오직 이미지.
            // 지금은 움직임과 무관하게 onFire 이미지 1장만 보여준다.
            // (걸을 때 '불붙은 걷기' 애니가 필요하면 말해주세요 → walk 처럼 분기 가능)
            return CLIPS.onFire;
        case "idle":
        default:
            // 대기: 움직이는 중이면 걷기, 멈춰 있으면 기본 이미지
            return p.isMoving ? CLIPS.walk : CLIPS.idle;
    }
}
function getPlayerSpriteUrl(p) {
    const clip = getPlayerClip(p);
    const frame = clip[p.animFrame % clip.length]; // 항상 { img, duration }
    return DATA.CONFIG.ANIM.DIR + frame.img;
}

function updateAnim() {
    const p = STATE.player;

    // 1. 시간 정해진 상태 자동 전환
    if (p.animTimer > 0) {
        p.animTimer -= 1;
        if (p.animTimer <= 0) {
            if (p.playerStatus === "picking") {
                p.enterStatus("smoking");
            } else {
                p.enterStatus("idle");
            }
        }
    }

    // 2. 클립 안에서 프레임 진행 (프레임마다 자기 duration 사용)
    const clip = getPlayerClip(p);
    p.animFrameTimer -= 1;
    if (p.animFrameTimer <= 0) {
        p.animFrame = (p.animFrame + 1) % clip.length;
        p.animFrameTimer = clip[p.animFrame].duration; // 새 프레임의 duration 주입
    }
}
