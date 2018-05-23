import socketio from 'socket.io-client';

import Game from './Game';

function getRootUrl() {
    const { protocol, hostname } = document.location;

    return `${protocol}//${hostname}`;
}

export default abstract class OnlineGame extends Game {
    private socket: SocketIO.Socket;

    constructor(domContainer: Element) {
        super(domContainer);
        this.socket = null;
    }

    connect(port: Number, serverUrl = getRootUrl()): SocketIO.Socket {
        this.socket = socketio(`${serverUrl}:${port}`);
        return this.socket;
    }
}