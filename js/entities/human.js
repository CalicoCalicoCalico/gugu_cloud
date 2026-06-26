// ═══════════════════════════════════════════════════════
// entities/human.js — 인간(걷는 사람) 한 명 (Human Class)
//
// 발 한 짝(HumanFoot)들을 굴리는 '코디네이터'. 자기 랜덤 속성(종류·속도·보폭·방향)을
// 가지고, 매 프레임 두 발을 진행시키며 맵을 가로질러 걸어간다.
//
// 박자(tempo)·교대(order)는 여기서 조절: PHASE_OFFSET 으로 L/R 엇갈림.
// (개발문서의 복잡한 R1-R2-L1-L2... 순서는 추후 '시퀀스 배열'로 확장 가능)
// ═══════════════════════════════════════════════════════

class Human {
    /** @param {string} id 고유 id ("human_0" ...) */
    constructor(id) {
        const { HUMAN, MAP } = DATA.CONFIG;
        const TYPES = DATA.HUMAN_TYPES;

        this.id = id;
        this.dead = false; // true 면 다음 갱신에서 제거

        // ── 랜덤 traits (생성 시 1회) ──
        //     type             : 그 세가지 ["suit", "jean" 하나 더 뭐드라]
        //     walkSpeed        : "fast" | "slow"     (걷기 속도)
        //     walkPacing       : "normal" | "close" (노말이 그 둘기너비*2, 가까이는 얼마나 가까이인지..)
        //     direction        : "left" | "right"    (입장 방향)
        //     stepSpeed        : 발이 내려오는 속도 (walkSpeed와 같음)

        this.type = "suit"; //여기 랜덤
        this.walkSpeed = "slow"; //여기 랜덤
        this.direction = "right"; // 여기 랜덤

        const def = TYPES[this.type];
        const walkPacing = "normal"; // 여기 랜덤
        this.stride =
            walkPacing === "normal"
                ? HUMAN.STRIDE.normal // 비둘기 너비 * 2
                : def.boxW + HUMAN.STRIDE.CLOSE_EXTRA; // 발 너비 + 24

        const stepSpeed = HUMAN.STEP_SPEED[this.walkSpeed];

        // 진행 방향 + 시작 위치(맵 바깥에서 걸어 들어옴)
        this.dirSign = this.direction === "right" ? 1 : -1;
        this.x =
            this.dirSign > 0
                ? -HUMAN.SPAWN_MARGIN
                : MAP.WIDTH + HUMAN.SPAWN_MARGIN;

        // ── 두 발 ──
        this.feet = [
            new HumanFoot(`${id}_R`, "R", this.type, stepSpeed),
            new HumanFoot(`${id}_L`, "L", this.type, stepSpeed),
        ];
        // 반 박자 엇갈림: L 발만 처음에 더 기다렸다 내려온다
        const cycle = this._cycleFrames(stepSpeed);
        this.feet[1].animTimer = Math.round(HUMAN.PHASE_OFFSET * cycle);
    }

    /** 한 발의 전체 주기(프레임). 위상 오프셋 계산용. */
    _cycleFrames(stepSpeed) {
        const { GROUND_FRAMES, IDLE_FRAMES } = DATA.CONFIG.HUMAN;
        const f = this.feet[0];
        const downF = Math.ceil((f.groundY - f.spawnY) / stepSpeed);
        return downF * 2 + GROUND_FRAMES + IDLE_FRAMES;
    }

    /** 발이 착지할 때 호출 → 현재 착지 x 주고, 사람을 한 보폭 전진시킨다. */
    claimNextX() {
        const x = this.x;
        this.x += this.stride * this.dirSign;
        return x;
    }

    /** 매 프레임 1회 (humanWalk 가 호출). 두 발 진행 + 맵 밖 이탈 검사. */
    update() {
        for (const foot of this.feet) foot.step(this);

        const { MAP, HUMAN } = DATA.CONFIG;
        if (this.dirSign > 0 && this.x > MAP.WIDTH + HUMAN.SPAWN_MARGIN) {
            this.dead = true;
        } else if (this.dirSign < 0 && this.x < -HUMAN.SPAWN_MARGIN) {
            this.dead = true;
        }
    }
}
