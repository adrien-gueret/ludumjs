import Game from '../Game';
import Phase from '../Phase';

describe('Game', () => {
    class MyGame extends Game {};
    class MyPhase extends Phase {};
    let gameContainer;
    let game;

    beforeEach(() => {
        document.body.innerHTML = `
        <div id="container">
            <div data-dialog="dialog-test">Dialog Test</div>
            <div data-dialog="dialog-test-2">Dialog Test 2</div>
        </div>`;

        gameContainer = document.getElementById('container');
        game = new MyGame(gameContainer);

        jest.useFakeTimers();
    });

    describe('constructor', () => {
        it('should correctly init DOM container', () => {
            expect(game.domContainer).toBe(gameContainer);
            expect(gameContainer.classList.contains('ludumjs-game-container')).toBe(true);
        });

        it('should correctly init phases', () => {
            expect(game.phases).toEqual([]);
            expect(game.currentPhase).toBeNull();
        });

        it('should store dialogs elements', () => {
           expect(game.dialogs.length).toBe(2);

           expect(game.dialogs.every(dialog => dialog.classList.contains('ludumjs-dialog'))).toBe(true);
        });
    });

    describe('start', () => {
        it('should go to first phase', () => {
            const phase1 = new MyPhase(game);
            const phase2 = new MyPhase(game);
            
            game.phases = [phase1, phase2];
            game.goToPhase = jest.fn();

            game.start();

            expect(game.goToPhase).toHaveBeenCalledWith(phase1);
        });
    });

    describe('registerPhase', () => {
        it('should throw if given class does not inherit from Phase', () => {
            class Test {}
            expect(() => game.registerPhase(Test)).toThrow();
        });

        it('should register instance of given Phase class if all is OK', () => {
            game.registerPhase(MyPhase);

            const phase = game.phases[0];

            expect(phase).toBeInstanceOf(MyPhase);
            expect(phase.game).toBe(game);
        });

        it('should throw if given class is already registered', () => {
            game.registerPhase(MyPhase);

            expect(() => game.registerPhase(MyPhase)).toThrow();
        });
    });

    describe('registerPhases', () => {
        it('should register all given phases classes', () => {
            class MyPhase2 extends Phase {}
            game.registerPhase = jest.fn();

            game.registerPhases([MyPhase, MyPhase2]);

            expect(game.registerPhase).toHaveBeenCalledWith(MyPhase);
            expect(game.registerPhase).toHaveBeenCalledWith(MyPhase2);
        });
    });

    describe('getPhaseByName', () => {
        class MyPhase2 extends Phase {}

        beforeEach(() => {
            game.registerPhases([MyPhase, MyPhase2]);
        });

        it('should return corresponding phase', () => {
            const phase = game.getPhaseByName('MyPhase2');
            expect(phase).toBeInstanceOf(MyPhase2);
        });

        it('should return undefined if phase is not found', () => {
            const phase = game.getPhaseByName('MyPhase3');
            expect(phase).toBeUndefined();
        });
    });

    describe('goToPhase', () => {
        let currentPhase;
        let newPhase;

        beforeEach(() => {
            currentPhase = new MyPhase(game);
            newPhase = new MyPhase(game);

            currentPhase.end = jest.fn();
            newPhase.start = jest.fn();
        });


        it('should end current phase', () => {
            game.currentPhase = currentPhase;

            game.goToPhase(newPhase);

            expect(currentPhase.end).toHaveBeenCalled();
        });

        it('should start new phase', () => {
            game.goToPhase(newPhase);

            expect(newPhase.start).toHaveBeenCalled();
        });

        it('should start new phase with given data', () => {
            game.goToPhase(newPhase, 'foo', 'bar');

            expect(newPhase.start).toHaveBeenCalledWith('foo', 'bar');
        });
    });

    describe('goToPhaseByName', () => {
        it('should be an helper for goToPhase method', () => {
            game.registerPhase(MyPhase);
            game.goToPhase = jest.fn();

            game.goToPhaseByName('MyPhase', 'foo', 'bar');

            expect(game.goToPhase).toHaveBeenCalledWith(expect.any(MyPhase), 'foo', 'bar');
        });
    });

    describe('getDialog', () => {
        it('should return corresponding dialog', () => {
            const dialog = game.getDialog('dialog-test');
            expect(dialog.innerHTML).toBe('Dialog Test');
        });

        it('should return NULL if dialog is not found', () => {
            const dialog = game.getDialog('azertyuiop');
            expect(dialog).toBe(null);
        });
    });

    describe('showDialog', () => {
        it('should add "visible" class to dialog', () => {
            const dialog = game.showDialog('dialog-test');

            jest.runAllTimers();

            expect(dialog.classList.contains('ludumjs-dialog--visible')).toBe(true);
        });

        it('should wrap dialog into a container', () => {
            const dialog = game.showDialog('dialog-test');

            jest.runAllTimers();

            const container = dialog.parentNode;

            expect(container).not.toBe(gameContainer);
            expect(container.classList.contains('ludumjs-dialogs-container')).toBe(true);
        });

        it('should throw if dialog is not found', () => {
            expect(() => game.showDialog('azertyuiop')).toThrow();
        });
    });

    describe('hideDialog', () => {
        it('should remove "visible" class to dialog', () => {
            const dialog = game.showDialog('dialog-test');
            jest.runAllTimers();

            game.hideDialog('dialog-test');

            expect(dialog.classList.contains('ludumjs-dialog--visible')).toBe(false);
        });

        it('should unwrap dialog from its container', () => {
            const dialog = game.showDialog('dialog-test');
            jest.runAllTimers();

            game.hideDialog('dialog-test');
            jest.runAllTimers();

            const container = dialog.parentNode;

            expect(container).toBe(gameContainer);
            expect(container.classList.contains('ludumjs-dialogs-container')).toBe(false);
        });

        it('should throw if dialog is not found', () => {
            expect(() => game.hideDialog('azertyuiop')).toThrow();
        });

        it('should throw if dialog is hidden', () => {
            expect(() => game.hideDialog('dialog-test')).toThrow();
        });
    });
});
