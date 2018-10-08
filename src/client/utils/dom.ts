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

        let { left: newLeft, top: newTop, width, height } = domElement.getBoundingClientRect();

        // Handle scaled elements 
        const transform = window.getComputedStyle(domElement).transform;
        const matrix = /^matrix\((.+)\)$/.exec(transform);
       
        /* istanbul ignore next */
        if (matrix && matrix[1]) {
            const [scaleX,,, scaleY] = matrix[1].split(',').map(x => +x);

            newLeft -= ((width / scaleX) - width) / 2;
            newTop -= ((height / scaleY) - height) / 2;
        }

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

    getElementIndex(element: Element): number {
        let index = 0;
        let prevElement = element;

        while (prevElement.previousElementSibling) {
            index++;
            prevElement = prevElement.previousElementSibling;
        }

        return index;
    },
};