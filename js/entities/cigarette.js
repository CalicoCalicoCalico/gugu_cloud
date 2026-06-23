// ═══════════════════════════════════════════════════════
// entities/cigarette.js — 담배 클래스 (Cigarette Class)
//
// 바닥에 떨어지는 담배 한 개비. 종류(type)에 따라 점수·크기·이미지가 정해진다.
//
// 핵심 데이터:
//   id        : DOM 매칭용 고유 문자열 ("cig_0" ...). spawn 이 발급.
//   type      : DATA.CIGARETTE_TYPES 의 키 ("cigar_s" | "cigar_m" | "cigar_l")
//   points    : 주웠을 때 폐 게이지 증가량 (종류에서 복사 — smoke 가 사용)
//   boxW/boxH : 충돌 박스 크기 (종류에서 복사)
//   sprite    : 이미지 경로 (종류에서 복사 — render 가 사용)
//   x, y      : 좌상단 좌표(px)
//   collected : 주웠나? (true 면 render 가 숨김)
//
// STATE.cigarettesArray 에 인스턴스로 쌓인다 (spawn 이 생성).
// ═══════════════════════════════════════════════════════

class Cigarette {
    // ─────────────────────────────────────────
    // 생성자: 종류 정보를 복사해 채우고, 위치를 정한다
    // ─────────────────────────────────────────

    /**
     * @param {string} id   고유 id (spawn 이 발급: "cig_0" ...)
     * @param {("cigar_s"|"cigar_m"|"cigar_l")} type 담배 종류
     * @param {number} [x]  배치 x. 안 주면 무대 안 랜덤.
     */
    constructor(id, type, x) {
        const def = DATA.CIGARETTE_TYPES[type]; // 종류별 고정 정보

        this.id = id;
        this.type = type;
        this.points = def.points; // smoke 가 사용
        this.boxW = def.boxW;
        this.boxH = def.boxH;
        this.sprite = def.sprite; // render 가 사용

        // x: 안 주면 맵(월드) 전체에 랜덤 배치.
        //    (화면 밖에도 생기고, 플레이어가 걸어가면 그때 만난다)
        this.x = x ?? Math.random() * (DATA.CONFIG.MAP.WIDTH - this.boxW);

        // ── 낙하 FSM (담배 상태) ──
        // 상태 목록: "air"(하늘에서 떨어지는 중) | "ground"(땅에 닿음) / 초기값: "air"
        this.cigarStatus = "air";

        // 착지 목표 y: 담배 밑면이 바닥선(플레이어 발밑)과 같은 높이.
        //   떨어지다 이 값에 닿으면 ground 로 전환한다. (종류마다 boxH 가 달라 값도 다름)
        this.groundY =
            DATA.CONFIG.VIEWPORT.GROUND_Y +
            DATA.CONFIG.PLAYER.BOX_H -
            this.boxH;

        // 시작 y: 하늘(월드 맨 위)에서 시작해 아래로 떨어진다. x 는 위에서 정한 랜덤값 그대로.
        this.y = DATA.CONFIG.CIGARETTE.SPAWN_Y;

        // 공중에서 플레이어를 이미 한 번 때렸나? (한 담배는 떨어지며 딱 한 번만 데미지)
        this.hasHitPlayer = false;

        // ── (Phase 2) 회전/눕기 속성 (생성 시 랜덤 1회, 헬퍼로 뽑음) ── TODO(주림)
        //   담배종류(type)는 이미 spawn.js 의 pickRandomCigaretteType() 로 정해져 넘어옴.
        //   여기선 나머지 셋을 뽑는다:
        //     spinSpeed     : "fast" | "slow"     (회전 빠르기 종류 → DATA SPIN 에서 각도 조정가능)
        //     spinDir       : +1(시계) | -1(반시계)
        //     faceDirection : "left" | "right"    (땅에 누웠을 때 바라보는 방향)
        //     angle         : 현재 각도(도). air 동안 누적, ground 되면 눕는 각도로 고정

        // 여기 얘들 3개가 랜덤적용되어야하는 얘들. 지금은 걍 이 값으로 고정해둠
        this.spinSpeed = "slow"; // 여기에 그 랜덤함수 써서 네
        this.spinDir = 1;
        this.faceDirection = "right";
        this.angle = 0;

        this.collected = false;
    }

    // ─────────────────────────────────────────
    // 행동 / 조회
    // ─────────────────────────────────────────

    /** 주운 것으로 표시한다. (render 가 .collected 로 숨김) */
    collect() {
        this.collected = true;
    }

    /**
     * air 상태일 때 한 프레임 아래로 떨어진다. groundY 에 닿으면 ground 로 전환.
     *   땅에 닿은(ground) 담배는 더 떨어지지 않고, 공격력도 사라진다(updateCigarettes 참고).
     * 부작용: this.y, this.cigarStatus.
     */
    fall() {
        if (this.cigarStatus !== "air") return; // 이미 땅이면 안 떨어짐

        // 낙하: 회전 빠르기 종류(spinSpeed)에 따라 빠르게/느리게 떨어진다.
        this.y += DATA.CONFIG.CIGARETTE.FALL_SPEED[this.spinSpeed];

        // (Phase 2) 회전: air 동안 각도 누적 ── TODO(주림)
        //   회전 빠르기 종류(spinSpeed) 방향(spinDir)를 DATA 에서 쓰면 될듯?!

        // 착지: 목표 y 도달 → 딱 맞춰 세우고 ground 로 전환
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.cigarStatus = "ground";

            // 착지 시 눕는 방향(faceDirection) 각도로 스냅
            // right 면 180° 뒤집어 눕고, left 면 0°. (담배 스프라이트 기본 방향 보고 조절)
            this.angle = this.faceDirection === "right" ? 180 : 0;
        }
    }

    /**
     * 충돌 판정용 박스. AABB 헬퍼가 쓰는 {x, y, w, h} 형태로 돌려준다.
     * @returns {{x:number, y:number, w:number, h:number}}
     */
    getBox() {
        return { x: this.x, y: this.y, w: this.boxW, h: this.boxH };
    }
}
