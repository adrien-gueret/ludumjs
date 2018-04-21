import Game from './game';
import { getClickEvent } from '../utils/events';

const clickEventName = getClickEvent();

export interface PhaseConstructor {
    new(game): Phase;
};

export interface PhaseInterface {
    onClick();
    onStart(...data:Array<any>):void|boolean;
    onEnd();
}

export default class Phase implements PhaseInterface {
    game: Game;

    constructor(game:Game) {
        this.game = game;
        this.onClick = this.onClick.bind(this);
    }

    getClassName():string {
        return this.constructor.name
            .replace(/\.?([A-Z]+)/g, (x, y) => `-${y.toLowerCase()}`)
            .replace(/^-/, '');
    }

    /* istanbul ignore next */
    onClick() {}

    onStart(...data):void|boolean {}

    onEnd() {}

    start(...data:Array<any>):void {
        if (this.onStart(...data) === false) {
            return;
        }

        this.game.domContainer.addEventListener(clickEventName, this.onClick);
        this.game.domContainer.classList.add(this.getClassName());
    }

    end():void {
        this.onEnd();
        this.game.domContainer.removeEventListener(clickEventName, this.onClick);
        this.game.domContainer.classList.remove(this.getClassName());
    }
}
