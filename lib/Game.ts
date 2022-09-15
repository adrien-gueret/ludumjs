import assert from '../utils/assert';

import Phase from './Phase';


export default class Game {
    readonly domContainer: HTMLElement;

    protected readonly phases: Array<Phase>;
    protected readonly dialogs: Array<HTMLDialogElement>;
    protected currentPhase: Phase|null;
    protected dynamicStyleSheet: HTMLStyleElement;

    constructor(domContainer: HTMLElement) {
        this.phases = [];
        this.currentPhase = null;

        this.domContainer = domContainer;
        this.domContainer.classList.add('ludumjs-game-container');

        this.dialogs = Array.from(this.domContainer.querySelectorAll('[data-dialog]'));
        this.dialogs.forEach(dialog => dialog.classList.add('ludumjs-dialog'));

        this.dynamicStyleSheet = document.createElement('style');
        document.head.appendChild(this.dynamicStyleSheet);
    }

    registerPhase(PhaseClass: typeof Phase): this {
        const phaseInstance = new PhaseClass(this);

        assert(phaseInstance instanceof Phase, `Game.registerPhase: ${PhaseClass.toString()} must inherit from LudumJS.Phase`);
        
        const isPhaseAlreadyExisted = this.phases.some(phase => phase.constructor.name === PhaseClass.name);

        assert(!isPhaseAlreadyExisted, `Game.registerPhase: ${PhaseClass.name} is already registered`);

        const phaseClassName = phaseInstance.getClassName();
        this.dynamicStyleSheet.sheet.insertRule(`.ludumjs-game-container.${phaseClassName} [data-phase~="${phaseClassName}"]{display: ${PhaseClass.displayValue};}`, 0);

        this.phases.push(phaseInstance);

        return this;
    }

    registerPhases(phaseClasses: Array<typeof Phase>): this {
        phaseClasses.forEach(PhaseClass => this.registerPhase(PhaseClass));
        return this;
    }

    getPhaseByName(phaseName: string): void|Phase {
        return this.phases.filter(phase => phase.constructor.name === phaseName)[0];
    }

    goToPhase(targetPhase: Phase, ...data: Parameters<Phase['start']>): void {
        if (this.currentPhase) {
            this.currentPhase.end();
        }

        this.currentPhase = targetPhase;
        this.currentPhase.start(...data);
    }

    goToPhaseByName(phaseName: string, ...data: Parameters<Phase['start']>): void {
        const targetPhase = this.getPhaseByName(phaseName);
        assert(Boolean(targetPhase), `Game.goToPhaseByName: no phase with name "${phaseName}" found. Did you register it?`);
        this.goToPhase(targetPhase as Phase, ...data);
    }

    start(...data: Parameters<Phase['start']>): this {
        this.goToPhase(this.phases[0], ...data);
        return this;
    }

    getDialog(dialogId: string): HTMLElement|null {
        return this.dialogs.filter(dialog => dialog.dataset.dialog === dialogId)[0] || null;
    }

    showDialog(dialogId: string, delay = 200): HTMLElement|null {
        const dialog = this.getDialog(dialogId);
        assert(!!dialog, `Try to show dialog "${dialogId}" which is not found.`);

        const dialogContainer =  document.createElement('div');
        dialogContainer.className = 'ludumjs-dialogs-container';
    
        dialog.parentNode.appendChild(dialogContainer);
        dialogContainer.appendChild(dialog);

        window.setTimeout(() => {
            dialog.classList.add('ludumjs-dialog--visible');
        }, delay);

        return dialog;
    }

    hideDialog(dialogId: string, delay = 200): HTMLElement|null {
        const dialog = this.getDialog(dialogId);
        assert(!!dialog, `Try to hide dialog "${dialogId}" which is not found.`);
        assert(dialog.classList.contains('ludumjs-dialog--visible'), `Try to hide dialog "${dialogId}" but it seems already hidden.`);

        const dialogContainer = dialog.parentNode;
        assert(!!dialogContainer, `Try to hide dialog "${dialogId}", but its parent is not found.`);

        dialog.classList.remove('ludumjs-dialog--visible');

        window.setTimeout(() => {
            dialogContainer.parentNode.insertBefore(dialog, dialogContainer);
            dialogContainer.parentNode.removeChild(dialogContainer);
        }, delay);

        return dialog;
    }
}