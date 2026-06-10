// ═══════════════════════════════════════════════════════
// systems/render.js — 렌더 시스템 (읽기 전용)
//
//   읽음: STATE (전부)   씀: (게임 상태 없음)
//   ⚠ 원칙: render 는 STATE 를 절대 바꾸지 않는다. STATE → DOM 한 방향.
//
// DOM 노드 생성/삭제는 게임 상태 변경이 아니므로 읽기 전용 원칙에 어긋나지 않는다.
// (cigDomCache 는 render 자신의 살림 — 게임 상태 아님)
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
    el.style.backgroundImage = `url("${DATA.CONFIG.PLAYER.SPRITE}")`;
    el.dataset.looking = STATE.player.looking;
}

/**
 * 담배 배열을 DOM 과 동기화(reconcile).
 *  - 새 담배 → 노드 생성 (이미지·크기는 종류에 따라 생성 시 한 번만 설정)
 *  - 매 프레임 위치 반영
 *  - collected → .collected 클래스로 숨김
 */
function renderCigarettes() {
    const layer = $("cigarette-layer");

    for (const cig of STATE.cigarettesArray) {
        let el = cigDomCache.get(cig.id);

        // 없으면 새로 만들어 캐시 + 레이어에 부착.
        // 이미지·크기는 인스턴스마다 안 변하므로 생성할 때 한 번만 설정한다.
        if (!el) {
            el = document.createElement("div");
            el.className = "cigarette";
            el.dataset.id = cig.id;
            el.dataset.type = cig.type; // 디버깅용 (어떤 종류인지 DOM 에서 보임)

            // 종류별 스프라이트·크기는 DATA 가 단일 출처 → 여기서 인라인 적용
            el.style.backgroundImage = `url("${DATA.CIGARETTE_TYPES[cig.type].sprite}")`;
            el.style.width = `${cig.boxW}px`;
            el.style.height = `${cig.boxH}px`;

            layer.appendChild(el);
            cigDomCache.set(cig.id, el);
        }

        // 위치 반영 (매 프레임)
        el.style.left = `${cig.x}px`;
        el.style.top = `${cig.y}px`;

        // 주웠으면 숨김 (CSS .collected → display:none)
        el.classList.toggle("collected", cig.collected);
    }
}

/** 폐 게이지 바 채움/숫자 반영 */
function renderGauge() {
    const max = DATA.CONFIG.LUNG_GAUGE_MAX;
    const pct = (STATE.playerLungGauge / max) * 100;
    $("gauge-fill").style.width = `${pct}%`;
    $("gauge-value").textContent = `${STATE.playerLungGauge} / ${max}`;
}

/**
 * 담배 DOM 을 전부 비운다 (캐시 + #cigarette-layer 노드).
 * 새 게임 시작 시(main.js) 호출 — 이전 게임의 담배 노드가 남아
 * 같은 id(cig_0…)로 재사용되는 것을 막는다.
 */
function clearCigaretteLayer() {
    cigDomCache.clear();
    const layer = $("cigarette-layer");
    if (layer) layer.innerHTML = "";
}
