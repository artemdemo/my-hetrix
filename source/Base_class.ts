/// <reference path="types/snapsvg.d.ts" />

/**
 * Interface for basic configuration of control hexagon
 */
interface baseData {
    baseEl: any;
    baseX: number;
    baseY: number;
    radius: number;
    rotationTime: number;
    edgesNum: number;
    startAngle: number; // start angle is important if base is not symmetric - on this angle will be based all graphics
}

interface fieldData {
    fieldEl: any;
    radius: number;
}

interface filteredBricks {
    [key: string]: Brick[];
}

/**
 * Base Class for control hexagon
 */
class Base {
    /**
     * Main game paper
     */
    $gamePaper;

    /**
     * Base control element of the game
     */
    $base: baseData;

    /**
     * Background field
     */
    $field: fieldData;

    /**
     * Score instance
     */
    $score: Score;

    /**
     * Determine whether game is over or not
     * @type {boolean}
     */
    gameOver: boolean = false;

    /**
     * Brick colors.
     * I'm using function updateColors() in order to set it
     *
     * @type {string[]}
     */
    colors:string[] = [];

    private attachedBricks:Brick[] = [];

    constructor(gameID: string) {
        var wHeight:number, wWidth: number;

        // Create main game paper
        this.$gamePaper = Snap( gameID );

        // calculate height of the paper
        wHeight = window.innerHeight - 10;
        wWidth = window.innerWidth;

        this.$gamePaper.node.style.height = wHeight + '.px';
        this.$gamePaper.node.style.width = wWidth + '.px';

        this.$field = {
            fieldEl: null,
            radius: this.calculateFieldRadius( wWidth, wHeight )
            //radius: this.isMobile() ? (wWidth - 10) / 2 : 100
        };

        // Setting up basic data about control hexagon element
        this.$base = {
            baseEl: null,
            baseX: wWidth / 2,
            baseY: wHeight / 2,
            rotationTime: this.isMobile() ? 65 : 100,
            radius: this.$field.radius / 4.2,
            edgesNum: 6,
            startAngle: 0
        };

        this.drawBase();
        if ( this.isMobile() ) this.addControllers();
            else this.bindEvents();

        this.updateColors(1);

        this.$score = new Score( this );
    }

    /**
     * Drawing the main control element of the game
     *
     * @param startAngle {number} - starting angle for the base element
     */
    drawBase( startAngle: number = 0 ) {
        var angle = startAngle; // angle are in degrees
        var baseRadius = this.$base.radius;
        var fieldRadius = this.$field.radius;
        var angleStep = 360 / this.$base.edgesNum;
        var edgesNum = this.$base.edgesNum - 1; // I will not need the last edge - path will close automatically
        var pathStrBase: string;
        var pathStrField: string;

        this.$base.startAngle = startAngle;

        var x = this.$base.baseX + baseRadius * Math.cos(Math.PI * angle / 180);
        var y = this.$base.baseY + baseRadius * Math.sin(Math.PI * angle / 180);

        var x_field = this.$base.baseX + fieldRadius * Math.cos(Math.PI * angle / 180);
        var y_field = this.$base.baseY + fieldRadius * Math.sin(Math.PI * angle / 180);

        pathStrBase = "M " + String(x) + "," + String(y) + " ";

        pathStrField = "M " + String(x_field) + "," + String(y_field) + " ";

        for ( var i=0; i<edgesNum; i++ ) {
            angle += angleStep;

            x = this.$base.baseX + baseRadius * Math.cos(Math.PI * angle  /180);
            y = this.$base.baseY + baseRadius * Math.sin(Math.PI * angle / 180);

            pathStrBase += "L " + String(x) + "," + String(y) + " ";

            x_field = this.$base.baseX + fieldRadius * Math.cos(Math.PI * angle / 180);
            y_field = this.$base.baseY + fieldRadius * Math.sin(Math.PI * angle / 180);

            pathStrField += "L " + String(x_field) + "," + String(y_field) + " ";
        }

        // base abd field should have closed path
        pathStrBase += "z";
        pathStrField += "z";

        if ( this.$base.baseEl == null ) {
            this.$field.fieldEl = this.$gamePaper.path( pathStrField );
            this.$field.fieldEl.node.id = 'field';

            this.$base.baseEl = this.$gamePaper.path( pathStrBase );
            this.$base.baseEl.node.id = 'base';
        } else {
            this.$base.baseEl.attr({ d: pathStrBase });
        }
    }

