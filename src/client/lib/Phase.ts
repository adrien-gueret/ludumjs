import PhaseCommon, { PhaseConstructor } from '../../common/lib/Phase';
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

    private onActionHandler: EventListener|null;

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
        return (this.constructor as PhaseConstructor).id
            .replace(/\.?([A-Z]+)/g, (x, y) => `-${y.toLowerCase()}`)
            .replace(/^-/, '');
    }

    async start(...data:Array<any>): Promise<void> {
        const result = await super.start(...data);

        if (result === false) {
            return;
        }

        if (this.onAction) {
            this.game.domContainer.addEventListener(clickEventName, this.onActionHandler);
        }
    
        this.game.domContainer.classList.add(this.getClassName());
    }

    async end(): Promise<void> {
        await super.end();

        if (this.onAction) {
            this.game.domContainer.removeEventListener(clickEventName, this.onActionHandler);
        }
        
        this.game.domContainer.classList.remove(this.getClassName());
    }
}

export default Phase;