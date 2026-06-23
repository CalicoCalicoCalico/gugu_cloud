// ═══════════════════════════════════════════════════════
// helpers.js — 공용 유틸리티
// 대응 TDD: 없음 (인프라). 여러 시스템이 공유하는 작은 순수 함수들.
//
// 엽전인생 프로젝트의 $() 헬퍼 패턴을 그대로 가져왔다.
// ═══════════════════════════════════════════════════════

/** document.getElementById 축약 */
function $(id) {
    return document.getElementById(id);
}

/** 값을 [min, max] 범위로 가둔다 (도메인 clamp — TDD 4단계 도메인 강제용) */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * AABB(축 정렬 박스) 겹침 판정.
 * a, b 는 각각 { x, y, w, h } (좌상단 기준).
 * 부작용 없는 순수 함수 — TDD 5단계 isColliding() 의 본체.
 * @returns {boolean}
 */
function aabbOverlap(a, b) {
    return (
        a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    );
}

/**
 * 배열에서 무작위 원소 하나를 고른다. (여러 적이 공용으로 쓰는 헬퍼)
 * 예: pickRandomElement(["fast", "slow"]) → "fast" 또는 "slow"
 * @param {Array} inputArray
 * @returns {*} 배열의 무작위 원소
 */
function pickRandomElement(inputArray) {
    // TODO(주림): inputArray 길이로 랜덤 인덱스(0 ~ length-1)를 만들어 그 원소를 반환.
}

/**
 * 주어진 확률(chance, 0~1)로 true 를 돌려준다. (여러 적이 공용으로 쓰는 헬퍼)
 * 예: pickRandomBool(0.5) → 절반 확률로 true
 * @param {number} chance 0~1 사이 확률
 * @returns {boolean}
 */
function pickRandomBool(chance) {
    // TODO(주림): Math.random() 과 chance 를 비교해 true/false 반환.
}
