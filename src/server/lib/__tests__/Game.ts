jest.mock('socket.io', () => jest.fn(() => ({
    emit: jest.fn(),
    on: jest.fn(),
    disconnect: jest.fn(),
    removeAllListeners: jest.fn(),
})));

import * as socketio from 'socket.io';
import Game from '../Game';

describe('Game', () => {
    class MyGame extends Game {};
    let game;
    let socket;

    beforeEach(() => {
        socket = socketio();
        game = new MyGame(socket);
    });

    describe('constructor', () => {
        it('should correctly init instance', () => {
            expect((game as any).onEndCallbacks).toEqual([]);
            expect((game as any).sockets).toEqual([socket]);
        });
    });

    describe('getSockets', () => {
        it('should return instance sockets', () => {
            const sockets = game.getSockets();

            expect(sockets).toEqual([socket]);
        });
    });

    describe('join', () => {
        it('should append given socket to list of sockets', () => {
            const socket2 = socketio();

            game.join(socket2);

            const sockets = game.getSockets();

            expect(sockets).toEqual([socket, socket2]);
        });
    });

    describe('onEnd', () => {
        it('should append given callback to list of onEnd callbacks', () => {
            const callback = jest.fn();
            
            game.onEnd(callback);

            expect((game as any).onEndCallbacks).toEqual([callback]);
        });
    });

    describe('end', () => {
        it('should run all onEnd callbacks', () => {
            const callback = jest.fn();
            const callback2 = jest.fn();
            
            game.onEnd(callback);
            game.onEnd(callback2);

            game.end();

            expect(callback).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });

        it('should reset each attached socket', () => {
            game.end();

            expect(socket.removeAllListeners).toHaveBeenCalled();
            expect(socket.disconnect).toHaveBeenCalledWith(true);
        });

        it('should reset list of sockets', () => {
            expect((game as any).sockets.length).toBe(1);

            game.end();

            expect((game as any).sockets.length).toBe(0);
        });
    });

    describe('emitSwitchPhase', () => {
        it('should emit switchPhase event to each attached sockets', () => {
            game.emitSwitchPhase('TestPhase', 'foo', 'bar');

            expect(socket.emit).toHaveBeenCalledWith(
                'ludumjs_switchPhase',
                {
                    phaseName: 'TestPhase',
                    data: ['foo', 'bar'],
                }
            );
        });
    });
});
