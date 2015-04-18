/// <reference path="Base_class.ts" />
/// <reference path="Brick_class.ts" />

var base = new Base( '#game' );
var colors:string[] = base.colors;

var bricksCount = 1;
new Brick( base, 'ygreen', 0 );

var _interval = setInterval(function(){
    var rndColor = colors[ Math.floor(Math.random() * colors.length) ];

    new Brick( base, rndColor );
    if ( bricksCount++ > 10 ) clearInterval(_interval);
}, 1000);
