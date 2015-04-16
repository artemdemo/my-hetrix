
interface brickDataConfig {
    brickEl: any;
    className: string;
    speed: number; // how much time will take to fall from the start point till the base - will be recalculated if brick was stopped
    radiusPosition: number; // radius that determine position of the brick
    height: number;
    gap: number; // gap before next brick
    startAngle: number; // will determine home section of the brick
}

class Brick {

    $baseObjRef: Base;

    $brick: brickDataConfig;

    /**
     * Determine whether brick can or can't continue to fall
     */
    private activeFalling: boolean;

    /**
     * Object constructor
     * @param base
     */
    constructor( base: Base ) {
        var radiusPos = base.$field.radius;
        var edgesNum = base.$base.edgesNum;

        this.$baseObjRef = base;

        this.$brick = {
            brickEl: null,
            className: 'brick ygreen',
            speed: 10,
            radiusPosition: radiusPos,
            height: 20,
            gap: 3,
            startAngle: 360 / edgesNum * Math.floor(Math.random() * edgesNum) // random number between 0 and edges amount
        };

        this.drawBrick( radiusPos );

        this.startFalling();
    }

    /**
     * Start brick falling
     */
    startFalling() {
        var last = +new Date();
        // ToDo: speed need to be recalculated after stopping
        var speed = this.$brick.speed;
        var radius = this.$brick.radiusPosition;

        this.activeFalling = true;

        var tick = () => {
            radius = radius - (+new Date() - last) / speed;
            last = +new Date();

            this.drawBrick( radius );

            if (radius - this.$brick.height - this.$brick.gap > this.$baseObjRef.$base.radius && !! this.activeFalling ) {
                (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
            } else {
                console.log( this.$brick );
                this.activeFalling = false;
            }
        };

        tick();
    }

    /**
     * Stop brick from falling
     */
    stopFalling() {
        this.activeFalling = false;
    }

    /**
     * Rotate brick
     * @param direction
     */
    rotateBrick( direction: string ) {
        var x,y,angle: string;
        var base = this.$baseObjRef.$base;
        angle = String( 360 / base.edgesNum ); // angle of rotation
        // coordinates of rotation center
        x = String( base.baseX );
        y = String( base.baseY );
        if ( direction == 'left' ) angle = '-' + angle;
        this.$brick.brickEl.animate(
            { transform: "r" + angle + ","+ x +","+ y },
            base.rotationTime,
            null, // easing function
            () => {
                // removing attribute, so I will be able to use it again
                this.$base.baseEl.node.removeAttribute('transform');
            }
        );
    }

    /**
     * Drawing brick
     *
     * @param startRadius {number} - optional
     */
    drawBrick( startRadius: number ) {
        var $base = this.$baseObjRef.$base;

        var baseRadius = startRadius;
        var angle = this.$brick.startAngle;
        var edgesNum = $base.edgesNum;
        var brickPath: string;

        var x = $base.baseX + baseRadius * Math.cos(Math.PI * angle / 180);
        var y = $base.baseY + baseRadius * Math.sin(Math.PI * angle / 180);
        brickPath = "M " + String(x) + "," + String(y) + " ";

        angle += 360 / edgesNum;
        brickPath += nextLine(baseRadius, angle);

        baseRadius -= this.$brick.height;
        brickPath += nextLine(baseRadius, angle);

        angle -= 360 / edgesNum;
        brickPath += nextLine(baseRadius, angle);

        this.$brick.radiusPosition = startRadius;

        if ( this.$brick.brickEl == null ) {
            // If there is no brick element - creating one
            this.$brick.brickEl = this.$baseObjRef.$gamePaper.path( brickPath );
            this.$brick.brickEl.node.setAttribute( 'class', this.$brick.className );
        } else {
            // If it exists - changing path
            this.$brick.brickEl.attr({ d: brickPath });
        }

        function nextLine(baseRadius, angle) {
            x = $base.baseX + baseRadius * Math.cos(Math.PI * angle / 180);
            y = $base.baseY + baseRadius * Math.sin(Math.PI * angle / 180);
            return "L " + String(x) + "," + String(y) + " ";
        }
    }

}