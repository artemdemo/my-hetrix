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
    [color: string]: Brick[]
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
     * Brick colors
     * @type {string[]}
     */
    //colors:string[] = [ 'ygreen', 'blue', 'cyan', 'purple', 'orange' ];
    colors:string[] = [ 'blue' ];

    private attachedBricks:Brick[] = [];

    constructor(gameID: string) {
        var wHeight:number;

        // Create main game paper
        this.$gamePaper = Snap( gameID );

        // calculate height of the paper
        wHeight = window.innerHeight - 10;
        this.$gamePaper.node.style.height = wHeight + '.px';

        // Setting up basic data about control hexagon element
        this.$base = {
            baseEl: null,
            baseX: window.innerWidth / 2,
            baseY: window.innerHeight / 2,
            rotationTime: 100,
            radius: 100,
            edgesNum: 6,
            startAngle: 0
        };

        this.$field = {
            fieldEl: null,
            radius: this.$base.radius * 4.5
        };

        this.drawBase();
        this.bindEvents();
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
     * Attac new brick to the base
     * @param newBrick
     */
    attachBrick( newBrick: Brick ) {
        this.attachedBricks.push( newBrick );
        this.processCombinations();
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
                    for (var i=0, len=siblings.length; i<len; i++) {
                        var brick:Brick = filteredBricks[color][ siblings[i] ];
                        // ToDo: Add some animation (like opacity)
                        brick.$brick.brickEl.attr({ d: '' });
                        this.removeAttachedBrickByID( brick.$brick.brickEl.id );
                    }
                    console.log( this.attachedBricks );
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
            if (
                ( _brick.radiusPosition == baseBrick.radiusPosition && ( _brick.anglePosition <= nextBrickAngMax && _brick.anglePosition >= nextBrickAngMin ) ) ||
                ( _brick.anglePosition == baseBrick.anglePosition && ( _brick.radiusPosition <= nextBrickRadMax && _brick.radiusPosition >= nextBrickRadMin ) )
            ) {
                results.push( i );
            }
        }

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