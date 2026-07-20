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
    constructor(id, side, type, walkSpeed) {
        const def = DATA.HUMAN_TYPES[type];
        const { VIEWPORT, PLAYER, HUMAN } = DATA.CONFIG;

        this.id = id;
        this.side = side;
        this.type = type;
        this.boxW = def.boxW;
        this.boxH = def.boxH;
        this.hitbox = def.hitbox; // 충돌 판정용 (이미지보다 작은 영역)
        this.sprites = def.sprites[side]; // { down, ground, up }
        this.walkSpeed = walkSpeed; // "fast" | "slow" — 프레임 수 룩업용
        this.stepSpeed = HUMAN.STEP_SPEED[walkSpeed]; // 수직 이동 속도(px/frame)

        // ★ CSS 반전 기준이 될 방향 속성 (기본값 "left")
        this.direction = "left";

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
        // 이 발의 속도 종류(fast|slow)에 맞는 프레임 수
        const groundF = GROUND_FRAMES[this.walkSpeed];
        const idleF = IDLE_FRAMES[this.walkSpeed];

        if (status === "down") {
            this.y = this.spawnY;
            this.hasHitPlayer = false; // 내려오며 1번 때릴 수 있음
        } else if (status === "ground") {
            this.y = this.groundY; // 딱 맞춰 세움
            this.animTimer = groundF;

            // ── SFX: 사람 발소리 (종류별로 다름 — this.type 으로 선택) ──
            playHumanWalkSfx(this.type);
        } else if (status === "up") {
            this.hasHitPlayer = false; // 올라가며 다시 1번 때릴 수 있음
        } else {
            // idle
            this.y = this.spawnY;
            this.animTimer = idleF;
        }
    }

    /** 한 프레임 진행. 착지/복귀 같은 전환은 자체 처리, x 갱신은 Human 콜백으로. */
    step(human) {
        // ★ 부모의 direction을 받아와 나의 direction에 저장합니다.
        if (human && human.direction) {
            this.direction = human.direction;
        }

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

                    // ★ 착지하여 내려오기 직전, 다시 한번 방향을 확실히 체크합니다.
                    if (human && human.direction) {
                        this.direction = human.direction;
                    }
                    this.enterStatus("down");
                }
                break;
        }
    }

    isAttacking() {
        // 내려오는 중(down)만 공격. 올라가는(up) 발은 공중이어도 공격 안 함.
        return this.stepStatus === "down";
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
        const { offsetX, offsetY, w, h } = this.hitbox;

        // ★ 이미지가 "left"일 때 뒤집히므로, offsetX 대칭 계산도 "left"일 때 수행합니다.
        let finalOffsetX = offsetX;
        if (this.direction && this.direction.toLowerCase() === "left") {
            finalOffsetX = this.boxW - offsetX - w;
        }

        return { x: this.x + finalOffsetX, y: this.y + offsetY, w, h };
    }
}
