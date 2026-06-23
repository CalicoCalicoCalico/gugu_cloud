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
    const frameData = clip[p.animFrame % clip.length]; // % 로 범위 안전하게 가둠
    /*만약 frameData가 상자(객체) 형태라면 .img를 꺼내고, 문자열이면 그대로 쓴다!*/
    const file = typeof frameData === "object" ? frameData.img : frameData;
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
    const frameData = clip[p.animFrame % clip.length];

    /*현재 프레임에 고유의 duration이 적혀있으면 그걸 쓰고, 없으면 기본값(8)을 쓴다! */
    const currentDuration = (typeof frameData === "object" && frameData.duration) 
        ? frameData.duration 
        : DATA.CONFIG.ANIM.FRAME_DURATION;

    /* 캐릭터의 이전 상태를 기억할 비밀 주머니(_lastStatus)를 만든다.
     * 상태가 "막 바뀌는 순간"을 감지해서, enterStatus가 멋대로 꽂아둔 8을 진짜 시간으로 덮어쓴다!*/
    if (!p._lastStatus) p._lastStatus = p.playerStatus;
    
    if (p._lastStatus !== p.playerStatus) {
        // 상태가 방금 막 바뀌었다면, 첫 프레임의 타이머를 완벽하게 초기화!
        p.animFrameTimer = currentDuration;
        p._lastStatus = p.playerStatus; // 현재 상태를 기억해둔다.
    }

    p.animFrameTimer -= 1;
    if (p.animFrameTimer <= 0) {
        // 다음 프레임으로 넘어갈 때 시간 주입
        const nextFrameData = clip[(p.animFrame + 1) % clip.length];
        const nextDuration = (typeof nextFrameData === "object" && nextFrameData.duration)
            ? nextFrameData.duration
            : DATA.CONFIG.ANIM.FRAME_DURATION;

        p.animFrameTimer = nextDuration;
        p.animFrame = (p.animFrame + 1) % clip.length;
    }
}
