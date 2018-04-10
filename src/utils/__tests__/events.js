import { getClickEvent } from '../events.js';

describe('utils/events', () => {
    describe('getClickEvent', () => {
        it('should return "click"', () => {
            expect(getClickEvent()).toBe('click');
        });

        it('should return "touchstart" in given object supports ontouchstart', () => {
            expect(getClickEvent({
                ontouchstart() {}
            })).toBe('touchstart');
        });
    });
});
