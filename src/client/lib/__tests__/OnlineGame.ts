jest.mock('socket.io-client', () => ({
    default: jest.fn(),
}));

import socketio from 'socket.io-client';

import Socket from '../../../common/__mocks__/Socket.mock';

import OnlineGame from '../OnlineGame';
import OnlinePhase from '../OnlinePhase';
import Phase from '../Phase';

describe('OnlineGame', () => {
    class MyGame extends OnlineGame {};
    class MyPhase extends Phase {
        static id = 'MyPhase';
    }
    class MyOnlinePhase extends OnlinePhase {
        static id = 'MyOnlinePhase';
    }

    let domContainer;
    let game;
    let mockedSocket;

    beforeEach(() => {
        domContainer = document.createElement('div');
        game = new MyGame(domContainer);
        game.registerPhases([MyPhase, MyOnlinePhase]);

        mockedSocket = new Socket();

        socketio.mockReset();
        socketio.mockReturnValue(mockedSocket);
    });

    describe('constructor', () => {
        it('should correctly init instance', () => {
            expect((game as any).socket).toBeNull();
        });
    });

    describe('addPlayer', () => {
        it('should add given player data to list of players', () => {
            expect(game.players).toEqual({});

            game.addPlayer({
                uniqId: 42,
                name: 'Foo:bar',
            });

            expect(game.players).toEqual({
                42: { uniqId: 42, name: 'Foo:bar' },
            });
        });
    });

    describe('connect', () => {
        it('should connect to socket.io server', () => {
            game.connect(1337, 'https://my-server');
            expect(socketio).toHaveBeenCalledWith('https://my-server:1337')
        });

        it('should connect to current location by default', () => {
            game.connect(1337);
            expect(socketio).toHaveBeenCalledWith('http://my-tests.com:1337')
        });

        it('should connect to server without port', () => {
            game.connect();
            expect(socketio).toHaveBeenCalledWith('http://my-tests.com')
        });
    });

    describe('getSocket', () => {
        it('should return instance socket', () => {
            game.connect(1337);
            expect(game.getSocket()).toBe(mockedSocket);
        });
    });

    describe('goToPhase', () => {
        let normalPhase;
        let onlinePhase;

        beforeEach(() => {
            normalPhase = new MyPhase(game);
            onlinePhase = new MyOnlinePhase(game);

            normalPhase.attachSocketEvent = jest.fn();
            onlinePhase.attachSocketEvent = jest.fn();
            normalPhase.removeSocketEvent = jest.fn();
            onlinePhase.removeSocketEvent = jest.fn();
        });

        it('should remove socket event from current online phase', () => {
            game.currentPhase = onlinePhase;

            game.goToPhase(normalPhase);

            expect(onlinePhase.removeSocketEvent).toHaveBeenCalledWith(game.socket);
        });

        it('should NOT remove socket event from current normal phase', () => {
            game.currentPhase = normalPhase;

            game.goToPhase(onlinePhase);

            expect(normalPhase.removeSocketEvent).not.toHaveBeenCalled();
        });

        it('should add socket event on new online phase', () => {
            game.goToPhase(onlinePhase);

            expect(onlinePhase.attachSocketEvent).toHaveBeenCalledWith(game.socket);
        });

        it('should NOT add socket event on new normal phase', () => {
            game.goToPhase(normalPhase);

            expect(normalPhase.attachSocketEvent).not.toHaveBeenCalled();
        });
    });

    describe('ludumjs_gameJoined', () => {
        it('should store game and player uniqIds from server', () => {
            game.ludumjs_gameJoined(null, {
                gameUniqId: 123,
                playerUniqId: 456,

            });

            expect(game.gameUniqId).toBe(123);
            expect(game.playerUniqId).toBe(456);
        });
    });

    describe('ludumjs_newPlayerJoined', () => {
        it('should call addPlayer method', () => {
            game.addPlayer = jest.fn();

            game.ludumjs_newPlayerJoined(null, 'foo:bar');

            expect(game.addPlayer).toHaveBeenCalledWith('foo:bar');
        });
    });

    describe('ludumjs_gameFull', () => {
        it('should set list of players', () => {
            game.playerUniqId = '1';
           
            game.ludumjs_gameFull(null, [
                { uniqId: '1' },
                { uniqId: '2' },
                { uniqId: '3' },
            ]);

            expect(game.players).toEqual({
                1: { uniqId: '1' },
                2: { uniqId: '2' },
                3: { uniqId: '3' },
            });
        });
    });

    describe('ludumjs_switchPhase', () => {
        it('should go to given phase', () => {
            spyOn(game, 'goToPhaseById');

            game.ludumjs_switchPhase(null, {
                phaseName: 'TestPhase',
                data: ['foo', 'bar'],

            });

            expect(game.goToPhaseById).toHaveBeenCalledWith('TestPhase', 'foo', 'bar');
        });
    });
});
