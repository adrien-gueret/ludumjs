import Socket from '../../../common/__mocks__/Socket.mock';

import { GameAlreadyFullError, GameNotFoundError } from '../../errors'

const mockIoSocket = new Socket();

jest.mock('socket.io', () => jest.fn(() => ({
    on: jest.fn(),
    to: jest.fn(() => mockIoSocket),
})));

import * as socketio from 'socket.io';
import GameFactory from '../GameFactory';
import Game from '../Game';

describe('GameFactory', () => {
    class MyGameFactory extends GameFactory {};
    class MyGame extends Game {};
    let factory;

    beforeEach(() => {
        MyGame.MAX_PLAYERS = 10;
        factory = new MyGameFactory(MyGame);
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    describe('constructor', () => {
        it('should correctly init instance', () => {
            expect((factory as any).GameClass).toBe(MyGame);
            expect((factory as any).io).toBeNull();
        });
    });

    describe('create', () => {
        it('should create an instance of this factory class', () => {
            const instance = factory.create(new Socket());
            
            expect(instance).toBeInstanceOf(MyGame);
        });

        it('should attach "onEnd" listener to created game', () => {
            spyOn(factory, 'deleteGame');
            const instance = factory.create(new Socket(), 'bar');
        
            instance.end();
            
            expect(factory.deleteGame).toHaveBeenCalledWith(instance);
        });
    });

    describe('join', () => {
        let game;

        beforeEach(() => {
            factory.io = socketio();

            game = factory.create(new Socket());
            jest.spyOn(game, 'join');
        });

        it('should make given socket join given game', () => {
            const newSocket = new Socket();

            factory.join(newSocket, game.uniqId);

            expect(game.join).toHaveBeenCalledWith(newSocket, {});
        });

        it('should make given socket join given game with given player data', () => {
            const newSocket = new Socket();

            factory.join(newSocket, game.uniqId, { name: 'Foo' });

            expect(game.join).toHaveBeenCalledWith(newSocket, { name: 'Foo' });
        });

        it('should emit "ready to play" event when max players number is reached', () => {
            jest.spyOn(game, 'emitToAllPlayers');

            MyGame.MAX_PLAYERS = game.getPlayers().length + 1;

            const newSocket = new Socket();
            factory.join(newSocket, game.uniqId);

            expect(game.emitToAllPlayers).toHaveBeenCalledWith('ludumjs_gameFull', expect.any(Array));
        });

        it('should throw error if game is not found', () => {
            const newSocket = new Socket();

            expect(() => factory.join(newSocket, '0000')).toThrowError(GameNotFoundError);
        });

        it('should throw error if game has already max players', () => {
            const newSocket = new Socket();

            MyGame.MAX_PLAYERS = 1;

            expect(() => factory.join(newSocket, game.uniqId)).toThrowError(GameAlreadyFullError);
        });
    });

    describe('listen', () => {
        let originalLog;

        beforeEach(() => {
            originalLog = console.log;
            console.log = jest.fn();
        });

        afterEach(() => {
            console.log = originalLog;
        });

        it('should create a socket.io server on given port', () => {
            factory.listen(999);
           
            expect(socketio).toHaveBeenCalledWith(999);
        });

        it('should create a socket.io server on port 1337 by default', () => {
            factory.listen();
           
            expect(socketio).toHaveBeenCalledWith(1337);
        });

        it('should listen for connections', () => {
            jest.spyOn(factory.onSocketConnection, 'bind').mockReturnValueOnce(factory.onSocketConnection);
            factory.listen();
    
            expect(factory.io.on).toHaveBeenCalledWith('connection', factory.onSocketConnection);
        });
    });

    describe('onSocketConnection', () => {
        it('should emit "connection" event and send given data', () => {
            const socket = {
                on: jest.fn(),
                emit: jest.fn(),
            };

            factory.onSocketConnection(socket, 'foo');

            expect(socket.emit).toHaveBeenCalledWith('connection', 'foo');
        });
    });

    describe('deleteGame', () => {
        it('should remove given game from list of games', () => {
            const gameToDelete = factory.create();
            factory.create();
            factory.create();

            expect(factory.games.length).toBe(3);
            expect(factory.games).toContain(gameToDelete);

            factory.deleteGame(gameToDelete);

            expect(factory.games.length).toBe(2);
            expect(factory.games).not.toContain(gameToDelete);
        });
    });

    describe('disconnect', () => {
        let socketToDisconnect;
        let game;
        let player;

        beforeEach(() => {
            socketToDisconnect = new Socket();
            socketToDisconnect.id = '123';
            game = factory.create(socketToDisconnect);
            player = game.getPlayers()[0];
            jest.spyOn(game, 'emitToAllPlayersExceptOne');
        });

        it('should emit "player connection difficulties" event after timeout delay', () => {
            factory.disconnect(socketToDisconnect);
           
            expect(game.emitToAllPlayersExceptOne)
                .toHaveBeenCalledWith(
                    player,
                    'ludumjs_playerConnectionDifficulties',
                    player.serialize(),
                );
        });

        it('should emit "player left" event after timeout delay', () => {
            factory.disconnect(socketToDisconnect);

            jest.advanceTimersByTime(factory.reconnectTimeoutDelay);
           
            expect(game.emitToAllPlayersExceptOne)
                .toHaveBeenCalledWith(
                    player,
                    'ludumjs_playerLeft',
                    player.serialize(),
                );
        });

        it('should NOT emit "player left" if no corresponding game found', () => {
            factory.disconnect(new Socket());

            expect(game.emitToAllPlayersExceptOne).not.toHaveBeenCalled();
        });
    });

    describe('ludumjs_reconnectToGame', () => {
        let socketToReconnect;
        let game;
        let player;

        beforeEach(() => {
            socketToReconnect = new Socket();
            game = factory.create(socketToReconnect);
            player = game.getPlayers()[0];
            player.socket = null;
        });

        it('should emit "cant reconnect" event if no game found', () => {
            factory.ludumjs_reconnectToGame(socketToReconnect, { gameId: 0 });

            expect(socketToReconnect.emit).toHaveBeenCalledWith('ludumsjs_cantReconnect');
        });

        it('should emit "cant reconnect" event if no player found', () => {
            factory.ludumjs_reconnectToGame(socketToReconnect, { gameId: game.uniqId, playerId: 0 });

            expect(socketToReconnect.emit).toHaveBeenCalledWith('ludumsjs_cantReconnect');
        });

        it('should set socket to given player', () => {
            factory.ludumjs_reconnectToGame(socketToReconnect, { gameId: game.uniqId, playerId: player.uniqId });

            expect(player.socket).toBe(socketToReconnect);
        });
    });
});
