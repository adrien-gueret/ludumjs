import PeerGame from './PeerGame';
import Phase from './Phase';

interface PeerPhase {
    onPeerMessage?(data?: any): unknown;
}

class PeerPhase extends Phase {
    readonly game: PeerGame;
}

export default PeerPhase;