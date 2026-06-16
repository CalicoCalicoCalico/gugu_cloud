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
        // y: 담배 밑면이 바닥선(플레이어 발밑)과 같은 높이에. (세로는 안 바뀜)
        this.y =
            DATA.CONFIG.VIEWPORT.GROUND_Y +
            DATA.CONFIG.PLAYER.BOX_H -
            this.boxH;

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
     * 충돌 판정용 박스. AABB 헬퍼가 쓰는 {x, y, w, h} 형태로 돌려준다.
     * @returns {{x:number, y:number, w:number, h:number}}
     */
    getBox() {
        return { x: this.x, y: this.y, w: this.boxW, h: this.boxH };
    }
}
