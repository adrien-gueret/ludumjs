const getLastIdTime = (() => {
    let lastIdTime = Date.now();
    
    return () => {
        const now = Date.now();
        lastIdTime = now > lastIdTime ? now : lastIdTime + 1;

        return lastIdTime;
    };
})();

export default function withUniqId(target) {
    class constructorWithUniqId extends target {
        constructor(...args) {
            super(...args);

            this.uniqId = getLastIdTime().toString(36);
        }
    }

    return <typeof target> constructorWithUniqId;
}