    /**
     * In order to make it more difficult - I'm adding different colors
     *
     * @param level {number}
     */
    updateColors( level: number ) {
        switch (level) {
            case 0:
            case 1:
                this.colors = [ 'ygreen', 'blue' ];
                break;
            case 2:
                this.colors = [ 'ygreen', 'blue', 'orange' ];
                break;
            case 3:
                this.colors = [ 'ygreen', 'blue', 'purple', 'orange' ];
                break;
            default:
                this.colors = [ 'ygreen', 'blue', 'purple', 'orange', 'cyan' ];
        }
    }

    setNextBrickColor( nextColor:string ) {
        var fieldNode = this.$field.fieldEl.node;
        // ToDo: I don't like this solution - add hexagon to the right bottom side - it will suggest next color
        //fieldNode.setAttribute('class', nextColor);
    }

    /**
     * Attach new brick to the base
     *
     * @param newBrick
     */
    attachBrick( newBrick: Brick ) {
        this.attachedBricks.push( newBrick );
        this.processCombinations();

        this.checkIfGameOver();
    }

    /**
     * Return array of attached bricks that fit to given angle
     * @param angle
     * @returns {Brick[]}
     */
    getAttachedBricksByAnglePos ( angle: number ) {
        var bricksArr = this.attachedBricks;
        var resultArr:Brick[] = [];

        for ( var i=0, len=bricksArr.length; i<len; i++ ) {
            var brick:Brick = bricksArr[i];
            if ( brick.$brick.anglePosition == angle ) resultArr.push( brick );
        }

        return resultArr;
    }

