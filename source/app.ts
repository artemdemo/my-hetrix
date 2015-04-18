/// <reference path="Base_class.ts" />
/// <reference path="Brick_class.ts" />
/// <reference path="Score_class.ts" />

var base = new Base( '#game' );

var bricksCount = 1;
new Brick( base, 'ygreen', 0 );

var _interval = setInterval(function(){
    var colors:string[] = base.colors;
    var rndColor = colors[ Math.floor(Math.random() * colors.length) ];

    new Brick( base, rndColor );
    if ( !! base.gameOver ) {
        console.log( 'GAME OVER' );
        clearInterval(_interval)
    }
}, 1000);

/*// Test Falling after removing bottom bricks
var _interval = setInterval(function(){
    if ( bricksCount < 3 ) new Brick( base, 'blue', 60 );
    else if ( bricksCount == 3 ) new Brick( base, 'orange', 60 );
    else if ( bricksCount == 4 ) new Brick( base, 'purple', 60 );
    else new Brick( base, 'blue', 120 );

    if ( bricksCount++ > 5 ) clearInterval(_interval);
}, 1000);*/
