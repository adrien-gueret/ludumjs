export default function(condition: boolean, errorMessage: string = 'Unknwon error', Exception: ErrorConstructor = Error): void {
    if (!condition) {
        throw new Exception(`[LudumJS] ${errorMessage}`);
    }
}