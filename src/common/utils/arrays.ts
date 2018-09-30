import { random } from './math';

export function shuffleArray<T>(array: Array<T>): Array<T> {
    const newArray = [...array];
    
    for (let i = newArray.length - 1; i > 0; i -= 1) {
        const j = random(0, i);
        const temp = newArray[i];

        newArray[i] = newArray[j];
        newArray[j] = temp;
    }

    return newArray;
}

export function convert1DIndexInto2DIndex(index: number, nbrColumnsIn2DArray: number)
    : { row: number; column: number; } {
   
    return {
        row: Math.floor(index / nbrColumnsIn2DArray ),
        column: (index % nbrColumnsIn2DArray),
    };
}

export function getRandomItem<T>(array: Array<T>): T {
    return array[Math.floor(Math.random() * array.length)];
}

export default {
    shuffleArray,
    convert1DIndexInto2DIndex,
    getRandomItem,
};