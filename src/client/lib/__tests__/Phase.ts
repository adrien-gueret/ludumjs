import Game from '../Game';
import Phase from '../Phase';

describe('Phase', () => {
    let MyGame;
    let MyPhase;

    beforeEach(() => {
        MyGame = class extends Game {};
        MyPhase = class extends Phase {
            name = 'MyPhase';
            onClick() {}
        };
    });

    describe('constructor', () => {
        it('should correctly init instance', () => {
            const game = new MyGame(document.createElement('div'));
            const phase = new MyPhase(game);

            expect(phase.game).toBe(game);
            expect(phase.onClick).toBeInstanceOf(Function);
        });

        it('should set onClick to null if not defined', () => {
            MyPhase = class extends Phase {
                name = 'MyPhase';
            };

            const game = new MyGame(document.createElement('div'));
            const phase = new MyPhase(game);

            expect(phase.game).toBe(game);
            expect(phase.onClick).toBeNull();
        });
    });

    describe('other methods', () => {
        let phase;

        beforeEach(() => {
            phase = new MyPhase(new MyGame(document.createElement('div')));
        });

        describe('getClassName', () => {
            it('should return snake-case class name', () => {
                const className = phase.getClassName();

                expect(className).toBe('my-phase');
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

            it('should NOT listen for click event if onClick is null', () => {
                const { domContainer } = phase.game;
                domContainer.addEventListener = jest.fn();
                phase.onClick = null;

                phase.start();

                expect(domContainer.addEventListener).not.toHaveBeenCalled();
            });

            it('should add phase className to game dom container', () => {
                const { domContainer } = phase.game;
                domContainer.classList.add = jest.fn();

                phase.start();

                expect(domContainer.classList.add).toHaveBeenCalledWith('my-phase');
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

            it('should NOT remove listener for click event is onClick is null', () => {
                const { domContainer } = phase.game;
                domContainer.removeEventListener = jest.fn();
                phase.onClick = null;

                phase.end();

                expect(domContainer.removeEventListener).not.toHaveBeenCalled();
            });

            it('should remove phase className from game dom container', () => {
                const { domContainer } = phase.game;
                domContainer.classList.remove = jest.fn();

                phase.end();

                expect(domContainer.classList.remove).toHaveBeenCalledWith('my-phase');
            });
        });
    });
});
