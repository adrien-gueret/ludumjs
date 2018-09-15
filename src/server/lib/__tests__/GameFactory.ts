jest.mock('socket.io', () => jest.fn(() => ({
    join: jest.fn(),
    emit: jest.fn(),
    on: jest.fn(),
    disconnect: jest.fn(),
    removeAllListeners: jest.fn(),
})));

import * as socketio from 'socket.io';
import GameFactory from '../GameFactory';
import Game from '../Game';

describe('GameFactory', () => {
    class MyGameFactory extends GameFactory {};
    class MyGame extends Game {};
    let factory;

    beforeEach(() => {
        factory = new MyGameFactory(MyGame);
    });

    describe('constructor', () => {
        it('should correctly init instance', () => {
            expect((factory as any).GameClass).toBe(MyGame);
            expect((factory as any).io).toBeNull();
        });
    });

    describe('create', () => {
        it('should create an instance of this factory class', () => {
            const instance = factory.create(socketio());
            
            expect(instance).toBeInstanceOf(MyGame);
        });

        it('should attach "onEnd" listener to created game', () => {
            spyOn(factory, 'deleteGame');
            const instance = factory.create(socketio(), 'bar');
        
            instance.end();
            
            expect(factory.deleteGame).toHaveBeenCalledWith(instance);
        });
    });

    describe('listen', () => {
        beforeEach(() => {
            console.log = jest.fn();
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
});
