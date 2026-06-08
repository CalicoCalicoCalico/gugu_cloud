// ═══════════════════════════════════════════════════════
// systems/render.js — 렌더 시스템 (읽기 전용)
// 대응 TDD: 5단계 "렌더 / render()", 6단계 루프 마지막.
//   읽음: (전부)   씀: (없음)  ← ⚠ 중요 원칙: render 는 STATE 를 절대 안 쓴다.
//
// render 는 STATE 를 읽어 DOM 에만 반영한다. DOM 노드 생성/삭제는
// STATE 변경이 아니므로 읽기 전용 원칙에 어긋나지 않는다.
// (cigDomCache 는 render 자신의 살림살이 — 게임 상태 아님)
// ═══════════════════════════════════════════════════════

// 담배 id → DOM 요소 캐시 (render 전용 살림. STATE 아님)
const cigDomCache = new Map();

/**
 * 한 프레임의 화면을 STATE 로부터 그린다. STATE 는 읽기만.
 */
function render() {
    renderPlayer();
    renderCigarettes();
    renderGauge();
}

/** 플레이어 위치/방향을 DOM 에 반영 */
function renderPlayer() {
    const el = $("player");
    el.style.left = `${STATE.player.x}px`;
    el.style.top = `${STATE.player.y}px`;
    el.dataset.facing = STATE.player.facing; // CSS 가 scaleX 로 반전
}

/**
 * 담배 배열을 DOM 과 동기화(reconcile).
 *  - 새 담배 → 노드 생성
 *  - 위치 반영
 *  - collected → .collected 클래스로 숨김
 */
function renderCigarettes() {
    const layer = $("cigarette-layer");

    for (const cig of STATE.cigarettes) {
        let el = cigDomCache.get(cig.id);

        // 없으면 새로 만들어 캐시 + 레이어에 부착
        if (!el) {
            el = document.createElement("div");
            el.className = "cigarette";
            el.dataset.id = cig.id;
            layer.appendChild(el);
            cigDomCache.set(cig.id, el);
        }

        // 위치 반영 (인스턴스 x/y)
        el.style.left = `${cig.x}px`;
        el.style.top = `${cig.y}px`;

        // 주웠으면 숨김 (CSS .collected → display:none)
        el.classList.toggle("collected", cig.collected);
    }
}

/** 폐 게이지 바 채움/숫자 반영 */
function renderGauge() {
    const pct = (STATE.lungGauge / DATA.GAUGE_MAX) * 100;
    $("gauge-fill").style.width = `${pct}%`;
    $("gauge-value").textContent = `${STATE.lungGauge} / ${DATA.GAUGE_MAX}`;
}
