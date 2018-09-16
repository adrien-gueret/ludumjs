export default class SocketMock {
    join = jest.fn();
    emit = jest.fn();
    on = jest.fn();
    disconnect = jest.fn();
    removeAllListeners = jest.fn();
}