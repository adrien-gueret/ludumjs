import Game from './game';

export interface PhaseConstructor {
    new(game:Game): Phase;
    readonly id: string;
};

interface Phase {
    onStart?(...data:Array<unknown>): void|boolean|Promise<void|boolean>;
    onEnd?(): void|Promise<void>;
}

abstract class Phase {
    readonly game: Game;
    static readonly id: string;

    constructor(game: Game) {
        this.game = game;
        
        this.onStart = this.onStart ? this.onStart.bind(this) : () => {};
        this.onEnd = this.onEnd ? this.onEnd.bind(this) : () => {};
    }

    async start(...data:Array<unknown>): Promise<boolean|void> {
        return this.onStart(...data);
    }

    async end(): Promise<void> {
        return this.onEnd();
    }
}

export default Phase;