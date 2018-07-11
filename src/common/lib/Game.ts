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

    start(...data): this {
        this.goToPhase(this.phases[0], ...data);
        return this;
    }

    registerPhase(PhaseClass: PhaseConstructor): this {
        const phaseInstance = new PhaseClass(this);

        assert(phaseInstance instanceof Phase, `Game.registerPhase: ${PhaseClass.toString()} must inherit from LudumJS.Phase`);
        assert(!!PhaseClass.id, `Game.registerPhase: ${PhaseClass.toString()} must have an "id" static property.`);
        
        const isPhaseAlreadyExisted = this.phases.some(phase => (phase.constructor as PhaseConstructor).id === PhaseClass.id);

        assert(!isPhaseAlreadyExisted, `Game.registerPhase: ${PhaseClass.id} is already registered`);

        this.phases.push(phaseInstance);

        return this;
    }

    registerPhases(phaseClasses: Array<PhaseConstructor>): this {
        phaseClasses.forEach(PhaseClass => this.registerPhase(PhaseClass));
        return this;
    }

    getPhaseById(phaseId: string): undefined|Phase {
        return this.phases.filter(phase => (phase.constructor as PhaseConstructor).id === phaseId)[0];
    }

    goToPhase(targetPhase: Phase, ...data): void {
        if (this.currentPhase) {
            this.currentPhase.end();
        }

        this.currentPhase = targetPhase;
        this.currentPhase.start(...data);
    }

    goToPhaseById(phaseId: string, ...data): void {
        this.goToPhase(this.getPhaseById(phaseId), ...data);
    }
}