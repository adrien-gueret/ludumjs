# LudumJS

A small framework helping to create board games with JavaScript.

## What is it?

**LudumJS** idea is very simple : a board game has multiple phases. During each phase, players are allowed to perform some actions.

For example, in a cards game like _Magic: The Gathering_, you draw a card during the draw phase, you can play cards during the main phase and you can attack the opponent during the combat phase.

**LudumJS** provides a way to easily manage these phases. That's just it!

Main benefit of using **LudumJS** is to have a well structured code for your board games, thanks to the concept of "one game phase = one JS class".

## How to install?

### With yarn/npm

```
npm i ludumjs
OR
yarn add ludumjs
```

Then using it in your project:

```js
import LudumJS from 'ludumjs/client';

console.log(LudumJS.Game, LudumJS.Phase);
```

### Directly in the browser

Entry point of your game must be a JS file importing **LudumJS**:

```js
import LudumJS from 'https://unpkg.com/ludumjs@2.0.0/client.js';

const myGame = new LudumJS.Game(document.getElementById('game'));
```

This entry point must be inserted thanks to module script tag:

```html
<script type="module" src="./game-entry-point.js"></script>
```

**LudumJS** is indeed built with ES6 modules. As for today, all modern browsers support them, according to [caniuse](https://caniuse.com/#feat=es6-module).

If you want your game to be playable on older browsers, you will need to pack your code with a tool like [webpack](https://webpack.js.org/) or [Parcel](https://parceljs.org/)
(but in this case you should probably install **LudumJS** via npm/yarn, see above).

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
If you include the CSS file of **LudumJS** (https://unpkg.com/ludumjs@2.0.0/ludumjs.css), this rule will be applied: 

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