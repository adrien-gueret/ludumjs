import socketio from 'socket.io-client';

import { socketEvent, withSocketListeners } from '../../common/lib/decorators/withSocketListeners';

import Game from './Game';

function getRootUrl() {
    const { protocol, hostname } = document.location;

    return `${protocol}//${hostname}`;
}

@withSocketListeners
export default abstract class OnlineGame extends Game {
    private socket: SocketIO.Socket;

    constructor(domContainer: HTMLElement) {
        super(domContainer);
        this.socket = null;
    }

    connect(port: Number = null, serverUrl = getRootUrl()): SocketIO.Socket {
        this.socket = socketio(port === null ? serverUrl : `${serverUrl}:${port}`);
        this.attachSocketEvent(this.socket);

        return this.socket;
    }

    getSocket(): SocketIO.Socket {
        return this.socket;
    }

    @socketEvent
    ludumjs_switchPhase(socket, { phaseName, data }) {
        this.goToPhaseById(phaseName, ...data);
    }

    // withSocketListeners
    attachSocketEvent: (socket: SocketIO.Socket) => void;
    removeSocketEvent: (socket: socketio.Socket) => void;
}