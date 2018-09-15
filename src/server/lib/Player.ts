import * as socketio from 'socket.io';
import { withUniqId } from '../../common';

@withUniqId
export default class Player {
    socket: socketio.Socket;

    // withUniqId
    uniqId: string;

    constructor(socket: socketio.Socket) {
        this.socket = socket;
    }
}