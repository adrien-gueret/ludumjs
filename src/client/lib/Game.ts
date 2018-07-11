import GameCommon from '../../common/lib/Game';

export default class Game extends GameCommon {
    readonly domContainer: Element;

    constructor(domContainer: Element) {
        super();

        this.domContainer = domContainer;
        this.domContainer.classList.add('ludumjs-game-container');
    }
}