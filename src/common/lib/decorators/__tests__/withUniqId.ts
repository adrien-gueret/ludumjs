import withUniqId from '../withUniqId';

describe('withUniqId', () => {
    it('should inject uniq id to each instance of applied class', () => {
        @withUniqId
        class Test {
            uniqId: string;
        }

        const allInstances: Array<Test> = [];

        for(let i = 0; i < 100; i++) {
            allInstances.push(new Test());
        }

        const uniqIds: Array<string> = allInstances.map(instance => instance.uniqId);
        const deduped: Array<string> = [... new Set(uniqIds)];

        expect(deduped).toEqual(uniqIds);
    });
});
