import { rollDice, rollDices } from '../dices';

describe('utils/doces', () => {
    describe('rollDice', () => {
        it('should return an integer between 1 and 6', () => {
            for (let i = 0; i < 100; i++) {
                const randomValue = rollDice();
                
                expect(randomValue).toBeGreaterThanOrEqual(1);
                expect(randomValue).toBeLessThanOrEqual(6);
            }
        });

        it('should return an integer between 1 and given value', () => {
            for (let i = 0; i < 100; i++) {
                const randomValue = rollDice(100);
                
                expect(randomValue).toBeGreaterThanOrEqual(1);
                expect(randomValue).toBeLessThanOrEqual(100);
            }
        });
    });

    describe('rollDices', () => {
        it('should return an array of integers between 1 and 6', () => {
            for (let i = 0; i < 100; i++) {
                const randomValues = rollDices(3);

                expect(randomValues).toHaveLength(3);
                
                randomValues.forEach((randomValue) => {
                    expect(randomValue).toBeGreaterThanOrEqual(1);
                    expect(randomValue).toBeLessThanOrEqual(6);
                });
            }
        });

        it('should return an array of integers between 1 and given value', () => {
            for (let i = 0; i < 100; i++) {
                const randomValues = rollDices(3, 100);

                expect(randomValues).toHaveLength(3);
                
                randomValues.forEach((randomValue) => {
                    expect(randomValue).toBeGreaterThanOrEqual(1);
                    expect(randomValue).toBeLessThanOrEqual(100);
                });
            }
        });
    });
});
