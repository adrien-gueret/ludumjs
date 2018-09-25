import socketio from 'socket.io-client';

import { socketEvent, withSocketListeners } from '../../common/lib/decorators/withSocketListeners';

import Game from './Game';
import Phase from './Phase';
import OnlinePhase from './OnlinePhase';

function getRootUrl() {
    const { protocol, hostname } = document.location;

    return `${protocol}//${hostname}`;
}

@withSocketListeners
export default abstract class OnlineGame extends Game {
    private socket: SocketIO.Socket;
    
    otherPlayerUniqIds: Array<string> = [];
    serverPlayerUniqId: string;
    serverGameUniqId: string;

    readonly phases: Array<Phase|OnlinePhase>;

    constructor(domContainer: HTMLElement) {
        super(domContainer);
        this.socket = null;
    }

    addPlayer(playerUniqId: string) {
        this.otherPlayerUniqIds.push(playerUniqId);
    }

    connect(port: Number = null, serverUrl = getRootUrl()): SocketIO.Socket {
        this.socket = socketio(port === null ? serverUrl : `${serverUrl}:${port}`);
        this.attachSocketEvent(this.socket);

        return this.socket;
    }

    getSocket(): SocketIO.Socket {
        return this.socket;
    }

    goToPhase(targetPhase: Phase|OnlinePhase, ...data): void {
        if (this.currentPhase && this.currentPhase instanceof OnlinePhase) {
            this.currentPhase.removeSocketEvent(this.socket);
        }

        if (targetPhase instanceof OnlinePhase) {
            targetPhase.attachSocketEvent(this.socket)
        }

        super.goToPhase(targetPhase, ...data);
    }

    @socketEvent
    ludumjs_gameJoined(socket, { gameUniqId, playerUniqId }) {
        this.serverGameUniqId = gameUniqId;
        this.serverPlayerUniqId = playerUniqId;
    }

    @socketEvent
    ludumjs_newPlayerJoined(socket, playerUniqId) {
        this.addPlayer(playerUniqId);
    }

    @socketEvent
    ludumjs_switchPhase(socket, { phaseName, data }) {
        this.goToPhaseById(phaseName, ...data);
    }

    // withSocketListeners
    attachSocketEvent: (socket: SocketIO.Socket) => void;
    removeSocketEvent: (socket: socketio.Socket) => void;
}