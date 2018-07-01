import socketio from 'socket.io-client';

import withSocketListeners, { socketEvent } from '../../common/lib/withSocketListeners';
import applyMixins from '../../common/utils/applyMixins';

import Game from './Game';

function getRootUrl() {
    const { protocol, hostname } = document.location;

    return `${protocol}//${hostname}`;
}

export default abstract class OnlineGame extends Game implements withSocketListeners {
    private socket: SocketIO.Socket;

    constructor(domContainer: Element) {
        super(domContainer);
        this.socket = null;
    }

    connect(port: Number, serverUrl = getRootUrl()): SocketIO.Socket {
        this.socket = socketio(`${serverUrl}:${port}`);
        this.attachSocketEvent(this.socket);

        return this.socket;
    }

    getSocket(): SocketIO.Socket {
        return this.socket;
    }

    @socketEvent
    ludumjs_switchPhase(socket, { phaseName, data }) {
        this.goToPhaseByName(phaseName, ...data);
    }

    // withSocketListeners
    attachSocketEvent: (socket: SocketIO.Socket) => void;
}

applyMixins(OnlineGame, [withSocketListeners]);