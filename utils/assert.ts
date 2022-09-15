export default function(condition: boolean, errorMessage: string = 'Unknwon error', Exception: { new (string?): Error } = Error): condition is true {
    if (!condition) {
        throw new Exception(`[LudumJS] ${errorMessage}`);
    }

    return true;
}