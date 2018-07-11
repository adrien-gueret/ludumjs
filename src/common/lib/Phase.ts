import Game from './game';

export interface PhaseConstructor {
    new(game:Game): Phase;
    readonly id: string;
};

interface Phase {
    onStart?(...data): void|boolean;
    onEnd?();
}

abstract class Phase {
    readonly game: Game;
    static readonly id: string;

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