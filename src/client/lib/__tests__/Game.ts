import Game from '../Game';

describe('Game', () => {
    describe('constructor', () => {
        it('should correctly init instance', () => {
            class MyGame extends Game {};

            const domContainer = document.createElement('div');
            const game = new MyGame(domContainer);

            expect(game.domContainer).toBe(domContainer);
            expect(domContainer.classList.contains('ludumjs-game-container')).toBe(true);
        });
    });
});
