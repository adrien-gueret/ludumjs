import { random } from './math';

export function shuffleArray<T>(array: Array<T>): Array<T> {
    for (let i = array.length - 1; i > 0; i -= 1) {
        const j = random(0, i);
        const temp = array[i];

        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}

export default {
    shuffleArray,
};