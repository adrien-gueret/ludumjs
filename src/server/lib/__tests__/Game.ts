jest.mock('socket.io');

import Socket from '../../../common/__mocks__/Socket.mock';

import Game from '../Game';
import Phase from '../Phase';

describe('Game', () => {
    class MyGame extends Game {};
    class MyPhase extends Phase {};
    let game;
    let socket;
    let ioServer;
    let emitToAllSocket;

    beforeEach(() => {
        emitToAllSocket = jest.fn();

        ioServer = {
            to: jest.fn(() => ({
                emit: emitToAllSocket,
            })),
        };
        socket = new Socket();
        game = new MyGame(socket);
        game.setIo(ioServer);
    });

    describe('constructor', () => {
        it('should correctly init instance', () => {
            expect((game as any).onEndCallbacks).toEqual([]);
            expect((game as any).players.length).toBe(1);
        });
    });

    describe('getPlayers', () => {
        it('should return instance players', () => {
            const players = game.getPlayers();

            expect(players).toBe((game as any).players);
        });
    });

    describe('getSockets', () => {
        it('should return instance sockets', () => {
            const sockets = game.getSockets();

            expect(sockets).toEqual([socket]);
        });
    });

    describe('goToPhase', () => {
        let currentPhase;
        let newPhase;

        beforeEach(() => {
            currentPhase = new MyPhase(null);
            newPhase = new MyPhase(null);

            currentPhase.removeSocketEvent = jest.fn();
            newPhase.attachSocketEvent = jest.fn();
        });

        it('should remove socket listeners from current phase', () => {
            game.currentPhase = currentPhase;

            game.goToPhase(newPhase);

            expect(currentPhase.removeSocketEvent).toHaveBeenCalledWith(socket);
        });

        it('should attach socket listeners to new phase', () => {
            game.goToPhase(newPhase);

            expect(newPhase.attachSocketEvent).toHaveBeenCalledWith(socket);
        });
    });

    describe('join', () => {
        it('should append given socket to list of sockets', () => {
            const socket2 = new Socket();

            game.join(socket2);

            const sockets = game.getSockets();

            expect(sockets).toEqual([socket, socket2]);
        });

        it('should attach socket events of current phase if it exists', () => {
            const currentPhase = new MyPhase(null);
            const socket2 = new Socket();

            currentPhase.attachSocketEvent = jest.fn();

            game.currentPhase = currentPhase;
            game.join(socket2);

            expect(currentPhase.attachSocketEvent).toHaveBeenCalledWith(socket2);
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

        it('should reset list of players', () => {
            expect((game as any).players.length).toBe(1);

            game.end();

            expect((game as any).players.length).toBe(0);
        });
    });

    describe('emitToAllPlayers', () => {
        it('should emit given event to all sockets', () => {
            game.emitToAllPlayers('MyEvent');

            expect(emitToAllSocket).toHaveBeenCalledWith('MyEvent', {});
        });

        it('should emit given event with given data to all sockets', () => {
            const data = { foo: 'bar' };
            game.emitToAllPlayers('MyEvent', data);

            expect(emitToAllSocket).toHaveBeenCalledWith('MyEvent', data);
        });
    });

    describe('emitSwitchPhase', () => {
        it('should emit switchPhase event to all sockets', () => {
            game.emitSwitchPhase('TestPhase', 'foo', 'bar');

            expect(emitToAllSocket).toHaveBeenCalledWith(
                'ludumjs_switchPhase',
                {
                    phaseName: 'TestPhase',
                    data: ['foo', 'bar'],
                }
            );
        });
    });
});
