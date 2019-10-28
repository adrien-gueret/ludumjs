import * as socketio from 'socket.io';
import Player from '../Player';

describe('Player', () => {
    describe('constructor', () => {
        it('should correctly init instance', () => {
            const player = new Player(null);
            expect(player.socket).toBe(null);
            expect((player as any).customData).toEqual({});

            const player2 = new Player(null, { name: 'Foo' });
            expect((player2 as any).customData).toEqual({ name: 'Foo' });
        });
    });

    describe('setSocket', () => {
        it('should disconnect current socket', () => {
            const currentSocket: any = { disconnect: jest.fn() };
            const newSocket: any = {};

            const player = new Player(currentSocket);

            player.setSocket(newSocket);

            expect(currentSocket.disconnect).toHaveBeenCalled();
            expect(player.socket).toBe(newSocket);
        });
    });
});
