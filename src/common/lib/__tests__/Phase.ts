import Game from '../Game';
import Phase from '../Phase';

describe('Phase', () => {
    let MyGame;
    let MyPhase;

    beforeEach(() => {
        MyGame = class extends Game {};
        MyPhase = class extends Phase {
            onStart() {}
            onEnd() {}
        };
    });

    describe('constructor', () => {
        it('should correctly init instance', () => {
            const game = new MyGame();
            const phase = new MyPhase(game);

            expect(phase.game).toBe(game);
        });
    });

    describe('other methods', () => {
        let phase;

        beforeEach(() => {
            phase = new MyPhase(new MyGame());
        });

        describe('start', () => {
            it('should call onStart', () => {
                phase.onStart = jest.fn();

                phase.start('foo', 'bar');

                expect(phase.onStart).toHaveBeenCalledWith('foo', 'bar');
            });
        });

        describe('end', () => {
            it('should call onEnd', () => {
                phase.onEnd = jest.fn();

                phase.end();

                expect(phase.onEnd).toHaveBeenCalled();
            });
        });
    });
});
