import * as socketio from 'socket.io';

import GameCommon from '../../common/lib/Game';
import { withSocketListeners } from '../../common/lib/decorators/withSocketListeners';

import Phase from './Phase';
import Player from './Player';

@withSocketListeners
export default class Game extends GameCommon {
    private io: socketio.Server;
    private onEndCallbacks: Array<Function>;

    protected players: Array<Player> = [];

    readonly phases: Array<Phase>;
    currentPhase: Phase|null;

    constructor(socket?: socketio.Socket) {
        super();
      
        this.onEndCallbacks = [];

        if (socket) {
            this.join(socket);
        }
    }

    setIo(io:socketio.Server) {
        this.io = io;
    }

    emitToAllPlayers(eventName, eventData) {
        this.io.to(this.uniqId).emit(eventName, eventData);
    }

    emitSwitchPhase(phaseName, ...data) {
        this.emitToAllPlayers('ludumjs_switchPhase', { phaseName, data });
    }

    forEachSocket(callback: (s: socketio.Socket) => unknown) {
        this.getSockets().forEach(callback);
    }

    getPlayers(): Array<Player> {
        return this.players;
    }

    getSockets(): Array<socketio.Socket> {
        return this.players.map(player => player.socket);
    }

    goToPhase(targetPhase: Phase, ...data): void {
        if (this.currentPhase) {
            this.forEachSocket(socket => this.currentPhase.removeSocketEvent(socket));
        }

        this.forEachSocket(socket => targetPhase.attachSocketEvent(socket));

        super.goToPhase(targetPhase, ...data);
    }

    join(socket: socketio.Socket) {
        socket.join(this.uniqId);

        const player = new Player(socket);
        this.players.push(player);

        this.attachSocketEvent(socket);

        socket.emit('ludumjs_gameJoined', {
            gameUniqId: this.uniqId,
            playerUniqId: player.uniqId,
        });
    }

    onEnd(callback: Function) {
        this.onEndCallbacks.push(callback);
    }

    end() {
        this.onEndCallbacks.forEach(callback => callback());

        this.forEachSocket(socket => {
            socket.removeAllListeners();
            socket.disconnect(true);
        });
        this.players = [];
    }

    // withSocketListeners
    attachSocketEvent: (socket: socketio.Socket) => void;
    removeSocketEvent: (socket: socketio.Socket) => void;
}