import Game from '../Game';
import Phase from '../Phase';

describe('Phase', () => {
    let MyGame;
    let MyPhase;

    beforeEach(() => {
        MyGame = class extends Game {};
        MyPhase = class extends Phase {
            static id = 'MyPhase';
            onAction() {}
        };
    });

    describe('constructor', () => {
        it('should correctly init instance', () => {
            const game = new MyGame(document.createElement('div'));
            const phase = new MyPhase(game);

            expect(phase.game).toBe(game);
            expect(phase.onActionHandler).toBeDefined();
        });

        it('should set onActionHandler to null if onAction is NOT defined', () => {
            MyPhase = class extends Phase {
                static id = 'MyPhase';
            };

            const game = new MyGame(document.createElement('div'));
            const phase = new MyPhase(game);

            expect(phase.game).toBe(game);
            expect(phase.onActionHandler).toBeNull();
        });

        it('should set onActionHandler to function if onAction is defined', () => {
            MyPhase = class extends Phase {
                static id = 'MyPhase';
                onAction() {};
            };

            const game = new MyGame(document.createElement('div'));
            const phase = new MyPhase(game);

            expect(phase.game).toBe(game);
            expect(phase.onActionHandler).toBeInstanceOf(Function);
        });
    });

    describe('other methods', () => {
        let phase;
        let game;

        beforeEach(() => {
            game = new MyGame(document.createElement('div'));
            phase = new MyPhase(game);
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

                expect(domContainer.addEventListener).toHaveBeenCalledWith('click', phase.onActionHandler);
            });

            it('should NOT listen for click event if onAction is null', () => {
                const { domContainer } = phase.game;
                domContainer.addEventListener = jest.fn();
                phase.onAction = null;

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

                expect(domContainer.removeEventListener).toHaveBeenCalledWith('click', phase.onActionHandler);
            });

            it('should NOT remove listener for click event is onAction is null', () => {
                const { domContainer } = phase.game;
                domContainer.removeEventListener = jest.fn();
                phase.onAction = null;

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

        describe('wrapOnAction', () => {
            let myEvent;
            let onActionWrapped;

            beforeEach(() => {
                myEvent = {
                    target: null,
                };

                onActionWrapped = phase.wrapOnAction();
                phase.onAction = jest.fn();
            });

            it('should NOT call onAction if event has no targets', () => {
                onActionWrapped(myEvent);
                expect(phase.onAction).not.toHaveBeenCalled();
            });

            it('should NOT call onAction if event has no targets with data-action', () => {
                const parentNode = document.createElement('div');
                myEvent.target = document.createElement('div');

                parentNode.appendChild(myEvent.target);

                onActionWrapped(myEvent);
                expect(phase.onAction).not.toHaveBeenCalled();
            });

            it('should call onAction if event has target with data-action', () => {
                const nodeWithAction = document.createElement('div');
                myEvent.target = document.createElement('div');

                nodeWithAction.dataset.action = 'test';
                nodeWithAction.appendChild(myEvent.target);

                onActionWrapped(myEvent);

                expect(phase.onAction).toHaveBeenCalledWith({
                    action: 'test',
                    event: myEvent,
                    target: nodeWithAction,
                });
            });
        });
    });
});
