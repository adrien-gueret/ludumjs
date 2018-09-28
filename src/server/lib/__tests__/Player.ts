import Player from '../Player';

describe('Game', () => {
    describe('constructor', () => {
        it('should correctly init instance', () => {
            const player = new Player(null);
            expect(player.socket).toBe(null);
            expect((player as any).customData).toEqual({});

            const player2 = new Player(null, { name: 'Foo' });
            expect((player2 as any).customData).toEqual({ name: 'Foo' });
        });
    });
});
