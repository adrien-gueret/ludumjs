import { getClickEvent } from '../events';

describe('utils/events', () => {
    describe('getClickEvent', () => {
        it('should return "click"', () => {
            expect(getClickEvent()).toBe('click');
        });

        it('should return "touchstart" in given object supports ontouchstart', () => {
            window.ontouchstart = jest.fn();

            expect(getClickEvent(window)).toBe('touchstart');
        });
    });
});
