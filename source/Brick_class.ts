
interface brickData {
    brickEl: any;
    className: string;
    speed: number; // how much time will take to fall from the start point till the base - will be recalculated if brick was stopped
    radiusPosition: number; // radius that determine position of the brick
    height: number;
    gap: number; // gap before next brick
    anglePosition: number; // will determine home section of the brick
}

class Brick {

    $baseObjRef: Base;

    $brick: brickData;

    /**
     * Determine whether brick can or can't continue to fall
     */
    private activeFalling: boolean;

    /**
     * Object constructor
     * @param base
     * @param className {string} - optional
     * @param anglePosition {number}
     */
    constructor( base: Base, className:string = 'ygreen', anglePosition:number = -1 ) {
        var radiusPos = base.$field.radius;
        var edgesNum = base.$base.edgesNum;

        this.$baseObjRef = base;

        this.$brick = {
            brickEl: null,
            className: className,
            speed: 5,
            radiusPosition: radiusPos,
            height: 20,
            gap: 3,
            anglePosition: anglePosition > -1 ? anglePosition : 360 / edgesNum * Math.floor(Math.random() * edgesNum) // random number between 0 and edges amount
        };

        this.drawBrick( radiusPos );

        this.startFalling();
    }

    /**
     * Start brick falling
     */
    startFalling() {
        var last = +new Date();
        var speed = this.$brick.speed;
        var currentRadiusPos = this.$brick.radiusPosition;

        this.activeFalling = true;

        var tick = () => {
            var minRadius = this.getMinRadiusFall();
            currentRadiusPos -= (+new Date() - last) / speed;
            last = +new Date();

            this.drawBrick( currentRadiusPos );

            if (currentRadiusPos > minRadius && !! this.activeFalling ) {
                (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
            } else {
                this.stopFalling();
            }
        };

        tick();
    }

    /**
     * Stop brick from falling
     */
    stopFalling() {
        this.activeFalling = false;

        // I need to redraw brick after stopping the animation to be sure that it will take the exact right position
        this.drawBrick( this.getMinRadiusFall() );

        this.$baseObjRef.attachBrick( this );
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

        // I'm changing angle before animation even starts in order to prevent data collision with falling bricks
        this.$brick.anglePosition = this.normalizeAngle( this.$brick.anglePosition + parseFloat(angle) );

        this.$brick.brickEl.animate(
            { transform: "r" + angle + ","+ x +","+ y },
            base.rotationTime,
            null, // easing function
            () => {
                // removing attribute, so I will be able to use it again
                this.$brick.brickEl.node.removeAttribute('transform');

                // redraw brick in new position
                this.drawBrick( this.$brick.radiusPosition );
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
        var angle = this.$brick.anglePosition;
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
            this.$brick.brickEl.node.setAttribute( 'class', 'brick ' + this.$brick.className );

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

    /**
     * Normalize angle.
     * Converts -20 to 340.
     *
     * @param angle {number}
     * @returns {number}
     */
    normalizeAngle ( angle:number ):number {
        var newAngle: number;
        switch ( true ) {
            case angle < 0:
                newAngle = angle + 360;
                break;
            case angle >= 360:
                newAngle = angle - 360;
                break;
            default:
                newAngle = angle;
        }
        return newAngle;
    }

    /**
     * Return min radius fall for the current brick.
     * Check if there are bricks in the way and calculate where current brick need to stop fall animation.
     *
     * @returns {number}
     */
    private getMinRadiusFall():number {
        var $brick = this.$brick;
        var $base = this.$baseObjRef;
        var minRadius:number;
        var attachedBricks:Brick[] = $base.getAttachedBricksByAnglePos( $brick.anglePosition );

        minRadius = $base.$base.radius + $brick.height + $brick.gap;

        if ( attachedBricks.length > 0 ) {
            for ( var i=0, len=attachedBricks.length; i<len; i++ ) {
                var brick:Brick = attachedBricks[i];
                minRadius += brick.$brick.height + brick.$brick.gap;
            }
        }

        return minRadius;
    }
}