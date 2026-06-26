// ═══════════════════════════════════════════════════════
// entities/humanFoot.js — 인간 발 한 짝 (HumanFoot Class)
//
// 한 다리의 FSM (개발문서 stepStatus): idle → down → ground → up → idle
//   idle   : 아직 안 보임. 다음 착지 x 받을 때까지 대기(IDLE_FRAMES).
//   down   : 위→아래로 내려오는 중. 공격력 O (닿으면 -폐게이지 + 스턴).
//   ground : 땅에 닿음. 공격력 X. 플레이어가 못 지나가는 '벽'.
//   up     : 아래→위로 올라가는 중. 공격력 O.
//
// '사람 전체'는 이 발이 여러 번 내려오는 것 = Human 이 두 발을 굴린다.
// ═══════════════════════════════════════════════════════

class HumanFoot {
    /**
     * @param {string} id        DOM 매칭용 고유 id ("human_0_R" ...)
     * @param {("L"|"R")} side   왼발/오른발 (이미지 세트 선택)
     * @param {string} type      DATA.HUMAN_TYPES 의 키 (training|suit|jean)
     * @param {number} stepSpeed 수직 이동 속도(px/frame) — down/up 공용
     */
    constructor(id, side, type, stepSpeed) {
        const def = DATA.HUMAN_TYPES[type];
        const { VIEWPORT, PLAYER, HUMAN } = DATA.CONFIG;

        this.id = id;
        this.side = side;
        this.type = type;
        this.boxW = def.boxW;
        this.boxH = def.boxH;
        this.sprites = def.sprites[side]; // { down, ground, up }
        this.stepSpeed = stepSpeed;

        // 시작 y(월드 위) / 착지 y(발 밑면이 바닥선과 같은 높이 — 담배·플레이어와 동일 공식)
        this.spawnY = HUMAN.SPAWN_Y;
        this.groundY = VIEWPORT.GROUND_Y + PLAYER.BOX_H - this.boxH;

        this.x = 0; // 착지 시점에 Human 이 채워줌
        this.y = this.spawnY;
        this.stepStatus = "idle"; // idle | down | ground | up
        this.animTimer = 0; // ground/idle 남은 프레임
        this.hasHitPlayer = false; // down/up 1회 데미지 가드
    }

    /** 상태 진입 시 y·타이머·데미지가드를 세팅 */
    enterStatus(status) {
        const { GROUND_FRAMES, IDLE_FRAMES } = DATA.CONFIG.HUMAN;
        this.stepStatus = status;

        if (status === "down") {
            this.y = this.spawnY;
            this.hasHitPlayer = false; // 내려오며 1번 때릴 수 있음
        } else if (status === "ground") {
            this.y = this.groundY; // 딱 맞춰 세움
            this.animTimer = GROUND_FRAMES;
        } else if (status === "up") {
            this.hasHitPlayer = false; // 올라가며 다시 1번 때릴 수 있음
        } else {
            // idle
            this.y = this.spawnY;
            this.animTimer = IDLE_FRAMES;
        }
    }

    /** 한 프레임 진행. 착지/복귀 같은 전환은 자체 처리, x 갱신은 Human 콜백으로. */
    step(human) {
        switch (this.stepStatus) {
            case "down":
                this.y += this.stepSpeed;
                if (this.y >= this.groundY) this.enterStatus("ground");
                break;
            case "ground":
                if (--this.animTimer <= 0) this.enterStatus("up");
                break;
            case "up":
                this.y -= this.stepSpeed;
                if (this.y <= this.spawnY) this.enterStatus("idle");
                break;
            case "idle":
            default:
                if (--this.animTimer <= 0) {
                    this.x = human.claimNextX(); // 다음 착지 x 받기(+사람 전진)
                    this.enterStatus("down");
                }
                break;
        }
    }

    isAttacking() {
        return this.stepStatus === "down" || this.stepStatus === "up";
    }
    isWall() {
        return this.stepStatus === "ground";
    }

    /** 지금 보여줄 이미지 (idle 이면 null → 안 보임) */
    currentSprite() {
        if (this.stepStatus === "idle") return null;
        return this.sprites[this.stepStatus]; // down|ground|up
    }

    getBox() {
        return { x: this.x, y: this.y, w: this.boxW, h: this.boxH };
    }
}
