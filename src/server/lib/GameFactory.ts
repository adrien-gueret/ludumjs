import * as socketio from 'socket.io';

import { GameConstructor } from '../../common/lib/Game';
import Game from './Game';
import { withSocketListeners } from '../../common/lib/decorators/withSocketListeners';
import assert from '../../common/utils/assert';

@withSocketListeners
export default abstract class GameFactory {
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
        game.setIo(this.io);

        game.onEnd(() => this.deleteGame(game));

        return game;
    }

    join(socket: socketio.Socket, gameUniqId: string) {
        const game = this.games.filter(game => game.uniqId === gameUniqId)[0];

        assert(!!game, `Game with id #${gameUniqId} not found`);

        game.join(socket);
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