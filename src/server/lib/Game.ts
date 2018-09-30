import * as socketio from 'socket.io';

import GameCommon, { GameConstructor as GameCommonConstructor } from '../../common/lib/Game';
import { PlayerData } from '../../common/lib/Player';
import { withSocketListeners } from '../../common/lib/decorators/withSocketListeners';

import arrays from '../../common/utils/arrays';

import Phase from './Phase';
import Player from './Player';

export interface GameConstructor extends GameCommonConstructor {
    new(...data: Array<any>): Game;
    MAX_PLAYERS: number;
};

@withSocketListeners
export default class Game extends GameCommon {
    static MAX_PLAYERS: number = 2;

    private io: socketio.Server;
    private onEndCallbacks: Array<Function> = [];

    protected players: Array<Player> = [];
    protected activePlayerUniqIds: Array<string> = [];

    readonly phases: Array<Phase>;
    currentPhase: Phase|null;

    emitToAllPlayers(eventName: string, eventData: unknown = {}) {
        this.io.to(this.uniqId).emit(eventName, eventData);
    }

    emitToAllPlayersExceptOne(sender: Player, eventName: string, eventData: unknown = {}) {
        sender.socket.broadcast.to(this.uniqId).emit(eventName, eventData);
    }

    emitSwitchPhase(phaseName: string, ...data) {
        this.emitToAllPlayers('ludumjs_switchPhase', { phaseName, data });
    }

    forEachSocket(callback: (s: socketio.Socket) => unknown) {
        this.getSockets().forEach(callback);
    }

    getPlayerFromSocket(socket: socketio.Socket): Player {
        return this.players.filter(player => player.socket.id === socket.id)[0];
    }

    getPlayers(): Array<Player> {
        return this.players;
    }

    getRandomPlayer(): Player {
        return arrays.getRandomItem(this.players);
    }

    getPlayerByUniqId(uniqId: string): Player {
        return this.players.filter(player => player.uniqId === uniqId)[0];
    }

    getActivePlayers(): Array<Player> {
        return this.activePlayerUniqIds.map(uniqid => this.getPlayerByUniqId(uniqid));
    }

    setActivePlayers(players: Array<Player|string>) {
        this.activePlayerUniqIds = [];

        players.forEach(player => {
            if (player instanceof Player) {
                this.activePlayerUniqIds.push(player.uniqId);
            } else {
                this.activePlayerUniqIds.push(player);
            }    
        });

        this.emitToAllPlayers('ludumjs_activePlayers', this.activePlayerUniqIds);
    }

    setActivePlayer(player: Player|string) {
        this.setActivePlayers([player]);
    }

    activeNextPlayer(): Player {
        const currentActivePlayerUniqId = this.activePlayerUniqIds[0];

        if (!currentActivePlayerUniqId) {
            const activePlayer = this.getRandomPlayer();
            this.setActivePlayer(activePlayer);

            return activePlayer;
        }

        const playerUniqIds = this.players.map(player => player.uniqId);
        const currentActivePlayerIndex = playerUniqIds.indexOf(currentActivePlayerUniqId);
        let nextActivePlayerIndex = currentActivePlayerIndex + 1;

        if (nextActivePlayerIndex > this.players.length - 1) {
            nextActivePlayerIndex = 0;
        }

        const nextActivePlayer = this.players[nextActivePlayerIndex];

        this.setActivePlayer(nextActivePlayer);

        return nextActivePlayer;
    }

    isPlayerActive(player: Player|string) {
        if (player instanceof Player) {
            return this.activePlayerUniqIds.some(uniqId => uniqId === player.uniqId);
        }

        return this.activePlayerUniqIds.some(uniqId => uniqId === player);
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

    isFull(): boolean {
        return this.players.length >= (<GameConstructor> this.constructor).MAX_PLAYERS;
    }

    join(socket: socketio.Socket, playerData: PlayerData = {}) {
        socket.join(this.uniqId);

        const player = new Player(socket, playerData);
        this.players.push(player);

        this.attachSocketEvent(socket);

        if (this.currentPhase) {
            this.currentPhase.attachSocketEvent(socket);
        }

        socket.emit('ludumjs_gameJoined', {
            gameUniqId: this.uniqId,
            playerUniqId: player.uniqId,
        });

        this.emitToAllPlayersExceptOne(player, 'ludumjs_newPlayerJoined', player.serialize());
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

    setIo(io:socketio.Server) {
        this.io = io;
    }

    // withSocketListeners
    attachSocketEvent: (socket: socketio.Socket) => void;
    removeSocketEvent: (socket: socketio.Socket) => void;
}