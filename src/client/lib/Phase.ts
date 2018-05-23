import PhaseCommon from '../../common/lib/Phase';
import { getClickEvent } from '../utils/events';
import Game from './game';

const clickEventName = getClickEvent();

interface OnActionPayload {
    action: string,
    event: Event,
    target: HTMLElement,
}

interface Phase {
    onAction?(payload: OnActionPayload): void;
}

function getFirstElementWithAction(element: HTMLElement) {
    let target = element;

    if (!target) {
        return null;
    }

    do {
        if (target.dataset && 'action' in target.dataset) {
            return target;
        }

        target = target.parentNode as HTMLElement;
    } while (target);

    return null;
}

abstract class Phase extends PhaseCommon {
    readonly game: Game;
    
    constructor(game: Game) {
        super(game);
        this.onActionHandler = this.onAction ? this.wrapOnAction() : null;
    }

    private onActionHandler: Function|null;

    private wrapOnAction() {
        return ((event: Event) => {
            const target = getFirstElementWithAction(event.target as HTMLElement);

            if (!target) {
                return;
            }

            this.onAction({
                action: target.dataset.action,
                event,
                target,
            });
        }).bind(this);
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

        if (this.onAction) {
            this.game.domContainer.addEventListener(clickEventName, this.onActionHandler);
        }
    
        this.game.domContainer.classList.add(this.getClassName());
    }

    end(): void {
        super.end();

        if (this.onAction) {
            this.game.domContainer.removeEventListener(clickEventName, this.onActionHandler);
        }
        
        this.game.domContainer.classList.remove(this.getClassName());
    }
}

export default Phase;