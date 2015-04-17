/// <reference path="Base_class.ts" />
/// <reference path="Brick_class.ts" />

var base = new Base( '#game' );

var bricksCount = 1;

new Brick( base );

var _interval = setInterval(function(){
    new Brick( base );
    if ( bricksCount++ > 5 ) clearInterval(_interval);
}, 1500);
