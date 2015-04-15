/// <reference path="types/snapsvg.d.ts" />

/**
 * Interface for basic configuration of control hexagon
 */
interface baseDataConfig {
    baseEl: any;
    baseX: number;
    baseY: number;
    radius: number;
    rotationTime: number;
    edgesNum: number;
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
    $base: baseDataConfig;

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
            radius: 150,
            edgesNum: 6
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
        var angleStep = 360 / this.$base.edgesNum;
        var edgesNum = this.$base.edgesNum - 1; // I will not need the last edge - path will close automatically
        var pathStr: string;

        var x = this.$base.baseX + baseRadius * Math.cos(Math.PI * angle / 180);
        var y = this.$base.baseY + baseRadius*Math.sin(Math.PI*angle/180);

        pathStr = "M " + String(x) + "," + String(y) + " ";

        for ( var i=0; i<edgesNum; i++ ) {
            angle += angleStep;

            x = this.$base.baseX + baseRadius*Math.cos(Math.PI*angle/180);
            y = this.$base.baseY + baseRadius*Math.sin(Math.PI*angle/180);

            pathStr += "L " + String(x) + "," + String(y) + " ";
        }

        if ( this.$base.baseEl == null ) {
            this.$base.baseEl = this.$gamePaper.path( pathStr );
            this.$base.baseEl.node.id = 'base';
        } else {
            this.$base.baseEl.attr({ d: pathStr });
        }
    }

    /**
     * Binding keyboard events in order to rotate base
     */
    bindEvents() {
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
    }

    /**
     * Actions in case LEFT arrow was clicked
     */
    fireRight() {
        this.rotateBase('right');
    }

    /**
     * Rotate base
     * @param direction {string} - 'left' or 'right'
     */
    rotateBase( direction: string ) {
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
}