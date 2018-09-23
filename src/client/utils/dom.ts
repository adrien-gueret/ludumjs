export default {
    appendChildWithTransition(domElement: HTMLElement, newContainer: HTMLElement, duration: number = 500): Promise<void> {
        const { left, top } = domElement.getBoundingClientRect();
        const cloneNode = domElement.cloneNode(true) as HTMLElement;
        
        cloneNode.style.setProperty('position', 'fixed');
        cloneNode.style.setProperty('left', `${left}px`);
        cloneNode.style.setProperty('top', `${top}px`);
        cloneNode.style.setProperty('transition', `${duration}ms`);
        document.body.appendChild(cloneNode);

        newContainer.appendChild(domElement);

        const { left: newLeft, top: newTop } = domElement.getBoundingClientRect();

        domElement.style.setProperty('opacity', '0');

        cloneNode.style.setProperty('left', `${newLeft}px`);
        cloneNode.style.setProperty('top', `${newTop}px`);

        return new Promise((resolve) => {
            window.setTimeout(() => {
                domElement.style.removeProperty('opacity');
                cloneNode.parentNode.removeChild(cloneNode);
                resolve();
            }, duration);
        });
    },
};