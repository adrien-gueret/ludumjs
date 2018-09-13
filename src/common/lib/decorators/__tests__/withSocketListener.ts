import { socketCallbackWrapper, socketEvent, withSocketListeners } from '../withSocketListeners';

describe('withSocketListeners', () => {
    describe('withSocketListeners class', () => {
       let instance;

        beforeEach(() => {
            @withSocketListeners
            class Test {
                @socketEvent
                onCustomEvent() {}

                @socketEvent
                onCustomEvent2() {}

                 // withSocketListeners
                 attachSocketEvent: (socket: SocketIO.Socket) => void;
                 removeSocketEvent: (socket: SocketIO.Socket) => void;
            }

            instance = new Test();
        });

        describe('method', () => {
            describe('attachSocketEvent', () => {
                it('should attach events to given sockets', () => {
                    const socket = {
                        on: jest.fn(),
                    };

                    instance.attachSocketEvent(socket);

                    expect(socket.on).toHaveBeenCalledWith('onCustomEvent', expect.any(Function));
                    expect(socket.on).toHaveBeenCalledWith('onCustomEvent2', expect.any(Function));
                });
           });

           describe('removeSocketEvent', () => {
            it('should remove events to given sockets', () => {
                const socket = {
                    on: jest.fn(),
                    removeListener: jest.fn(),
                };

                instance.attachSocketEvent(socket);
                instance.removeSocketEvent(socket);

                expect(socket.removeListener).toHaveBeenCalledWith('onCustomEvent', expect.any(Function));
                expect(socket.removeListener).toHaveBeenCalledWith('onCustomEvent2', expect.any(Function));
            });
       });
       });
    });

    describe('socketCallbackWrapper', () => {
        it('should wrapper given function into a top function', () => {
            const callback = jest.fn();
            const socket = {};
            const wrapper = socketCallbackWrapper(callback, socket);

            wrapper('foo');

            expect(callback).toHaveBeenCalledWith(socket, 'foo');
        });
    });
});
