import * as socketio from 'socket.io';

import Game, { GameConstructor } from '../../common/lib/Game';

export default abstract class GameFactory {
    private GameClass: GameConstructor;
    private io: socketio.Server;

    constructor(GameClass: GameConstructor) {
        this.GameClass = GameClass;
        this.io = null;
    }

    listen(port : Number = 1337) {
        this.io = socketio(port);

        this.io.on('connection', this.onSocketConnection);

        console.log(`[LudumJS] server listening on port ${port}`);
    }

    create(...data:Array<any>): Game {
        return new this.GameClass(...data);
    }

    onSocketConnection(socket: socketio.Socket) {
        console.log('connected');
        socket.emit('connection');
    }
}