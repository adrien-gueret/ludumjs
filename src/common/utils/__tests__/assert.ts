import assert from '../assert';

describe('utils/assert', () => {
    describe('when receiving true', () => {
        it('should NOT throw', () => {
            expect(() => assert(true)).not.toThrow();
        });
    });

    describe('when receiving false', () => {
        it('should throw', () => {
            expect(() => assert(false)).toThrow();
        });
    
        it('should throw specific message', () => {
            expect(() => assert(false, 'boom')).toThrow('[LudumJS] boom');
        });
    });
});
