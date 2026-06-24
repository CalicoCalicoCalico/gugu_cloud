// ═══════════════════════════════════════════════════════
// entities/player.js — 플레이어 클래스 (Player Class)
//
// 주인공 비둘기. 위치·바라보는 방향·상태(playerStatus)를 가지고,
// "걷기"와 "자기 충돌 박스 알려주기" 행동을 스스로 한다.
//
// 핵심 데이터:
//   x, y          : 좌상단 좌표(px)
//   looking       : 바라보는 방향 "left" | "right" (render 가 좌우 반전에 사용)
//   playerStatus  : "idle" | "picking" | "smoking" (지금은 항상 idle, 애니는 다음 스코프)
//
// STATE.player 에 인스턴스 하나로 들어간다 (resetGameState 에서 생성).
// 크기·속도 같은 "안 변하는 값"은 DATA.CONFIG.PLAYER 에서 읽는다.
// ═══════════════════════════════════════════════════════

class Player {
    // ─────────────────────────────────────────
    // 생성자: 무대 가운데, 바닥 위에 서서 오른쪽을 보는 상태로 시작
    // ─────────────────────────────────────────
    constructor() {
        const { VIEWPORT, MAP, PLAYER } = DATA.CONFIG;
        this.x = MAP.WIDTH / 2 - PLAYER.BOX_W / 2; // 맵(월드) 가로 한가운데에서 시작
        this.y = VIEWPORT.GROUND_Y; // 바닥에 서기 (세로는 안 바뀜)
        this.looking = "right";

        // ── 상태(FSM) + 애니메이션 ──
        this.playerStatus = "idle"; // idle | picking | smoking | stunned | onFire
        this.isMoving = false; // 걷기 애니 판단용 (지금 움직이는 중인가)
        this.smokeType = null; // 피우는 중인 담배 종류 (smoking 클립 선택용)
        this.animFrame = 0; // 현재 클립에서 몇 번째 그림인가
        this.animFrameTimer = 0; // 다음 그림으로 넘어가기까지 남은 프레임
        this.animTimer = 0; // picking/smoking/stunned 남은 지속 프레임
    }

    // ─────────────────────────────────────────
    // 행동
    // ─────────────────────────────────────────

    /**
     * 한 프레임 좌우 이동. 무대 밖으로는 못 나가게 가두고, 바라보는 방향도 갱신.
     * @param {number} dir 이동 방향: -1(왼쪽) | 0(정지) | +1(오른쪽)
     */
    walk(dir) {
        this.isMoving = dir !== 0; // 걷기 애니 판단용 (0이면 정지로 본다)

        if (dir === 0) return; // 안 움직임

        const { WIDTH } = DATA.CONFIG.MAP; // 이동 한계는 화면이 아니라 맵(월드) 전체
        const { BOX_W, SPEED } = DATA.CONFIG.PLAYER;
        const maxX = WIDTH - BOX_W; // 맵 오른쪽 끝 한계
        this.x = clamp(this.x + dir * SPEED, 0, maxX); // helpers.js 의 clamp
        this.looking = dir < 0 ? "left" : "right";
    }

    // ─────────────────────────────────────────
    // 조회
    // ─────────────────────────────────────────

    /**
     * 상태(playerStatus)를 바꾸고 애니메이션을 처음부터 다시 시작한다.
     * picking/smoking/stunned 처럼 시간이 정해진 상태는 지속 프레임도 세팅한다.
     * (idle 은 STATUS_DURATION 에 없으므로 animTimer = 0 → 시간 제한 없음)
     * @param {("idle"|"picking"|"smoking"|"stunned"|"onFire")} status
     */
    enterStatus(status) {
        this.playerStatus = status;
        this.animFrame = 0; // 새 클립은 항상 첫 그림부터 (gif 와 달리 재시작 보장됨)
        // 첫 프레임의 duration 으로 타이머를 맞춘다 (모든 프레임은 { img, duration })
        const clip = getPlayerClip(this);
        this.animFrameTimer = clip[0].duration;
        this.animTimer = DATA.CONFIG.ANIM.STATUS_DURATION[status] ?? 0;
    }

    /**
     * 충돌 판정용 박스. 위치는 자신, 크기는 DATA.CONFIG.PLAYER 에서 가져온다.
     * (AABB 헬퍼가 쓰는 {x, y, w, h} 형태로 돌려준다)
     * @returns {{x:number, y:number, w:number, h:number}}
     */
    getBox() {
        const { BOX_W, BOX_H } = DATA.CONFIG.PLAYER;
        return { x: this.x, y: this.y, w: BOX_W, h: BOX_H };
    }
}
