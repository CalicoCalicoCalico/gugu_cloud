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
const cigHitboxCache = new Map(); // 담배 디버그 히트박스 (render 전용 살림)
const footHitboxCache = new Map(); // 발 디버그 히트박스 (render 전용 살림)

// 발 id → DOM 요소 캐시 (render 전용 살림. STATE 아님)
const footDomCache = new Map();

/**
 * 한 프레임의 화면을 STATE 로부터 그린다. STATE 는 읽기만.
 */
function render() {
    renderWorld(); // 카메라 위치를 #world 에 반영 (배경·담배·플레이어가 함께 스크롤)
    renderPlayer();
    renderCigarettes();
    renderHumans();
    renderGauge();
}

/** 카메라 위치를 #world 컨테이너에 반영. transform 으로 통째로 밀어 스크롤한다. */
function renderWorld() {
    // 화면좌표 = 월드 − camera.x → #world 를 왼쪽으로 camera.x 만큼 민다
    $("world").style.transform = `translateX(${-STATE.camera.x}px)`;
}

/** 플레이어 위치/방향을 DOM 에 반영 */
function renderPlayer() {
    const el = $("player");

    // 엔딩 연출: 떠올랐으면 위로 RISE_OFFSET_PX 만큼 올린다 (위로 = top 감소).
    // 연출 중에만 transition 클래스(player-rising)를 켜서 부드럽게 떠오르게 한다.
    const risen = STATE.ending.active && STATE.ending.risen;
    const floatY = risen ? DATA.CONFIG.ENDING.RISE_OFFSET_PX : 0;
    el.classList.toggle("player-rising", STATE.ending.active);

    el.style.left = `${STATE.player.x}px`;
    el.style.top = `${STATE.player.y - floatY}px`;

    // 플레이 중
    el.style.backgroundImage = `url("${getPlayerSpriteUrl(STATE.player)}")`; // 현재 프레임
    el.dataset.looking = STATE.player.looking;
    el.dataset.status = STATE.player.playerStatus; // 디버깅용 (DOM 에서 상태 보임)

    // ── 디버그 히트박스 (실제 충돌 박스와 1:1) ──
    const box = STATE.player.getBox();
    const dbg = $("player-hitbox");
    dbg.style.left = `${box.x}px`;
    dbg.style.top = `${box.y}px`;
    dbg.style.width = `${box.w}px`;
    dbg.style.height = `${box.h}px`;
}

/**
 * 담배 배열을 DOM 과 동기화(reconcile).
 *  - 새 담배 → 노드 생성 (이미지·크기는 종류에 따라 생성 시 한 번만 설정)
 *  - 매 프레임 위치 반영
 *  - collected → .collected 클래스로 숨김
 */
function renderCigarettes() {
    const layer = $("cigarette-layer");
    const dbgLayer = $("cig-hitbox-layer");

    // 이번 프레임에 살아있는 담배 id 모음 (아래 청소에 쓴다)
    const aliveIds = new Set();

    for (const cig of STATE.cigarettesArray) {
        aliveIds.add(cig.id);

        // ── 실제 담배 DOM ──
        let el = cigDomCache.get(cig.id);
        if (!el) {
            el = document.createElement("div");
            el.className = "cigarette";
            el.dataset.id = cig.id;
            el.dataset.type = cig.type;
            el.style.backgroundImage = `url("${cig.sprite}")`;
            el.style.width = `${cig.boxW}px`;
            el.style.height = `${cig.boxH}px`;
            layer.appendChild(el);
            cigDomCache.set(cig.id, el);
        }
        el.style.left = `${cig.x}px`;
        el.style.top = `${cig.y}px`;
        el.style.transform = `rotate(${cig.angle}deg)`;
        el.classList.toggle("collected", cig.collected);
        // 사라지기 전 페이드아웃 (현재 사용) + 깜빡임 (BLINK_COUNT>0 일 때만 겸용).
        //   깜빡임은 opacity 0 으로 순간 숨김 처리 — 페이드 값과 곱해서 자연스럽게 합침.
        //   ⚠ 보통 둘 중 하나만 켠다: 페이드만 쓰려면 BLINK_COUNT=0 (기본값) 유지.
        const fade = cig.currentOpacity();
        const blinkHidden = cig.isBlinkHidden() ? 0 : 1;
        el.style.opacity = fade * blinkHidden;
        el.style.visibility = "visible"; // 이전 회차의 hidden 잔재 리셋 (안전)

        // ── 디버그 히트박스 DOM ──
        let dbg = cigHitboxCache.get(cig.id);
        if (!dbg) {
            dbg = document.createElement("div");
            dbg.className = "cig-hitbox";
            dbgLayer.appendChild(dbg);
            cigHitboxCache.set(cig.id, dbg);
        }
        const hb = cig.getBox();
        dbg.style.left = `${hb.x}px`;
        dbg.style.top = `${hb.y}px`;
        dbg.style.width = `${hb.w}px`;
        dbg.style.height = `${hb.h}px`;
        dbg.classList.toggle("collected", cig.collected);
    }

    // ── 청소: 배열에서 사라진 담배의 DOM 제거 (실제 + 디버그) ──
    // (humanWalk 의 removeHumanDom 과 같은 역할 — 담배엔 지금까지 없었음)
    for (const [id, el] of cigDomCache) {
        if (!aliveIds.has(id)) {
            el.remove();
            cigDomCache.delete(id);
        }
    }
    for (const [id, dbg] of cigHitboxCache) {
        if (!aliveIds.has(id)) {
            dbg.remove();
            cigHitboxCache.delete(id);
        }
    }
}

