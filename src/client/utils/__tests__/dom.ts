import dom from '../dom';

describe('utils/dom', () => {
    describe('appendChildWithTransition', () => {
        it('should clone given element and move it into given container', async () => {
           const domElement = document.createElement('div');
           const container = document.createElement('div');

           jest.spyOn(domElement, 'cloneNode');
           jest.spyOn(container, 'appendChild');
           
           document.body.appendChild(domElement);
           document.body.appendChild(container);

           await dom.appendChildWithTransition(domElement, container);
        
            expect(domElement.cloneNode).toHaveBeenCalledWith(true);
            expect(container.appendChild).toHaveBeenCalledWith(domElement);
        });
    });
});
