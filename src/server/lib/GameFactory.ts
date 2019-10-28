import * as socketio from 'socket.io';

import { socketEvent, withSocketListeners } from '../../common/lib/decorators/withSocketListeners';
import { PlayerData } from '../../common/lib/Player';
import assert from '../../common/utils/assert';
import { GameAlreadyFullError, GameNotFoundError } from '../errors';
import Game, { GameConstructor } from './Game';

@withSocketListeners
export default abstract class GameFactory {
    private GameClass: GameConstructor;
    private io: socketio.Server;
    private reconnectTimeouts: { [playerId: string]: NodeJS.Timer; };
    protected games: Array<Game>;
    protected reconnectTimeoutDelay: number;

    constructor(GameClass: GameConstructor) {
        this.GameClass = GameClass;
        this.io = null;
        this.reconnectTimeouts = {};
        this.games = [];
        this.reconnectTimeoutDelay = 300000;
    }

    listen(port : Number = 1337) {
        this.io = socketio(port);

        this.io.on('connection', this.onSocketConnection.bind(this));

        console.log(`[LudumJS] server listening on port ${port}`);
    }

    getGameById(gameUniqId: string): Game {
        return this.games.filter(game => game.uniqId === gameUniqId)[0];
    }

    create(socket: socketio.Socket = null, playerData: PlayerData = {}): Game {
        const game = new this.GameClass();
        this.games.push(game);

        game.setIo(this.io);
        game.onEnd(() => this.deleteGame(game));

        if (socket) {
            this.join(socket, game.uniqId, playerData);   
        }

        return game;
    }

    join(socket: socketio.Socket, gameUniqId: string, playerData: PlayerData = {}): Game {
        const game = this.getGameById(gameUniqId);

        assert(!!game, `Game #${gameUniqId} not found`, GameNotFoundError);

        assert(!game.isFull(), `Game #${gameUniqId} can't get new players.`, GameAlreadyFullError);

        game.join(socket, playerData);

        if (game.isFull()) {
            game.emitToAllPlayers('ludumjs_gameFull', game.getPlayers().map(player => player.serialize()));
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

    @socketEvent
    disconnect(disconnectedSocket: socketio.Socket) {
        const correspondingGame = this.games.filter(game => (
            game.getSockets().some(socket => socket.id === disconnectedSocket.id)
        ))[0];

        if (!correspondingGame) {
            return;
        }

        const disconnectedPlayer = correspondingGame.getPlayerFromSocket(disconnectedSocket);

        correspondingGame.emitToAllPlayersExceptOne(disconnectedPlayer, 'ludumjs_playerConnectionDifficulties', disconnectedPlayer.serialize());

        this.reconnectTimeouts[disconnectedPlayer.uniqId] = setTimeout(() => {
            correspondingGame.emitToAllPlayersExceptOne(disconnectedPlayer, 'ludumjs_playerLeft', disconnectedPlayer.serialize());

            // TODO: call a callback on correspondingGame so that developer can end the games now if he wants to
        }, this.reconnectTimeoutDelay);
    }

    @socketEvent
    ludumjs_reconnectToGame(socket, { gameId, playerId }) {
        const game = this.getGameById(gameId);

        if (!game) {
            socket.emit('ludumsjs_cantReconnect');
            return;
        }

        const player = game.getPlayerByUniqId(playerId);

        if (!player) {
            socket.emit('ludumsjs_cantReconnect');
            return;
        }

        player.setSocket(socket);

        // TODO: call a callback to retreive game data
        // console.log('reconnect', game, player);
    }

    // withSocketListeners
    attachSocketEvent: (socket: socketio.Socket) => void;
    removeSocketEvent: (socket: socketio.Socket) => void;
}