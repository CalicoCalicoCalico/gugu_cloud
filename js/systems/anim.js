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
        case "idle":
        default:
            // 대기: 움직이는 중이면 걷기, 멈춰 있으면 기본 이미지
            return p.isMoving ? CLIPS.walk : CLIPS.idle;
    }
}

/**
 * 현재 프레임의 이미지 경로(폴더 + 파일명). render 가 background-image 로 쓴다.
 * @returns {string}
 */
function getPlayerSpriteUrl(p) {
    const clip = getPlayerClip(p);
    const file = clip[p.animFrame % clip.length]; // % 로 범위 안전하게 가둠
    return DATA.CONFIG.ANIM.DIR + file;
}

/**
 * 매 프레임 1회. 상태 전환 타이머와 프레임 진행을 처리한다. (loop.js 6번)
 */
function updateAnim() {
    const p = STATE.player;

    // ── 1. 시간이 정해진 상태: 다 되면 자동 전환 ──
    //   idle 은 animTimer = 0 이라 이 블록을 건너뛴다 (시간 제한 없음).
    if (p.animTimer > 0) {
        p.animTimer -= 1;
        if (p.animTimer <= 0) {
            if (p.playerStatus === "picking") {
                p.enterStatus("smoking"); // 줍기 끝 → 피우기 (개발문서 FSM)
            } else {
                p.enterStatus("idle"); // 피우기/스턴 끝 → 대기로 복귀
            }
        }
    }

    // ── 2. 현재 클립 안에서 다음 그림으로 진행 ──
    //   정적 클립(길이 1)은 % 1 = 0 이라 그림이 안 바뀐다 (안전).
    const clip = getPlayerClip(p);
    p.animFrameTimer -= 1;
    if (p.animFrameTimer <= 0) {
        p.animFrameTimer = DATA.CONFIG.ANIM.FRAME_DURATION;
        p.animFrame = (p.animFrame + 1) % clip.length;
    }
}
