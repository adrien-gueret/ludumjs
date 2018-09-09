import * as socketio from 'socket.io';

import GameCommon from '../../common/lib/Game';
import withSockeListeners from '../../common/lib/withSocketListeners';
import applyMixins from '../../common/utils/applyMixins';

export default class Game extends GameCommon implements withSockeListeners {
    private sockets: Array<socketio.Socket> = [];
    private onEndCallbacks: Array<Function>;

    constructor(socket?: socketio.Socket) {
        super();
      
        this.onEndCallbacks = [];

        if (socket) {
            this.join(socket);
        }
    }

    getSockets(): Array<socketio.Socket> {
        return this.sockets;
    }

    join(socket: socketio.Socket) {
        this.sockets.push(socket);
        this.attachSocketEvent(socket);
    }

    onEnd(callback: Function) {
        this.onEndCallbacks.push(callback);
    }

    end() {
        this.onEndCallbacks.forEach(callback => callback());

        this.sockets.forEach(socket => {
            socket.removeAllListeners();
            socket.disconnect(true);
        });
        this.sockets = [];
    }

    emitSwitchPhase(phaseName, ...data) {
        this.sockets.forEach(socket => socket.emit('ludumjs_switchPhase', { phaseName, data }));
    }

    // withSocketListeners
    attachSocketEvent: (socket: socketio.Socket) => void;
    removeSocketEvent: (socket: socketio.Socket) => void;
}

applyMixins(Game, [withSockeListeners]);