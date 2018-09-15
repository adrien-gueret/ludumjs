export default function(condition: boolean, errorMessage: string = 'Unknwon error'): void {
    if (!condition) {
        throw new Error(`[LudumJS] ${errorMessage}`);
    }
}