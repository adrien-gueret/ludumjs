import * as socketio from 'socket.io';

import Game, { GameConstructor } from '../../common/lib/Game';
import withSockeListeners from '../../common/lib/decorators/withSocketListeners';;
import applyMixins from '../../common/utils/applyMixins';

export default abstract class GameFactory implements withSockeListeners {
    private GameClass: GameConstructor;
    private io: socketio.Server;
    protected games: Array<Game>;

    constructor(GameClass: GameConstructor) {
        this.GameClass = GameClass;
        this.io = null;
        this.games = [];
    }

    listen(port : Number = 1337) {
        this.io = socketio(port);

        this.io.on('connection', this.onSocketConnection.bind(this));

        console.log(`[LudumJS] server listening on port ${port}`);
    }

    create(...data:Array<any>): Game {
        const game = new (Array.bind.apply(this.GameClass, [null].concat(data)));
        this.games.push(game);

        game.onEnd(() => this.deleteGame(game));

        return game;
    }

    deleteGame(gameToDelete: Game) {
        this.games = this.games.filter(game => game !== gameToDelete);
    }

    onSocketConnection(socket: socketio.Socket, data?: string|object|Array<any>) {
        this.attachSocketEvent(socket);
        socket.emit('connection', data);
    };

    // withSocketListeners
    attachSocketEvent: (socket: socketio.Socket) => void;
    removeSocketEvent: (socket: socketio.Socket) => void;
}

applyMixins(GameFactory, [withSockeListeners]);