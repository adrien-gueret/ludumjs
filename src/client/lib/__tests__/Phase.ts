import Game from '../Game';
import Phase from '../Phase';

describe('Phase', () => {
    describe('constructor', () => {
        it('should correctly init instance', () => {
            const game = new Game(document.createElement('div'));
            const phase = new Phase(game);

            expect(phase.game).toBe(game);
        });
    });

    describe('other methods', () => {
        let phase;

        beforeEach(() => {
            class MyAwesomeTestPhase extends Phase {}
            phase = new MyAwesomeTestPhase(new Game(document.createElement('div')));
        });

        describe('getClassName', () => {
            it('should return snake-case class name', () => {
                const className = phase.getClassName();

                expect(className).toBe('my-awesome-test-phase');
            });
        });

        describe('start', () => {
            it('should call onStart', () => {
                phase.onStart = jest.fn();

                phase.start('foo', 'bar');

                expect(phase.onStart).toHaveBeenCalledWith('foo', 'bar');
            });

            it('should listen for click event', () => {
                const { domContainer } = phase.game;
                domContainer.addEventListener = jest.fn();

                phase.start();

                expect(domContainer.addEventListener).toHaveBeenCalledWith('click', phase.onClick);
            });

            it('should add phase className to game dom container', () => {
                const { domContainer } = phase.game;
                domContainer.classList.add = jest.fn();

                phase.start();

                expect(domContainer.classList.add).toHaveBeenCalledWith('my-awesome-test-phase');
            });

            it('should NOT alter game container if onStart return false', () => {
                phase.onStart = jest.fn(() => false);

                const { domContainer } = phase.game;
                domContainer.addEventListener = jest.fn();
                domContainer.classList.add = jest.fn();

                phase.start();

                expect(domContainer.addEventListener).not.toHaveBeenCalled();
                expect(domContainer.classList.add).not.toHaveBeenCalled();
            });
        });

        describe('end', () => {
            it('should call onEnd', () => {
                phase.onEnd = jest.fn();

                phase.end();

                expect(phase.onEnd).toHaveBeenCalled();
            });

            it('should remove listener for click event', () => {
                const { domContainer } = phase.game;
                domContainer.removeEventListener = jest.fn();

                phase.end();

                expect(domContainer.removeEventListener).toHaveBeenCalledWith('click', phase.onClick);
            });

            it('should remve phase className from game dom container', () => {
                const { domContainer } = phase.game;
                domContainer.classList.remove = jest.fn();

                phase.end();

                expect(domContainer.classList.remove).toHaveBeenCalledWith('my-awesome-test-phase');
            });
        });
    });
});
