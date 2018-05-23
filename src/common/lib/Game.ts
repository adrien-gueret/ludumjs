import assert from '../utils/assert';
import Phase, { PhaseConstructor } from './Phase';

export interface GameConstructor {
    new(...data: Array<any>): Game;
};

export default abstract class Game {
    readonly phases: Array<Phase>;
    currentPhase: Phase|null;

    constructor() {
        this.phases = [];
        this.currentPhase = null;
    }

    start(): this {
        this.goToPhase(this.phases[0]);
        return this;
    }

    registerPhase(PhaseClass: PhaseConstructor): this {
        const phaseInstance = new PhaseClass(this);

        assert(phaseInstance instanceof Phase, `Game.registerPhase: ${PhaseClass.toString()} must inherit from LudumJS.Phase`);
        assert(!!phaseInstance.name, `Game.registerPhase: ${PhaseClass.toString()} must define a readonly "name" property to its instances.`);
        
        const isPhaseAlreadyExisted = this.phases.some(phase => phase.name === phaseInstance.name);

        assert(!isPhaseAlreadyExisted, `Game.registerPhase: ${phaseInstance.name} is already registered`);

        this.phases.push(phaseInstance);

        return this;
    }

    registerPhases(phaseClasses: Array<PhaseConstructor>): this {
        phaseClasses.forEach(PhaseClass => this.registerPhase(PhaseClass));
        return this;
    }

    getPhaseByName(phaseName: string): undefined|Phase {
        return this.phases.filter(phase => phase.name === phaseName)[0];
    }

    goToPhase(targetPhase: Phase, ...data): void {
        if (this.currentPhase) {
            this.currentPhase.end();
        }

        this.currentPhase = targetPhase;
        this.currentPhase.start(...data);
    }

    goToPhaseByName(phaseName: string, ...data): void {
        this.goToPhase(this.getPhaseByName(phaseName), ...data);
    }
}