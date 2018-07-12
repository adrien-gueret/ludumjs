import GameCommon from '../../common/lib/Game';
import assert from '../../common/utils/assert';

export default class Game extends GameCommon {
    readonly domContainer: HTMLElement;

    private readonly dialogs: Array<HTMLElement>;

    constructor(domContainer: HTMLElement) {
        super();

        this.domContainer = domContainer;
        this.domContainer.classList.add('ludumjs-game-container');

        this.dialogs = Array.from(this.domContainer.querySelectorAll('[data-dialog]'));
        this.dialogs.forEach(dialog => dialog.classList.add('ludumjs-dialog'));
    }

    getDialog(dialogId: string): HTMLElement|null {
        return this.dialogs.filter(dialog => dialog.dataset.dialog === dialogId)[0] || null;
    }

    showDialog(dialogId: string, delay = 0): HTMLElement|null {
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

    hideDialog(dialogId: string, delay = 0): HTMLElement|null {
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