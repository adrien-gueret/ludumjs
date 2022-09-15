export function getClickEvent(windowObject: Window = window): 'touchstart' | 'click' {
    return 'ontouchstart' in windowObject ? 'touchstart' : 'click';
}