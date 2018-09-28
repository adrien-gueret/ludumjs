import * as socketio from 'socket.io';

import { PlayerData } from '../../common/lib/Player';
import { withUniqId } from '../../common';

@withUniqId
export default class Player {
    socket: socketio.Socket;
    private customData: PlayerData;

    // withUniqId
    uniqId: string;

    constructor(socket: socketio.Socket, customData: PlayerData = {}) {
        this.socket = socket;
        this.customData = customData;
    }

    serialize(): PlayerData {
        return {
            ...this.customData,
            uniqId: this.uniqId,
        };
    }
}