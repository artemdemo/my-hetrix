
interface brickDataConfig {
    brickEl: any;
    className: string;
}

class Brick {

    $baseObjRef: Base;

    $brick: brickDataConfig;

    constructor( base: Base ) {
        this.$baseObjRef = base;

        this.$brick = {
            brickEl: null,
            className: 'brick ygreen'
        };

        this.drawBrick( this.$baseObjRef.$field.radius );
    }

    /**
     * Drawing brick
     *
     * @param startRadius {number}
     */
    drawBrick( startRadius: number ) {
        var $base = this.$baseObjRef.$base;

        var baseRadius = startRadius;
        var angle = $base.startAngle;
        var edgesNum = $base.edgesNum;
        var brickPath: string;

        var x = $base.baseX + baseRadius * Math.cos(Math.PI * angle / 180);
        var y = $base.baseY + baseRadius * Math.sin(Math.PI * angle / 180);
        brickPath = "M " + String(x) + "," + String(y) + " ";

        angle += 360 / edgesNum;
        brickPath += nextLine(baseRadius, angle);

        baseRadius -= 20;
        brickPath += nextLine(baseRadius, angle);

        angle -= 360 / edgesNum;
        brickPath += nextLine(baseRadius, angle);

        this.$brick.brickEl = this.$baseObjRef.$gamePaper.path( brickPath );
        this.$brick.brickEl.node.setAttribute( 'class', this.$brick.className );

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