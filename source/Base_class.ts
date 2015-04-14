/// <reference path="types/snapsvg.d.ts" />

/**
 * Interface for basic configuration of control hexagon
 */
interface baseDataConfig {
    baseEl: any;
    baseX: number;
    baseY: number;
    radius: number;
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
        this.$base.baseX = window.innerWidth / 2;
        this.$base.baseY = window.innerHeight / 2;
        this.$base.radius = 150;

        this.drawBase();
    }

    /**
     * Drawing the main control element of the game
     */
    drawBase() {
        var startAngle = 0, endAngle = 0; // startAngle & endAngle are in degrees
        var baseRadius = this.$base.radius;
        var edgesNum = 6;
        var x1,x2,y1,y2 = 0;
        var startX, startY;

        for ( var i=0; i<edgesNum; i++ ) {
            startAngle = endAngle;
            endAngle = startAngle + 30;

            x1 = this.$base.baseX + baseRadius*Math.cos(Math.PI*startAngle/180);
            y1 = this.$base.baseY + baseRadius*Math.sin(Math.PI*startAngle/180);

            x2 = this.$base.baseX + baseRadius*Math.cos(Math.PI*endAngle/180);
            y2 = this.$base.baseY + baseRadius*Math.sin(Math.PI*endAngle/180);

            /*
             * Solving problem of not fitting the last sector with the first one
             * This problem cases by number rounding, and the easiest way to solve it - is to use the same coordinates for the last point as for the first one
             */
            if ( i == 0 ) {
                startX = x1; startY = y1;
            } else if ( i == edgesNum - 1 ) {
                x2 = startX; y2 = startY;
            }
        }

        this.$base.baseEl = this.$gamePaper.circle(150, 150, 100);
    }

}