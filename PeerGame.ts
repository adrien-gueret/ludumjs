import assert from './utils/assert';
import Game from './Game';
import PeerPhase from './PeerPhase';

interface EventEmmitter {
    on: (eventName: string, callback: Function) => void;
    once: (eventName: string, callback: Function) => void;
    removeListener: (eventName: string, callback: Function) => void;
}

interface Connection extends EventEmmitter {
    readonly open: boolean;
    readonly peer: string;
    send(data: unknown): void;
}

interface ConnectOptions {
    serialization?: 'binary' | 'binary-utf8' | 'json' | 'none';
    label?: string;
    metadata?: unknown;
    reliable?: boolean;
}

type PeerRequestType = 'user_request' | 'ludumjs_request';
interface PeerRequestMetadata {
    type: PeerRequestType,
    id?: string;    
    replyTo?: string;
};

interface PeerRequest {
    metadata: PeerRequestMetadata;
    data: unknown;
}

interface PeerResponse {
    connection: Connection;
    value: unknown;
}

interface Peer extends EventEmmitter {
    id: string;
    connect: (peerId: string, options: ConnectOptions) => Connection;
    reconnect: () => void;
}

declare global {
    interface Window { Peer: new () => Peer; }
}

const GO_TO_PHASE_MESSAGE_TYPE = 'LUDUMJS_GO_TO_PHASE';

class PeerGame extends Game {
    readonly domContainer: HTMLElement;

    protected readonly phases: Array<PeerPhase>;
    protected currentPhase: PeerPhase|null;
    public readonly peer: Peer;
    public connections: Connection[];

    constructor(domContainer: HTMLElement) {
        super(domContainer);

        assert('Peer' in window, `new PeerGame(domContainer): window.Peer is not found, probably because PeerJS is not included. Please be sure to add the following tag in the <head> of your document: <script src="https://unpkg.com/peerjs@1.4.7/dist/peerjs.min.js"></script>`);

        const peer = new window.Peer();

        peer.on('disconnected', () => {
            peer.reconnect();
        });

        peer.on('connection', (connection: Connection) => {
            this.addConnection(connection);
        });

        this.peer = peer;
        this.connections = [];
    }

    protected addConnection(connection: Connection) {
        this.connections.push(connection);

        connection.on('data', async (requestData: PeerRequest) => {
            if (requestData.metadata.type === 'user_request' && this.currentPhase?.onPeerMessage) {
                const responseValue = await this.currentPhase.onPeerMessage(requestData.data);

                this.replyToConnection(connection, requestData.metadata.id, responseValue);
            }
        });

        connection.on('close', () => {
            this.connections = this.connections.filter((c) => c !== connection);
        });
    }

    get connection(): Connection {
        return this.connections[0];
    }

    async getPeerId(): Promise<string> {
        if (this.peer.id) {
            return this.peer.id;
        }

        return new Promise((resolve) => {
            this.peer.once('open', resolve);
        });
    }

    waitForConnection(): Promise<Connection> {
        return new Promise((resolve) => {
            this.peer.once('connection', (connection: Connection) => {
                connection.once('open', () => {
                    resolve(connection);
                });
            });
        });
    }

    connectToPeer(peerId: string, { serialization = 'json', ...otherOptions }: ConnectOptions = {}): Promise<Connection> {
        const connection = this.peer.connect(peerId, {
            serialization,
            ...otherOptions,
        });

        this.addConnection(connection);

        return new Promise((resolve) => {
            connection.once('open', () => {
                resolve(connection);
            });
        });
    }

    replyToConnection(connection: Connection, requestId: PeerRequestMetadata['id'], responseValue: unknown) {
        const request: PeerRequest = {
            metadata: {
                replyTo: requestId,
                type: 'ludumjs_request',
            },
            data: responseValue,
        };
        connection.send(request);
    }

    sendToConnection(connection: Connection, data: unknown): Promise<PeerResponse> {
        const request: PeerRequest = {
            metadata: {
                id: (Math.random()*100).toString(16),
                type: 'user_request',
            },
            data,
        };

        if (connection.open) {
            connection.send(request);
        } else {
            connection.once('open', () => {
                connection.send(request);
            });
        }

        return new Promise((resolve) => {
            const onResponse = (response: PeerRequest) => {
                if (response.metadata.type === 'ludumjs_request' && response.metadata.replyTo === request.metadata.id) {
                    resolve({
                        connection,
                        value: response.data,
                    });
                    connection.removeListener('data', onResponse);
                }
            };

            connection.on('data', onResponse);
        });
    }

    sendToConnections(connections: Connection[], data: unknown): Promise<PeerResponse[]> {
        return Promise.all(connections.map((connection) => (
            this.sendToConnection(connection, data)
        )));
    }

    send(data: unknown): Promise<PeerResponse> {
        return this.sendToConnection(this.connection, data);
    }

    sendToPeer(peerId: string, data: unknown): Promise<PeerResponse[]> {
        return this.sendToConnections(this.connections.filter(({ peer }) => peer === peerId), data);
    }

    sendToAllPeers(data: unknown): Promise<PeerResponse[]> {
        return this.sendToConnections(this.connections, data);
    }

    /*
    makeAllPeersGoToPhase(phaseName: string) {
        this.sendToAllPeers({
            type: GO_TO_PHASE_MESSAGE_TYPE,
            phaseName,
        });
    }
    */
}

export default PeerGame;
