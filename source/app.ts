/// <reference path="Base_class.ts" />
/// <reference path="Brick_class.ts" />
/// <reference path="Score_class.ts" />

var base = new Base( '#game' );

/**
 * Real game
 * http://localhost/my-hextris/
 */
if ( urlParam('isTest') != 'true' ) {

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

}


/**
 * Test mode
 * http://localhost/my-hextris/?isTest=true
 */
if ( urlParam('isTest') == 'true' ) {
    var bricksCount = 1;
    var _interval:any = setInterval(function () {
        var fallSpeed:number = 1;
        if (bricksCount < 3) new Brick(base, 'blue', 60, fallSpeed);
        else if (bricksCount == 3) new Brick(base, 'orange', 60, fallSpeed);
        else if (bricksCount == 4) new Brick(base, 'purple', 60, fallSpeed);
        else new Brick(base, 'blue', 120, fallSpeed);

        if (bricksCount++ > 5) clearInterval(_interval);
    }, 500);
}


function urlParam(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}