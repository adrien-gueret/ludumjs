import Game from '../Game';
import Phase from '../Phase';

describe('Phase', () => {
    let MyGame;
    let MyPhase;

    beforeEach(() => {
        MyGame = class MyGame extends Game {};
        MyPhase = class MyPhase extends Phase {
            onStart() {}
            onEnd() {}
            onAction() {}
        };
    });

    describe('constructor', () => {
        it('should correctly init instance', () => {
            const game = new MyGame(document.createElement('div'));
            const phase = new MyPhase(game);

            expect(phase.game).toBe(game);
        });
    });

    describe('other methods', () => {
        let phase;
        let game;

        beforeEach(() => {
            game = new MyGame(document.createElement('div'));
            phase = new MyPhase(game);
        });

        describe('start', () => {
            it('should call onStart', async () => {
                phase.onStart = jest.fn();

                await phase.start('foo', 'bar');

                expect(phase.onStart).toHaveBeenCalledWith('foo', 'bar');
            });

            it('should listen for click event', async () => {
                const { domContainer } = phase.game;
                domContainer.addEventListener = jest.fn();

                await phase.start();

                expect(domContainer.addEventListener).toHaveBeenCalledWith('click', phase.onActionHandler);
            });

            it('should NOT listen for click event if onAction is null', async () => {
                const { domContainer } = phase.game;
                domContainer.addEventListener = jest.fn();
                phase.onAction = null;

                await phase.start();

                expect(domContainer.addEventListener).not.toHaveBeenCalled();
            });

            it('should add phase className to game dom container', async () => {
                const { domContainer } = phase.game;
                domContainer.classList.add = jest.fn();

                await phase.start();

                expect(domContainer.classList.add).toHaveBeenCalledWith('MyPhase');
            });

            it('should NOT alter game container if onStart return false', async () => {
                phase.onStart = jest.fn(() => false);

                const { domContainer } = phase.game;
                domContainer.addEventListener = jest.fn();
                domContainer.classList.add = jest.fn();

                await phase.start();

                expect(domContainer.addEventListener).not.toHaveBeenCalled();
                expect(domContainer.classList.add).not.toHaveBeenCalled();
            });

            it('should NOT alter game container if onStart return a promise resolving false', async () => {
                phase.onStart = jest.fn(async () => false);

                const { domContainer } = phase.game;
                domContainer.addEventListener = jest.fn();
                domContainer.classList.add = jest.fn();

                await phase.start();

                expect(domContainer.addEventListener).not.toHaveBeenCalled();
                expect(domContainer.classList.add).not.toHaveBeenCalled();
            });
        });

        describe('end', () => {
            it('should call onEnd', async () => {
                phase.onEnd = jest.fn();

                await phase.end();

                expect(phase.onEnd).toHaveBeenCalled();
            });

            it('should remove listener for click event', async () => {
                const { domContainer } = phase.game;
                domContainer.removeEventListener = jest.fn();

                await phase.end();

                expect(domContainer.removeEventListener).toHaveBeenCalledWith('click', phase.onActionHandler);
            });

            it('should NOT remove listener for click event is onAction is null', async () => {
                const { domContainer } = phase.game;
                domContainer.removeEventListener = jest.fn();
                phase.onAction = null;

                await phase.end();

                expect(domContainer.removeEventListener).not.toHaveBeenCalled();
            });

            it('should remove phase className from game dom container', async () => {
                const { domContainer } = phase.game;
                domContainer.classList.remove = jest.fn();

                await phase.end();

                expect(domContainer.classList.remove).toHaveBeenCalledWith('MyPhase');
            });

            it('should NOT alter game container if onEnd return false', async () => {
                phase.onEnd = jest.fn(() => false);

                const { domContainer } = phase.game;
                domContainer.removeEventListener = jest.fn();
                domContainer.classList.remove = jest.fn();

                await phase.end();

                expect(domContainer.removeEventListener).not.toHaveBeenCalled();
                expect(domContainer.classList.remove).not.toHaveBeenCalled();
            });

            it('should NOT alter game container if onEnd return a promise resolving false', async () => {
                phase.onStart = jest.fn(async () => false);

                const { domContainer } = phase.game;
                domContainer.removeEventListener = jest.fn();
                domContainer.classList.remove = jest.fn();

                await phase.start();

                expect(domContainer.removeEventListener).not.toHaveBeenCalled();
                expect(domContainer.classList.remove).not.toHaveBeenCalled();
            });
        });

        describe('onActionHandler', () => {
            let myEvent;

            beforeEach(() => {
                myEvent = {
                    target: null,
                };

                phase.onAction = jest.fn();
            });

            it('should NOT call onAction if event has no targets', () => {
                phase.onActionHandler(myEvent);
                expect(phase.onAction).not.toHaveBeenCalled();
            });

            it('should NOT call onAction if event has no targets with data-action', () => {
                const parentNode = document.createElement('div');
                myEvent.target = document.createElement('div');

                parentNode.appendChild(myEvent.target);

                phase.onActionHandler(myEvent);
                expect(phase.onAction).not.toHaveBeenCalled();
            });

            it('should call onAction if event has target with data-action', () => {
                const nodeWithAction = document.createElement('div');
                myEvent.target = document.createElement('div');

                nodeWithAction.dataset.action = 'test';
                nodeWithAction.appendChild(myEvent.target);

                phase.onActionHandler(myEvent);

                expect(phase.onAction).toHaveBeenCalledWith({
                    action: 'test',
                    event: myEvent,
                    target: nodeWithAction,
                });
            });
        });
    });
});
