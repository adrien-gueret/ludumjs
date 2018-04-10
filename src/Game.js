import assert from './utils/assert.js';
import Phase from './Phase.js';

export default class Game {
    constructor(domContainer) {
        this.domContainer = domContainer;
        this.phases = [];
        this.currentPhase = null;
    }

    start() {
        this.goToPhase(this.phases[0]);
    }

    registerPhase(PhaseClass) {
        const phaseInstance = new PhaseClass(this);

        assert(phaseInstance instanceof Phase, `Game.registerPhase: ${PhaseClass.name} must inherit from LudumJS.Phase`);
        
        const isPhaseAlreadyExisted = this.phases.some(phase => phase.constructor.name === PhaseClass.name);

        assert(!isPhaseAlreadyExisted, `Game.registerPhase: ${PhaseClass.name} is already registered`);

        this.phases.push(phaseInstance);
    }

    registerPhases(phaseClasses) {
        phaseClasses.forEach(PhaseClass => this.registerPhase(PhaseClass));
    }

    getPhaseByName(phaseName) {
        return this.phases.filter(phase => phase.constructor.name === phaseName)[0];
    }

    goToPhase(targetPhase, ...data) {
        if (this.currentPhase) {
            this.currentPhase.end();
        }

        this.currentPhase = targetPhase;
        this.currentPhase.start(...data);
    }

    goToPhaseByName(phaseName, ...data) {
        this.goToPhase(this.getPhaseByName(phaseName), ...data);
    }
}