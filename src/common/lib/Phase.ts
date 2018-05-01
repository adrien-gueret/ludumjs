import Game from './game';

export interface PhaseConstructor {
    new(game:Game): Phase;
    name: string;
};

interface Phase {
    constructor: PhaseConstructor;
    onStart?(...data): void|boolean;
    onEnd?();
}

abstract class Phase {
    readonly game: Game;

    constructor(game: Game) {
        this.game = game;
        
        this.onStart = this.onStart ? this.onStart.bind(this) : () => {};
        this.onEnd = this.onEnd ? this.onEnd.bind(this) : () => {};
    }

    start(...data:Array<any>): void|boolean {
        return this.onStart(...data);
    }

    end(): void {
        this.onEnd();
    }
}

export default Phase;