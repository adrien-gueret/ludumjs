export default class SocketMock {
    id: string;
    join = jest.fn();
    emit = jest.fn();
    on = jest.fn();
    disconnect = jest.fn();
    removeAllListeners = jest.fn();
    broadcast = {
        to: jest.fn(() => ({
            emit: jest.fn(),
        })),
    };
}