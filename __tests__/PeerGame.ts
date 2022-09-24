import PeerGame, { EventEmmitter, Peer, ConnectOptions, Connection } from '../PeerGame';
import PeerPhase from '../PeerPhase';

describe('PeerGame', () => {
    class MyGame extends PeerGame {};
    let gameContainer;

    function getPeerMock() {
        class EventEmmitterMock implements EventEmmitter {
            protected events: Record<string, Function[]> = {};
    
            on(eventName: string, callback: Function) {
                if (!this.events[eventName]) {
                    this.events[eventName] = [];
                }
                this.events[eventName].push(callback);
            }
    
            once(eventName: string, callback: Function) {
                const finalCallback = (...props) => {
                    callback(...props);
                    this.removeListener(eventName, finalCallback);
                };
                this.on(eventName, finalCallback);
            }
    
            removeListener(eventName: string, callbackToRemove: Function) {
                if (!this.events[eventName]) {
                    return;
                }
                this.events[eventName] = this.events[eventName].filter(callback => callback !== callbackToRemove);
            }
    
            emit(eventName: string, data?: unknown) {
                if (!this.events[eventName]) {
                    return;
                }
    
                this.events[eventName].forEach((callback) => callback(data));
            }
        }
    
        class ConnectionMock extends EventEmmitterMock implements Connection {
            open: boolean;
            peer: string;
            __peerConnection: ConnectionMock;
    
            constructor(peerId: string) {
                super();
                this.open = false;
                this.peer = peerId;
    
                window.setTimeout(() => {
                    this.open = true;
                    this.emit('open');
                }, 1);
            }
    
            send(data: unknown) {
                this.__peerConnection.emit('data', data);
            }
        }
    
        const allPeers: Record<PeerMock['id'], PeerMock> = {};
    
        class PeerMock extends EventEmmitterMock implements Peer {
            id: string;
    
            constructor() {
                super();
    
                this.id = '';
    
                window.setTimeout(() => {
                    this.id = (Math.random()).toString(16);
                    allPeers[this.id] = this;
                    this.emit('open');
                }, 1);
            }
    
            private createOtherConnection(peerId: string, connection: ConnectionMock) {
                const otherConnection = new ConnectionMock(this.id);

                Object.defineProperty(connection, '__peerConnection', {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: otherConnection,
                });

                Object.defineProperty(otherConnection, '__peerConnection', {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: connection,
                });
    
                allPeers[peerId].emit('connection', otherConnection);
            }
    
            connect(peerId: string, options?: ConnectOptions): Connection {
                const newConnection = new ConnectionMock(peerId);
    
                if (this.id) {
                    this.createOtherConnection(peerId, newConnection);
                } else {
                    this.once('open', () => this.createOtherConnection(peerId, newConnection));
                }
    
                return newConnection;
            }
    
            reconnect() {}
        }

        return PeerMock;
    }

    beforeEach(() => {
        document.body.innerHTML = `<div id="container"></div>`;

        gameContainer = document.getElementById('container');

        window.Peer = getPeerMock();
    });

    describe('constructor', () => {
        it('should throw if PeerJS is not available', () => {
            delete window.Peer;

            expect(() => new MyGame(gameContainer)).toThrow();
        });

        it('should init peer and connections', () => {
            const game = new MyGame(gameContainer);

            expect(game.peer).toBeInstanceOf(window.Peer);
            expect(game.connections).toEqual([]);
        });

        describe('on disconnected', () => {
            it('should reconnect', () => {
                const game = new MyGame(gameContainer);

                game.peer.reconnect = jest.fn();

                game.peer.emit('disconnected');
    
                expect(game.peer.reconnect).toHaveBeenCalled();
            });
        });
    });

    describe('other methods', () => {
        let onPeerMessageGame1Mock;
        let onPeerMessageGame2Mock;

        let initGames: () => [PeerGame, PeerGame];

        beforeEach(() => {
            onPeerMessageGame1Mock = jest.fn();
            onPeerMessageGame2Mock = jest.fn();

            class PhaseGame1 extends PeerPhase {
                onPeerMessage(data) {
                    onPeerMessageGame1Mock(data);
                    return 'response from game 1';
                }
            }

            class PhaseGame2 extends PeerPhase {
                onPeerMessage(data) {
                    onPeerMessageGame2Mock(data);
                    return 'response from game 2';
                }
            }

            initGames = () => {
                const game1 = new MyGame(gameContainer);
                game1.registerPhase(PhaseGame1);
    
                const game2 = new MyGame(gameContainer);
                game2.registerPhase(PhaseGame2);
    
                game1.start();
                game2.start();

                return [game1, game2];
            };
        });

        describe('connectToPeer', () => {
            it('should connect to another peer and create connections', (done) => {
                const [game1, game2] = initGames();

                game1.getPeerId().then((game1PeerId) => {
                    game1.waitForConnection().then(async (game1Connection) => {
                        const game2PeerId = await game2.getPeerId();

                        expect(game1.connections).toContain(game1Connection);
                        expect(game1Connection.peer).toBe(game2PeerId);
                        expect(game2.connection.peer).toBe(game1PeerId);

                        game1Connection.emit('close');
                        expect(game1.connections).not.toContain(game1Connection);

                        done();
                    });
    
                    game2.connectToPeer(game1PeerId);
                });
            });
        });

        describe('sendToConnection', () => {
            it('should call onPeerMessage of current active Phase of other game via specific connection', async () => {
                const [game1, game2] = initGames();

                const game1PeerId = await game1.getPeerId();
                const connection = await game2.connectToPeer(game1PeerId);
                await game2.sendToConnection(connection, 'hello from game 2');

                expect(onPeerMessageGame1Mock).toHaveBeenCalledWith('hello from game 2');
            });
        });

        describe('sendToAllPeers', () => {
            it('should call onPeerMessage of current active Phase of other game via all peers', (done) => {
                const [game1, game2] = initGames();

                game1.getPeerId().then((game1PeerId) => {
                    game1.waitForConnection().then(async () => {
                        await game1.sendToAllPeers('hello from game 1');
                        await game2.sendToAllPeers('hello from game 2');
                        
                        expect(onPeerMessageGame1Mock).toHaveBeenCalledWith('hello from game 2');
                        expect(onPeerMessageGame2Mock).toHaveBeenCalledWith('hello from game 1');
                        done();
                    });
    
                   game2.connectToPeer(game1PeerId);
                });
            });

            it('should handle response from onPeerMessage', (done) => {
                const [game1, game2] = initGames();

                game1.getPeerId().then((game1PeerId) => {
                    game1.waitForConnection().then(async () => {
                        const [response1] = await game1.sendToAllPeers('hello from game 1');
                        const [response2] = await game2.sendToAllPeers('hello from game 2');
                        
                        expect(response1).toEqual({
                            connection: game1.connection,
                            value: 'response from game 2'
                        });
                        expect(response2).toEqual({
                            connection: game2.connection,
                            value: 'response from game 1'
                        });
                        done();
                    });
    
                   game2.connectToPeer(game1PeerId);
                });
            });
        });

        describe('send', () => {
            it('should call onPeerMessage of current active Phase of other game via first connection', async () => {
                const [game1, game2] = initGames();

                const game1PeerId = await game1.getPeerId();
                game2.connectToPeer(game1PeerId);
                const response = await game2.send('hello from game 2');

                expect(onPeerMessageGame1Mock).toHaveBeenCalledWith('hello from game 2');
                expect(response).toEqual({
                    connection: game2.connection,
                    value: 'response from game 1',
                });
            });
        });

        describe('sendToPeer', () => {
            it('should call onPeerMessage of current active Phase of other game via peer id', async () => {
                const [game1, game2] = initGames();

                const game1PeerId = await game1.getPeerId();
                game2.connectToPeer(game1PeerId);
                const [response] = await game2.sendToPeer(game1PeerId, 'hello from game 2');

                expect(onPeerMessageGame1Mock).toHaveBeenCalledWith('hello from game 2');
                expect(response).toEqual({
                    connection: game2.connection,
                    value: 'response from game 1',
                });
            });
        });
    });
});
