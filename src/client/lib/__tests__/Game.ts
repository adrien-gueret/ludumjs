import Game from '../Game';

describe('Game', () => {
    class MyGame extends Game {};
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

        it('should store dialogs elements', () => {
           expect(game.dialogs.length).toBe(2);

           expect(game.dialogs.every(dialog => dialog.classList.contains('ludumjs-dialog'))).toBe(true);
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
