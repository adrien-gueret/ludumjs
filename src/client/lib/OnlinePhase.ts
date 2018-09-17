import socketio from 'socket.io-client';

import Phase from './Phase';
import { withSocketListeners } from '../../common/lib/decorators/withSocketListeners';

@withSocketListeners
export default abstract class OnlinePhase extends Phase {
    // withSocketListeners
    attachSocketEvent: (socket: socketio.Socket) => void;
    removeSocketEvent: (socket: socketio.Socket) => void;
}