import * as socketio from 'socket.io';

import PhaseCommon from '../../common/lib/Phase';
import { withSocketListeners } from '../../common/lib/decorators/withSocketListeners';

@withSocketListeners
export default abstract class Phase extends PhaseCommon {
    // withSocketListeners
    attachSocketEvent: (socket: socketio.Socket) => void;
    removeSocketEvent: (socket: socketio.Socket) => void;
}