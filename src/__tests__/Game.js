import Game from '../Game.js';
import Phase from '../Phase.js';

describe('Game', () => {
    describe('constructor', () => {
        it('should correctly init instance', () => {
            const domContainer = document.createElement('div');
            const game = new Game(domContainer);

            expect(game.domContainer).toBe(domContainer);
            expect(game.phases).toEqual([]);
            expect(game.currentPhase).toBeNull();
            expect(domContainer.classList.contains('ludumjs-game-container')).toBe(true);
        });
    });

    describe('other methods', () => {
        let game;

        beforeEach(() => {
            game = new Game(document.createElement('div'));
        });

        describe('start', () => {
            it('should go to first phase', () => {
                const phase1 = new Phase(game);
                const phase2 = new Phase(game);
                
                game.phases = [phase1, phase2];
                game.goToPhase = jest.fn();

                game.start();

                expect(game.goToPhase).toHaveBeenCalledWith(phase1);
            });
        });

        describe('registerPhase', () => {
            it('should throw if given class does not inherit from Phase', () => {
                class Test {}
                expect(() => game.registerPhase(Test)).toThrow();
            });

            it('should register instance of given Phase class if all is OK', () => {
                class Test extends Phase {}
                game.registerPhase(Test);

                const phase = game.phases[0];

                expect(phase).toBeInstanceOf(Test);
                expect(phase.game).toBe(game);
            });

            it('should throw if given class is already registered', () => {
                class Test extends Phase {}
                game.registerPhase(Test);

                expect(() => game.registerPhase(Test)).toThrow();
            });
        });

        describe('registerPhases', () => {
            it('should register all given phases classes', () => {
                class Test extends Phase {}
                class Test2 extends Phase {}
                game.registerPhase = jest.fn();

                game.registerPhases([Test, Test2]);

                expect(game.registerPhase).toHaveBeenCalledWith(Test);
                expect(game.registerPhase).toHaveBeenCalledWith(Test2);
            });
        });

        describe('getPhaseByName', () => {
            class Test extends Phase {}
            class Test2 extends Phase {}

            beforeEach(() => {
                game.registerPhases([Test, Test2]);
            });

            it('should return corresponding phase', () => {
                const phase = game.getPhaseByName('Test2');
                expect(phase).toBeInstanceOf(Test2);
            });

            it('should return undefined if phase is not found', () => {
                const phase = game.getPhaseByName('Test3');
                expect(phase).toBeUndefined();
            });
        });

        describe('goToPhase', () => {
            let currentPhase;
            let newPhase;

            beforeEach(() => {
                currentPhase = new Phase();
                newPhase = new Phase();

                currentPhase.end = jest.fn();
                newPhase.start = jest.fn();
            });


            it('should end current phase', () => {
                game.currentPhase = currentPhase;

                game.goToPhase(newPhase);

                expect(currentPhase.end).toHaveBeenCalled();
            });

            it('should start new phase', () => {
                game.goToPhase(newPhase);

                expect(newPhase.start).toHaveBeenCalled();
            });

            it('should start new phase with given data', () => {
                game.goToPhase(newPhase, 'foo', 'bar');

                expect(newPhase.start).toHaveBeenCalledWith('foo', 'bar');
            });
        });

        describe('goToPhaseByName', () => {
            it('should be an helper for goToPhase method', () => {
                class Test extends Phase {}
                game.registerPhase(Test);
                game.goToPhase = jest.fn();

                game.goToPhaseByName('Test', 'foo', 'bar');

                expect(game.goToPhase).toHaveBeenCalledWith(expect.any(Test), 'foo', 'bar');
            });
        });
    });
});