    /**
     * Remove brick by it's unique ID
     * @param id {string}
     */
    removeAttachedBrickByID ( id: string ) {
        // ToDO: remove also from DOM?
        for (var i=0, len=this.attachedBricks.length; i<len; i++) {
            if ( this.attachedBricks[i].$brick.brickEl.id == id ) {
                this.attachedBricks.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * After removing bricks could appear gap - other colors could be up the group of same color
     * I need to close this gap
     */
    closeBrickGap() {
        var attachedBricks = this.attachedBricks;
        // I'm removing all attached brick, case I want to make them all to fall
        this.attachedBricks = [];
        for (var i=0, len=attachedBricks.length; i<len; i++) {
            attachedBricks[i].startFalling();
        }
    }

    /**
     * Check if ne of brick stacks reached maximum.
     * If so - set this.gameOver to 'true'
     */
    private checkIfGameOver() {
        var filteredBricks: filteredBricks;
        // ToDo: Check if one of brick stacks reached maximum -> game over

        // Filter all bricks by angle
        filteredBricks = this.filterBricksByAngle();

        for ( var angle in filteredBricks ) {
            var maxHeight:number = this.$field.radius;
            var currentHeight:number = 0;
            if ( filteredBricks[angle].length > 1 ) {
                var brick = filteredBricks[angle][0].$brick;
                currentHeight = ( brick.height + brick.gap ) * filteredBricks[angle].length + this.$base.radius;
            }
            if ( currentHeight >= maxHeight ) this.gameOver = true;
        }
    }

    /**
     * Check whether there is any color combinations.
     * If there is - process it.
     * @return {boolean}
     */
    private processCombinations() {
        var filteredBricks: filteredBricks;
        if ( this.attachedBricks.length == 0 ) return false;

        // Filter all bricks by color
        filteredBricks = this.filterBricksByColor();

        for ( var color in filteredBricks ) {
            var len = filteredBricks[color].length;
            var siblings:number[] = [];
            if ( len < 3 ) continue;

            for ( var i=0; i<len; i++ ) {
                siblings = Array.prototype.concat( siblings, this.checkForSiblings( filteredBricks[color], i ) );
            }

            if ( siblings.length > 2 ) {
                // remove duplicate values
                // It's expensive calculation, therefore I'm checking that there is more then 2 items in array
                siblings = Base.UniqArray(siblings);

                // Again need to check that there is more then 2 items in array, after duplicates were removed
                if ( siblings.length > 2 ) {
                    var removedBricks:Brick[] = [];

                    for (var i=0, len=siblings.length; i<len; i++) {
                        var brick:Brick = filteredBricks[color][ siblings[i] ];

                        removedBricks.push(brick); // I'll need them to calculate score

                        brick.$brick.brickEl.node.setAttribute( 'class', brick.$brick.brickEl.node.getAttribute('class') + ' remove' );

                        (function(brick){
                            setTimeout(function(){
                                brick.$brick.brickEl.attr({ d: '' });
                            }, 1000);
                        })(brick);

                        this.removeAttachedBrickByID( brick.$brick.brickEl.id );
                    }

                    this.$score.updateScore( removedBricks );

                    this.closeBrickGap();
                }
            }

        }
    }

    /**
     * Check whether given brick siblings
     * @param bricksArray {Brick[]}
     * @param baseBrickID {number} -index of brick in bricksArray that should be checked
     */
    private checkForSiblings( bricksArray:Brick[], baseBrickID:number = 0 ):number[] {
        var baseBrick:brickData = bricksArray[baseBrickID].$brick;
        var results:number[] = [];
        var nextBrickRadMax:number = baseBrick.radiusPosition + baseBrick.height + baseBrick.gap;
        var nextBrickRadMin:number = baseBrick.radiusPosition - baseBrick.height - baseBrick.gap;
        var nextBrickAngMax:number = bricksArray[baseBrickID].normalizeAngle( baseBrick.anglePosition + 360 / this.$base.edgesNum );
        var nextBrickAngMin:number = bricksArray[baseBrickID].normalizeAngle( baseBrick.anglePosition - 360 / this.$base.edgesNum );

        for ( var i=0, len=bricksArray.length; i<len; i++ ) {
            var _brick:brickData = bricksArray[i].$brick;
            var _angle:number = bricksArray[baseBrickID].normalizeAngle( _brick.anglePosition );

            if ( _brick.radiusPosition == baseBrick.radiusPosition ) {
                // Because I'm working with circle - nextBrickAngMin can be bigger then nextBrickAngMax
                // For example nextBrickAngMin is 360 and nextBrickAngMax is 60
                // It's mean that comparison should work through 0
                if ( nextBrickAngMin < nextBrickAngMax && ( _angle <= nextBrickAngMax && _angle >= nextBrickAngMin ) ) {
                    results.push( i );
                } else if ( nextBrickAngMin > nextBrickAngMax ) {
                    if ((_angle >= 0 && _angle <= nextBrickAngMax) || ( _angle <= 360 && _angle >= nextBrickAngMin )) {
                        results.push(i);
                    }
                }
            }
            if ( _angle == baseBrick.anglePosition && ( _brick.radiusPosition <= nextBrickRadMax && _brick.radiusPosition >= nextBrickRadMin ) ) {
                results.push( i );
            }
        }

        results = Base.UniqArray( results );
        if ( results.length < 3 ) results = [];

        return results;
    }

    /**
     * Filter bricks by color and return object of arrays
     * @returns {filteredBricks}
     */
    private filterBricksByColor():filteredBricks {
        var attachedBricks = this.attachedBricks;
        var len = attachedBricks.length;
        var filteredBricks: filteredBricks = {};

        for ( var i=0; i<len; i++ ) {
            var brick:Brick = attachedBricks[i];
            var className:string = brick.$brick.className;

            if ( ! filteredBricks.hasOwnProperty( className ) ) filteredBricks[ className ] = [];
            filteredBricks[ className ].push( brick );
        }

        return filteredBricks;
    }

    /**
     * Filter bricks by angle and return object of arrays
     * @returns {filteredBricks}
     */
    private filterBricksByAngle():filteredBricks {
        var attachedBricks = this.attachedBricks;
        var len = attachedBricks.length;
        var filteredBricks: filteredBricks = {};

        for ( var i=0; i<len; i++ ) {
            var brick:Brick = attachedBricks[i];
            var angle:string = String( brick.$brick.anglePosition );

            if ( ! filteredBricks.hasOwnProperty( angle ) ) filteredBricks[ angle ] = [];
            filteredBricks[ angle ].push( brick );
        }

        return filteredBricks
    }

    /**
     * Binding keyboard events in order to rotate base
     */
    private bindEvents() {
        document.addEventListener("keydown", (e) => {
            switch( e.keyCode ) {
                case 37:
                    this.fireLeft();
                    break;
                case 39:
                    this.fireRight();
                    break;
            }
        }, false);
    }

    /**
     * In case game was opened from mobile I need to add controllers
     */
    private addControllers() {
        var left:number = 50;
        var bottom:number = 60;
        var radius:number = 30;
        var wWidth:number = window.innerWidth;
        var wHeight:number = window.innerHeight;
        var leftCircle = this.$gamePaper.circle(left, wHeight - bottom, radius);
        var rightCircle = this.$gamePaper.circle(wWidth - left, wHeight - bottom, radius);
        leftCircle
            .addClass('controller')
            .click(()=>{
                this.fireLeft();
            });

        console.log( rightCircle );

        rightCircle
            .addClass('controller')
            .click(()=>{
                this.fireRight();
            });
    }

    /**
     * Actions in case LEFT arrow was clicked
     */
    fireLeft() {
        this.rotateBase('left');
        this.rotateBricks('left');
    }

    /**
     * Actions in case LEFT arrow was clicked
     */
    fireRight() {
        this.rotateBase('right');
        this.rotateBricks('right');
    }

    /**
     * Check whether device is mobile or not
     *
     * @returns {boolean}
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Rotate base
     * @param direction {string} - 'left' or 'right'
     */
    private rotateBase( direction: string ) {
        var x,y,angle: string;
        angle = String( 360 / this.$base.edgesNum ); // angle of rotation
        // coordinates of rotation center
        x = String( this.$base.baseX );
        y = String( this.$base.baseY );
        if ( direction == 'left' ) angle = '-' + angle;
        this.$base.baseEl.animate(
            { transform: "r" + angle + ","+ x +","+ y },
            this.$base.rotationTime,
            null, // easing function
            () => {
                // removing attribute, so I will be able to use it again
                this.$base.baseEl.node.removeAttribute('transform');
            }
        );
    }

    /**
     * Rotate attached bricks
     * @param direction
     * @returns {boolean}
     */
    private rotateBricks ( direction: string ) {
        if ( this.attachedBricks.length == 0 ) return false;
        for ( var i=0, len=this.attachedBricks.length; i<len; i++ ) {
            var brick = this.attachedBricks[i];
            brick.rotateBrick( direction );
        }
        return true;
    }

    private calculateFieldRadius( wWidth:number, wHeight:number ) {
        var radius:number;
        if ( this.isMobile() ) {
            radius = (wWidth - 10) / 2
        } else {
            if ( wWidth >= wHeight ) radius =  wHeight / 2;
            else radius = wWidth / 2
        }
        return radius;
    }

    /**
     * Remove duplicate values from tha array
     *
     * @source http://stackoverflow.com/a/17903018
     * @param a {Array}
     * @returns {Array}
     */
    private static UniqArray (a) {
        return a.reduce(function(p, c) {
            if (p.indexOf(c) < 0) p.push(c);
            return p;
        }, []);
    }
}