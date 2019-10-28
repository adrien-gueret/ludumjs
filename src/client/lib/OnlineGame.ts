import socketio from 'socket.io-client';

import { socketEvent, withSocketListeners } from '../../common/lib/decorators/withSocketListeners';
import { PlayerData, PlayerDataDictionnary } from '../../common/lib/Player';

import Game from './Game';
import Phase from './Phase';
import OnlinePhase from './OnlinePhase';

function getRootUrl() {
    const { protocol, hostname } = document.location;

    return `${protocol}//${hostname}`;
}

@withSocketListeners
export default abstract class OnlineGame extends Game {
    private socket: SocketIO.Socket;
    protected localStorageKeys: { [key: string]: string };
    
    players: PlayerDataDictionnary = {};

    playerUniqId: string;
    gameUniqId: string;

    isPlayerActive: boolean = false;

    readonly phases: Array<Phase|OnlinePhase>;

    constructor(domContainer: HTMLElement) {
        super(domContainer);
        this.socket = null;
        this.localStorageKeys = {
            gameId: 'ludumjs_game_id',
            playerId: 'ludumjs_player_id',
        };
    }

    addPlayer(player: PlayerData) {
        this.players[player.uniqId] = player;
    }

    connect(port: Number = null, serverUrl = getRootUrl()): SocketIO.Socket {
        this.socket = socketio(port === null ? serverUrl : `${serverUrl}:${port}`);
        this.attachSocketEvent(this.socket);

        this.checkReconnection();

        return this.socket;
    }

    checkReconnection(): boolean {
        const gameId = localStorage.getItem(this.localStorageKeys.gameId);
        const playerId = localStorage.getItem(this.localStorageKeys.playerId);

        if (!gameId || !playerId) {
            return false;
        }

        this.socket.emit('ludumjs_reconnectToGame', { gameId, playerId });
        // Todo: call a callback so that developer can display a message if he wants to

        return true;
    }

    getSocket(): SocketIO.Socket {
        return this.socket;
    }

    goToPhase(targetPhase: Phase|OnlinePhase, ...data): void {
        if (this.currentPhase && this.currentPhase instanceof OnlinePhase) {
            this.currentPhase.removeSocketEvent(this.socket);
        }

        if (targetPhase instanceof OnlinePhase) {
            targetPhase.attachSocketEvent(this.socket)
        }

        super.goToPhase(targetPhase, ...data);
    }

    clearLocalStorage() {
        const removeFromLocalStorage = localStorage.removeItem.bind(localStorage);

        Object
            .keys(this.localStorageKeys)
            .map(keyName => this.localStorageKeys[keyName])
            .forEach(removeFromLocalStorage);
    }

    @socketEvent
    /* istanbul ignore next */
    disconnect(socket) {
        // TODO: do something
    }

    @socketEvent
    ludumjs_gameJoined(socket, { gameUniqId, playerUniqId } : { gameUniqId: string, playerUniqId: string }) {
        this.gameUniqId = gameUniqId;
        this.playerUniqId = playerUniqId;
        localStorage.setItem(this.localStorageKeys.gameId, gameUniqId);
        localStorage.setItem(this.localStorageKeys.playerId, playerUniqId);
    }

    @socketEvent
    ludumjs_newPlayerJoined(socket, player: PlayerData) {
        this.addPlayer(player);
    }

    @socketEvent
    ludumjs_gameFull(socket, allPlayers: Array<PlayerData>) {
        this.players = allPlayers.reduce((combinedPlayers: PlayerDataDictionnary, player: PlayerData) => ({
            ...combinedPlayers,
            [player.uniqId]: player,
        }), {});
    }

    @socketEvent
    ludumjs_switchPhase(socket, { phaseName, data } : { phaseName: string, data: any }) {
        this.goToPhaseById(phaseName, ...data);
    }

    @socketEvent
    ludumjs_activePlayers(socket, playerUniqIds: Array<string>) {
        this.isPlayerActive = playerUniqIds.some(uniqId => uniqId === this.playerUniqId);

        if (this.isPlayerActive) {
            this.domContainer.classList.add('ludumjs-activePlayer');
        } else {
            this.domContainer.classList.remove('ludumjs-activePlayer');
        }
    }

    @socketEvent
    ludumsjs_cantReconnect() {
        this.clearLocalStorage();
    }

    // withSocketListeners
    attachSocketEvent: (socket: SocketIO.Socket) => void;
    removeSocketEvent: (socket: socketio.Socket) => void;
}