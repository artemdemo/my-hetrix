/// <reference path="Base_class.ts" />
/// <reference path="Brick_class.ts" />
/// <reference path="Score_class.ts" />

var base = new Base( '#game' );

new Brick( base, 'ygreen', 0 );

var nextColor = base.colors[ Math.floor(Math.random() * base.colors.length) ];
base.setNextBrickColor( nextColor );

var _interval;

var gameStep = function(){
    var colors:string[] = base.colors;

    new Brick( base, nextColor );
    if ( !! base.gameOver ) {
        var $gameOver = document.getElementById('game-over');
        $gameOver.className += ' show';
        clearInterval(_interval)
    }
    nextColor = colors[ Math.floor(Math.random() * colors.length) ];
    base.setNextBrickColor( nextColor );
};

_interval = setInterval(gameStep, 1000);

document.addEventListener("keydown", function(e) {
    // pressed 'p' button
    if ( e.keyCode == 80 ) clearInterval(_interval);
}, false);

/*// Test Falling after removing bottom bricks
 var bricksCount = 1;
var _interval = setInterval(function(){
    if ( bricksCount < 3 ) new Brick( base, 'blue', 60 );
    else if ( bricksCount == 3 ) new Brick( base, 'orange', 60 );
    else if ( bricksCount == 4 ) new Brick( base, 'purple', 60 );
    else new Brick( base, 'blue', 120 );

    if ( bricksCount++ > 5 ) clearInterval(_interval);
}, 1000);*/
