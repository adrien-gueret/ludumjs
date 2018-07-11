import Game from '../Game';
import Phase from '../Phase';

describe('Game', () => {
    let MyGame;
    let MyPhase;

    beforeEach(() => {
        MyGame = class extends Game {};
        MyPhase = class extends Phase {
            static id = 'MyPhase';
        };
    });

    describe('constructor', () => {
        it('should correctly init instance', () => {
            const game = new MyGame();

            expect(game.phases).toEqual([]);
            expect(game.currentPhase).toBeNull();
        });
    });

    describe('other methods', () => {
        let game;

        beforeEach(() => {
            game = new MyGame();
        });

        describe('start', () => {
            it('should go to first phase', () => {
                const phase1 = new MyPhase(game);
                const phase2 = new MyPhase(game);
                
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
                game.registerPhase(MyPhase);

                const phase = game.phases[0];

                expect(phase).toBeInstanceOf(MyPhase);
                expect(phase.game).toBe(game);
            });

            it('should throw if given class is already registered', () => {
                game.registerPhase(MyPhase);

                expect(() => game.registerPhase(MyPhase)).toThrow();
            });
        });

        describe('registerPhases', () => {
            it('should register all given phases classes', () => {
                class MyPhase2 extends Phase {
                    static id = 'MyPhase2';
                }
                game.registerPhase = jest.fn();

                game.registerPhases([MyPhase, MyPhase2]);

                expect(game.registerPhase).toHaveBeenCalledWith(MyPhase);
                expect(game.registerPhase).toHaveBeenCalledWith(MyPhase2);
            });
        });

        describe('getPhaseById', () => {
            class MyPhase2 extends Phase {
                static id = 'MyPhase2';
            }

            beforeEach(() => {
                game.registerPhases([MyPhase, MyPhase2]);
            });

            it('should return corresponding phase', () => {
                const phase = game.getPhaseById('MyPhase2');
                expect(phase).toBeInstanceOf(MyPhase2);
            });

            it('should return undefined if phase is not found', () => {
                const phase = game.getPhaseById('MyPhase3');
                expect(phase).toBeUndefined();
            });
        });

        describe('goToPhase', () => {
            let currentPhase;
            let newPhase;

            beforeEach(() => {
                currentPhase = new MyPhase(null);
                newPhase = new MyPhase(null);

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

        describe('goToPhaseById', () => {
            it('should be an helper for goToPhase method', () => {
                game.registerPhase(MyPhase);
                game.goToPhase = jest.fn();

                game.goToPhaseById('MyPhase', 'foo', 'bar');

                expect(game.goToPhase).toHaveBeenCalledWith(expect.any(MyPhase), 'foo', 'bar');
            });
        });
    });
});
