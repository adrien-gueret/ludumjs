export default function(condition: boolean, errorMessage: string = 'Unknwon error', Exception: { new (string?): Error } = Error): void {
    if (!condition) {
        throw new Exception(`[LudumJS] ${errorMessage}`);
    }
}