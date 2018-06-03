import { random } from '../math';

describe('utils/math', () => {
    describe('random', () => {
        it('should return an integer between given values', () => {
            for (let i = 0; i < 100; i++) {
                const randomValue = random(-5, 5);
                
                expect(randomValue).toBeGreaterThanOrEqual(-5);
                expect(randomValue).toBeLessThanOrEqual(5);
            }
        });
    });
});
