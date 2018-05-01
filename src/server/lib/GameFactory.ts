import Game, { GameConstructor } from '../../common/lib/Game';

export default abstract class GameFactory {
    private GameClass: GameConstructor;

    constructor(GameClass: GameConstructor) {
        this.GameClass = GameClass;
    }

    create(...data:Array<any>): Game {
        return new this.GameClass(...data);
    }
}