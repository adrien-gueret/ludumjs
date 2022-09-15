import dom from '../dom';

describe('utils/dom', () => {
    describe('appendChildWithTransition', () => {
        it('should clone given element and move it into given container', async () => {
           const domElement = document.createElement('div');
           const container = document.createElement('div');

           domElement.style.setProperty('transform', 'scale(.8)');

           jest.spyOn(domElement, 'cloneNode');
           jest.spyOn(container, 'appendChild');
           
           document.body.appendChild(domElement);
           document.body.appendChild(container);

           await dom.appendChildWithTransition(domElement, container);
        
            expect(domElement.cloneNode).toHaveBeenCalledWith(true);
            expect(container.appendChild).toHaveBeenCalledWith(domElement);
        });
    });

    describe('getElementIndex', () => {
        it('should return node element index in DOM from its container', () => {
            const parent = document.createElement('div');
            const child0 = document.createElement('div');
            const child1 = document.createElement('div');
            const child2 = document.createElement('div');

            parent.appendChild(document.createTextNode('Some text'));
            parent.appendChild(child0);
            parent.appendChild(document.createTextNode('to try to make some troubles'));
            parent.appendChild(child1);
            parent.appendChild(document.createTextNode('with element index'));
            parent.appendChild(child2);

            [child0, child1, child2].forEach((child, index) => {
                expect(dom.getElementIndex(child)).toBe(index);
            });
        });
    });
});
