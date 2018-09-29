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
    
    players: PlayerDataDictionnary = {};

    playerUniqId: string;
    gameUniqId: string;

    readonly phases: Array<Phase|OnlinePhase>;

    constructor(domContainer: HTMLElement) {
        super(domContainer);
        this.socket = null;
    }

    addPlayer(player: PlayerData) {
        this.players[player.uniqId] = player;
    }

    connect(port: Number = null, serverUrl = getRootUrl()): SocketIO.Socket {
        this.socket = socketio(port === null ? serverUrl : `${serverUrl}:${port}`);
        this.attachSocketEvent(this.socket);

        return this.socket;
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

    @socketEvent
    ludumjs_gameJoined(socket, { gameUniqId, playerUniqId } : { gameUniqId: string, playerUniqId: string }) {
        this.gameUniqId = gameUniqId;
        this.playerUniqId = playerUniqId;
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

    // withSocketListeners
    attachSocketEvent: (socket: SocketIO.Socket) => void;
    removeSocketEvent: (socket: socketio.Socket) => void;
}