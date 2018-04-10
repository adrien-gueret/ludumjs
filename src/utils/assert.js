export default function(condition, errorMessage = 'Unknwon error', Exception = Error) {
    if (!condition) {
        throw new Exception(`[LudumJS] ${errorMessage}`);
    }
}