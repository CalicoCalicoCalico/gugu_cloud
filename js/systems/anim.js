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

// 걷기/대시 발소리 박자용 — 클립이 한 바퀴 돌 때마다 +1 (everyNCycles 판정에 씀)
const _sfxCycle = { walk: 0, dash: 0 };

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
        case "smokeFire":
            // 불붙음: 움직여도/주워도 idle 과 동일. 차이는 오직 이미지.
            // 지금은 움직임과 무관하게 smokeFire 이미지 1장만 보여준다.
            // (걸을 때 '불붙은 걷기' 애니가 필요하면 말해주세요 → walk 처럼 분기 가능)
            return CLIPS.smokeFire;
        case "idle":
        default:
            // 대기: 움직이는 중이면 걷기, 멈춰 있으면 기본 이미지
            return p.isMoving ? CLIPS.walk : CLIPS.idle;
    }
}

/**
 * 몸 상태(default ↔ round)에 따라 파일명 접두사를 바꾼다.
 * 폐 게이지가 임계값 "이상"이면 '99_default' → '99_round' 로 통째 교체.
 * (round 전용 클립을 따로 두지 않고, 같은 클립의 파일명만 바꿔 재사용한다.
 *  → 모든 동작(idle/walk/picking/smoking/stunned/smokeFire)이 자동으로 round 로 바뀜)
 * @param {string} filename 예: "99_default_smokeS1.png"
 * @returns {string} 예: "99_round_smokeS1.png" (임계값 미만이면 원본 그대로)
 */
function applyBodyCondition(filename) {
    if (STATE.playerLungGauge >= DATA.CONFIG.PLAYER.ROUND_GAUGE_THRESHOLD) {
        return filename.replace("99_default", "99_round"); // 접두사만 교체 (첫 1회)
    }
    return filename;
}

function getPlayerSpriteUrl(p) {
    const clip = getPlayerClip(p);
    const frame = clip[p.animFrame % clip.length]; // 항상 { img, duration }
    return DATA.CONFIG.ANIM.DIR + applyBodyCondition(frame.img); // 몸 상태 반영
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

        // 클립이 0번으로 돌아오면 한 바퀴 돈 것 → 사이클 카운터 +1
        if (p.animFrame === 0) {
            if (p.playerStatus === "idle" && p.isMoving) _sfxCycle.walk++;
            if (p.playerStatus === "dashing") _sfxCycle.dash++; // 3차
        }

        // ── SFX: 걷기 발소리 (박자는 data.js 의 frames/everyNCycles) ──
        // mp3 생기면 주석 해제.
        // if (p.playerStatus === "idle" && p.isMoving) {
        //     playStepSfx("walkStep", p.animFrame, _sfxCycle.walk);
        // }

        // ── SFX: 대시 발소리 (3차) ──
        // if (p.playerStatus === "dashing") {
        //     playStepSfx("dash", p.animFrame, _sfxCycle.dash);
        // }
    }
}
