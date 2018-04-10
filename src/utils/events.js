export function getClickEvent(windowObject = window) {
    return 'ontouchstart' in windowObject ? 'touchstart' : 'click';
}