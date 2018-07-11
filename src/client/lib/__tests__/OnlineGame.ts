jest.mock('socket.io-client', () => ({
    default: jest.fn(),
}));

import socketio from 'socket.io-client';
import OnlineGame from '../OnlineGame';

describe('OnlineGame', () => {
    class MyGame extends OnlineGame {};

    let domContainer;
    let game;
    let mockedSocket;

    beforeEach(() => {
        domContainer = document.createElement('div');
        game = new MyGame(domContainer);

        mockedSocket = {
            on: jest.fn(),
        },

        socketio.mockReset();
        socketio.mockReturnValue(mockedSocket);
    });

    describe('constructor', () => {
        it('should correctly init instance', () => {
            expect((game as any).socket).toBeNull();
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
    });

    describe('getSocket', () => {
        it('should return instance socket', () => {
            game.connect(1337);
            expect(game.getSocket()).toBe(mockedSocket);
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
