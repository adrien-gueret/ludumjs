export function getClickEvent(windowObject:Window = window):string {
    return 'ontouchstart' in windowObject ? 'touchstart' : 'click';
}