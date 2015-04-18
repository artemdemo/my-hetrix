/// <reference path="Base_class.ts" />
/// <reference path="Brick_class.ts" />

var base = new Base( '#game' );
var colors:string[] = base.colors;

var bricksCount = 1;
new Brick( base );

var _interval = setInterval(function(){
    var rndColor = colors[ Math.floor(Math.random() * colors.length) ];

    new Brick( base, rndColor );
    if ( bricksCount++ > 2 ) clearInterval(_interval);
}, 1500);
