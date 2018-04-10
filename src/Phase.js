import { getClickEvent } from './utils/events.js';

const clickEventName = getClickEvent();

export default class Phase {
    constructor(game) {
        this.game = game;
        this.onClick = this.onClick.bind(this);
    }

    getClassName() {
        return this.constructor.name
            .replace(/\.?([A-Z]+)/g, (x, y) => `-${y.toLowerCase()}`)
            .replace(/^-/, '');
    }

    /* istanbul ignore next */
    onClick() {}

    onStart() {}

    onEnd() {}

    start(...data) {
        if (this.onStart(...data) === false) {
            return;
        }

        this.game.domContainer.addEventListener(clickEventName, this.onClick);
        this.game.domContainer.classList.add(this.getClassName());
    }

    end() {
        this.onEnd();
        this.game.domContainer.removeEventListener(clickEventName, this.onClick);
        this.game.domContainer.classList.remove(this.getClassName());
    }
}
