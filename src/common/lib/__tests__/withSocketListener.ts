import withSocketListeners, { socketEvent } from '../withSocketListeners';
import applyMixins from '../../utils/applyMixins';

describe('withSocketListeners', () => {
    describe('withSocketListeners class', () => {
       let instance;

        beforeEach(() => {
            class Test implements withSocketListeners {
                constructor() {

                }

                @socketEvent
                onCustomEvent() {}

                @socketEvent
                onCustomEvent2() {}

                 // withSocketListeners
                 attachSocketEvent: (socket: SocketIO.Socket) => void;
            }

            applyMixins(Test, [withSocketListeners]);

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
       });
    });
});
