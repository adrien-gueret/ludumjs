import * as socketio from 'socket.io';

import { withSocketListeners } from '../../common/lib/decorators/withSocketListeners';
import { PlayerData } from '../../common/lib/Player';
import assert from '../../common/utils/assert';
import { GameAlreadyFullError, GameNotFoundError } from '../errors';
import Game, { GameConstructor } from './Game';

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

    create(...data:Array<unknown>): Game {
        const game = new (Array.bind.apply(this.GameClass, [null].concat(data)));
        this.games.push(game);
        game.setIo(this.io);

        game.onEnd(() => this.deleteGame(game));

        return game;
    }

    join(socket: socketio.Socket, gameUniqId: string, playerData: PlayerData = {}): Game {
        const game = this.games.filter(game => game.uniqId === gameUniqId)[0];

        assert(!!game, `Game #${gameUniqId} not found`, GameNotFoundError);

        assert(!game.isFull(), `Game #${gameUniqId} can't get new players.`, GameAlreadyFullError);

        game.join(socket, playerData);

        if (game.isFull()) {
            game.emitToAllPlayers('ludumjs_readyToPlay', game.getPlayers().map(player => player.serialize()));
        }

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