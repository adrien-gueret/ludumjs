jest.mock('socket.io', () => jest.fn(() => ({ on: jest.fn() })));

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
            const instance = factory.create('foo', 'bar');
            
            expect(instance).toBeInstanceOf(MyGame);
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
});
