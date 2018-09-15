import { shuffleArray, convert1DIndexInto2DIndex } from '../arrays';

describe('utils/arrays', () => {
    describe('shuffleArray', () => {
        let array;

        beforeEach(() => {
            array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        });

        it('should return a new shuffled array', () => {
            const shuffled = shuffleArray(array);
            expect(shuffled).not.toEqual(array);
        });
    });

    describe('convert1DIndexInto2DIndex', () => {
        it('should convert an index from 1D array to coordinates of 2D array', () => {
            const array = [
                1, 2, 3,
                4, 5, 6,
                7, 8, 9,
            ]
            const totalOfColumns = 3;

            const indexOf5 = 4;
            const indexOf5In2DArray = convert1DIndexInto2DIndex(indexOf5, totalOfColumns);

            expect(indexOf5In2DArray).toEqual({ row: 1, column: 1 });
        });
    });
});
