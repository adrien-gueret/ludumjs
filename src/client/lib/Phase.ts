import PhaseCommon from '../../common/lib/Phase';
import { getClickEvent } from '../utils/events';
import Game from './game';

const clickEventName = getClickEvent();

interface Phase {
    onClick?(e?: Event);
}

abstract class Phase extends PhaseCommon {
    readonly game: Game;
    
    constructor(game: Game) {
        super(game);
        this.onClick = this.onClick ? this.onClick.bind(this) : null;
    }

    getClassName(): string {
        return this.name
            .replace(/\.?([A-Z]+)/g, (x, y) => `-${y.toLowerCase()}`)
            .replace(/^-/, '');
    }

    start(...data:Array<any>): void {
        if (super.start(...data) === false) {
            return;
        }

        if (this.onClick) {
            this.game.domContainer.addEventListener(clickEventName, this.onClick);
        }
    
        this.game.domContainer.classList.add(this.getClassName());
    }

    end(): void {
        super.end();

        if (this.onClick) {
            this.game.domContainer.removeEventListener(clickEventName, this.onClick);
        }
        
        this.game.domContainer.classList.remove(this.getClassName());
    }
}

export default Phase;