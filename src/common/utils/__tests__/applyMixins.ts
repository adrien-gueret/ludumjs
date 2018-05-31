import applyMixins from '../applyMixins';

describe('utils/applyMixins', () => {
    it('should add properties of given mixin into given class', () => {
        class TargetClass {
            //Mixin
            mixinMethod: () => void;
        }
        class Mixin {
            mixinMethod() { console.log('do something'); }
        }

        applyMixins(TargetClass, [Mixin]);

        expect(TargetClass.prototype.mixinMethod).toEqual(Mixin.prototype.mixinMethod);
    });
});
