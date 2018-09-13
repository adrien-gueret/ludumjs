import * as socketio from 'socket.io';

import PhaseCommon from '../../common/lib/Phase';
import withSockeListeners from '../../common/lib/decorators/withSocketListeners';;
import applyMixins from '../../common/utils/applyMixins';

export default abstract class Phase extends PhaseCommon implements withSockeListeners {
    // withSocketListeners
    attachSocketEvent: (socket: socketio.Socket) => void;
    removeSocketEvent: (socket: socketio.Socket) => void;
}

applyMixins(Phase, [withSockeListeners]);