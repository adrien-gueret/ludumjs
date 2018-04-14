# LudumJS

A small framework helping to create board games with JavaScript.

## What is it?

**LudumJS** idea is very simple : a board game has multiple phases. During each phase, players are allowed to perform some actions.

For example, in a cards game like _Magic: The Gathering_, you draw a card during the draw phase, you can play cards during the main phase and you can attack the opponent during the combat phase.

**LudumJS** provides a way to easily manage these phases. That's just it!

## How to use it?

When using **LudumJS**, you have to declare all the phases of your game.  
To do that, create a class for each phase:

```js
class DrawPhase extends LudumJS.Phase {
    onStart() {
        console.log('Draw phase starts', this.game);
    }

    onClick(e) {
        console.log('click', e, this.game);
    }

    onEnd() {
        console.log('Draw phase ends', this.game);
    }
}
```

_onStart_, _onClick_ and _onEnd_ are automatically called by **LudumJS** when neededs.

Once your phases are defined, you have to register them into your game:

```js
const gameContainer = document.getElementById('game');
const myGame = new LudumJS.Game(gameContainer);

myGame.registerPhases([
    InitPhase,
    DrawPhase,
    MainPhase,
    CombatPhase
]);

myGame.start(); // Go to first registered phase
```

The Phase classes will contain the most part of your game code, thanks to the callbacks _onStart_, _onClick_ and _onEnd_. Note that inside these callbacks, you can access the game instance via `this.game`.

In order to change phase, you have to call the method `goToPhaseByName` from your game isntance:

```js
class InitPhase extends LudumJS.Phase {
    onClick() {
        // When clicking during InitPhase, go to DrawPhase
        this.game.goToPhaseByName('DrawPhase');
    }
}
```

And that's it for JavaScript! The rest is managed by CSS.  
If you include the CSS file of **LudumJS**, this rule will be applied: 

```css
.ludumjs-game-container * {
    pointer-events: none;
}
```

That means that ALL elements inside your game container won't be clickable anymore. That's the trick that will allow you to control the possible actions on each phase.

When switching phase, **LudumJS** automatically applies a className to the game container. This className is the snake-case version of the active phase. Thanks to that, you can use CSS to define which can be clickable according to the current phase.

Please find below a basic example:

```html
<body>
    <main id="my-game">
        <div class="board">
            <div class="deck">You deck</div>
        </div>
        <button class="play-button">Play!</button>
    </main>
</body>
```

```css
/* By default, our board game and the "play button" are hidden */
.board, .play-button {
    display: none;
}

/* On init phase, display "play button" and make it clickable */
#my-game.init-phase > .play-button {
    pointer-events: initial;
    display: inline-block;
}

/* On draw phase, display the board and male the deck clickable */
#my-game.draw-phase > .board {
    display: block;
}

#my-game.draw-phase > .board .deck {
    pointer-events: initial;
}
```