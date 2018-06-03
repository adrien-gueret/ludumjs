import { random } from './math';

export function rollDice(nbrSides: number = 6) {
    return random(1, nbrSides);
}

export function rollDices(nbrDices: number, nbrSides: number = 6): Array<number> {
    return Array(nbrDices).fill(void 0).map(() => rollDice(nbrSides));
}

export default {
    rollDice,
    rollDices,
};