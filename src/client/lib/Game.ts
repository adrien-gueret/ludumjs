import assert from '../../common/utils/assert';
import Phase, { PhaseConstructor } from './Phase';

export default class Game {
    domContainer: Element;
    phases: Array<Phase>;
    currentPhase: Phase | null;

    constructor(domContainer:Element) {
        this.domContainer = domContainer;
        this.phases = [];
        this.currentPhase = null;

        this.domContainer.classList.add('ludumjs-game-container');
    }

    start():void {
        this.goToPhase(this.phases[0]);
    }

    registerPhase(PhaseClass:PhaseConstructor):void {
        const phaseInstance = new PhaseClass(this);

        assert(phaseInstance instanceof Phase, `Game.registerPhase: ${PhaseClass.name} must inherit from LudumJS.Phase`);
        
        const isPhaseAlreadyExisted = this.phases.some(phase => phase.constructor.name === PhaseClass.name);

        assert(!isPhaseAlreadyExisted, `Game.registerPhase: ${PhaseClass.name} is already registered`);

        this.phases.push(phaseInstance);
    }

    registerPhases(phaseClasses:Array<PhaseConstructor>):void {
        phaseClasses.forEach(PhaseClass => this.registerPhase(PhaseClass));
    }

    getPhaseByName(phaseName:string):undefined|Phase {
        return this.phases.filter(phase => phase.constructor.name === phaseName)[0];
    }

    goToPhase(targetPhase:Phase, ...data):void {
        if (this.currentPhase) {
            this.currentPhase.end();
        }

        this.currentPhase = targetPhase;
        this.currentPhase.start(...data);
    }

    goToPhaseByName(phaseName:string, ...data):void {
        this.goToPhase(this.getPhaseByName(phaseName), ...data);
    }
}