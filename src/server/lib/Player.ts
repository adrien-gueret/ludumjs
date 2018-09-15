import * as socketio from 'socket.io';
import { withUniqId } from '../../common';

@withUniqId
export default class Player {
    private socket: socketio.Socket;

    constructor(socket: socketio.Socket) {
        this.setSocket(socket);
    }

    setSocket(socket: socketio.Socket) {
        this.socket = socket;
    }

    getSocket(): socketio.Socket {
        return this.socket;
    }
}