/** 인간 발들을 DOM 과 동기화. idle 발은 숨김. */
function renderHumans() {
    const layer = $("human-layer");

    for (const human of STATE.humansArray) {
        for (const foot of human.feet) {
            let el = footDomCache.get(foot.id);
            if (!el) {
                el = document.createElement("div");
                el.className = "human-foot";
                el.dataset.id = foot.id;
                el.style.width = `${foot.boxW}px`; // 종류별 크기 (생성 시 1회)
                el.style.height = `${foot.boxH}px`;

                // [추가] 크기를 조절해도 히트박스 중심에 이미지가 고정되도록 합니다.
                el.style.transformOrigin = "center";

                layer.appendChild(el);
                footDomCache.set(foot.id, el);
            }

            // ── ★ [위치 조정] 데이터 동기화 및 방향 계산은 탈출선(continue)보다 위에서 수행합니다. ──
            if (human && human.startDirection) {
                foot.direction = human.startDirection;
            }

            const currentDir = (foot.direction || "").toLowerCase();

            // 이제 발의 상태가 idle(숨김)이든 아니든, 콘솔창에서 발의 방향 상태를 완벽히 감시할 수 있습니다.
            // console.log(
            //     `발 ID: ${foot.id}, 현재상태: ${foot.stepStatus}, 방향: ${currentDir}`,
            // );

            const sprite = foot.currentSprite(); // idle → null
            if (!sprite) {
                el.style.display = "none"; // idle: 안 보임\

                // ★ 아래 디버그 히트박스 조건에서 탈출하기 위해, 여기서 디버그 박스도 숨겨줍니다.
                const fdbg = footHitboxCache.get(foot.id);
                if (fdbg) fdbg.style.display = "none";

                continue;
            }
            el.style.display = "block";
            el.style.left = `${foot.x}px`;
            el.style.top = `${foot.y}px`;
            el.style.backgroundImage = `url("${sprite}")`;
            el.dataset.status = foot.stepStatus; // 디버깅용

            // ── ★ startDirection에 따른 CSS 반전 처리 ──
            if (currentDir === "left") {
                el.style.transform = "scaleX(-1)";
                // el.style.border = "3px solid red"; // ◀ 오른쪽 발이면 빨간 테두리 (확인 후 주석 처리하셔도 됩니다)
            } else {
                el.style.transform = "scaleX(1)";
                // el.style.border = "3px solid blue"; // ◀ 왼쪽 발이면 파란 테두리
            }

            // ── 디버그 히트박스 ──
            const fdbgLayer = $("foot-hitbox-layer");
            let fdbg = footHitboxCache.get(foot.id);
            if (!fdbg) {
                fdbg = document.createElement("div");
                fdbg.className = "foot-hitbox";
                fdbgLayer.appendChild(fdbg);
                footHitboxCache.set(foot.id, fdbg);
            }
            if (!sprite) {
                fdbg.style.display = "none"; // idle: 박스도 숨김
            } else {
                const fb = foot.getBox();
                fdbg.style.display = "block";
                fdbg.style.left = `${fb.x}px`;
                fdbg.style.top = `${fb.y}px`;
                fdbg.style.width = `${fb.w}px`;
                fdbg.style.height = `${fb.h}px`;
            }
        }
    }
}

/** 맵 밖으로 나간 사람의 발 DOM 을 제거 (humanWalk 가 호출). */
function removeHumanDom(human) {
    for (const foot of human.feet) {
        const el = footDomCache.get(foot.id);
        if (el) el.remove();
        footDomCache.delete(foot.id);

        // 디버그 히트박스도 제거
        const fdbg = footHitboxCache.get(foot.id);
        if (fdbg) fdbg.remove();
        footHitboxCache.delete(foot.id);
    }
}

/** 새 게임 시작 시 발 DOM 전부 비우기 (main.js 가 호출). */
function clearHumanLayer() {
    footDomCache.clear();
    const layer = $("human-layer");
    if (layer) layer.innerHTML = "";

    // 디버그 히트박스도 정리
    footHitboxCache.clear();
    const fdbgLayer = $("foot-hitbox-layer");
    if (fdbgLayer) fdbgLayer.innerHTML = "";
}

/** 폐 게이지 채움/숫자 반영. clip-path로 아래서 위로 채운다 */
function renderGauge() {
    const { LUNG_GAUGE_MAX, LUNG } = DATA.CONFIG;

    // 1. 게이지 비율 (0 ~ 1)
    const ratio = STATE.playerLungGauge / LUNG_GAUGE_MAX;

    // 2. SEGMENTS 조각으로 끊기 (계단식). floor → 한 조각을 "채워야" 올라감.
    const stepped = Math.floor(ratio * LUNG.SEGMENTS) / LUNG.SEGMENTS;

    // 3. 천장 적용: 가득 차도 위에서 FILL_TOP_PERCENT 지점까지만 채운다.
    const fillableRange = 100 - LUNG.FILL_TOP_PERCENT; // 실제로 채울 세로 범위(%)
    const fromTop = 100 - stepped * fillableRange; // inset 으로 위에서 잘라낼 %

    $("lung-fill").style.clipPath = `inset(${fromTop}% 0 0 0)`;
    $("gauge-value").textContent =
        `${STATE.playerLungGauge} / ${LUNG_GAUGE_MAX}`;
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

    // 디버그 히트박스도 정리
    cigHitboxCache.clear();
    const dbgLayer = $("cig-hitbox-layer");
    if (dbgLayer) dbgLayer.innerHTML = "";
}
