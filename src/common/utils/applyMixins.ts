export default function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            if (derivedCtor.prototype.hasOwnProperty(name)) {
                return;
            }
            
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
};