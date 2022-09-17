import { getClickEvent } from '../utils/events';
import Game from './game';

const clickEventName = getClickEvent();

interface OnActionPayload {
    action: string,
    event: MouseEvent | TouchEvent,
    target: HTMLElement,
}

function getFirstElementWithDataProperty(element: HTMLElement, dataProperty: string): HTMLElement | null {
    let target = element;

    if (!target) {
        return null;
    }

    do {
        if (target.dataset && dataProperty in target.dataset) {
            return target;
        }

        target = target.parentNode as HTMLElement;
    } while (target);

    return null;
}

function getFirstElementWithAction(element: HTMLElement): HTMLElement | null {
    return getFirstElementWithDataProperty(element, 'action');
}

interface Phase {
    onRegister?(): void;
    onStart?(...data:Array<unknown>): boolean|void | Promise<boolean|void>;
    onEnd?(): boolean|void;
    onAction?(actionData?: OnActionPayload): void;
}

class Phase {
    readonly game: Game;
    static displayValue = 'block';
    
    constructor(game: Game) {
        this.game = game;
    }
    
    onActionHandler = (event: MouseEvent|TouchEvent) => {
        const target = getFirstElementWithAction(event.target as HTMLElement);

        if (!target) {
            return;
        }

        this.onAction({
            action: target.dataset.action,
            event,
            target,
        });
    };

    async start(...data:Array<unknown>): Promise<void> {
        if (this.onStart) {
            const result = await this.onStart(...data);

            if (result === false) {
                return;
            }
        }

        if (this.onAction) {
            this.game.domContainer.addEventListener(clickEventName, this.onActionHandler);
        }
        
        this.game.domContainer.classList.add(this.constructor.name);
    }

    async end(): Promise<void> {
        if (this.onEnd) {
            const result = await this.onEnd();

            if (result === false) {
                return;
            }
        }

        if (this.onAction) {
            this.game.domContainer.removeEventListener(clickEventName, this.onActionHandler);
        }

        this.game.domContainer.classList.remove(this.constructor.name);
    }
}

export default Phase;