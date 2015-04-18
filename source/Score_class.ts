
interface scoreData {
    scoreEl: any;
    currentScore: number;
    currentSpeed: number;
}

class Score {

    $score: scoreData;

    private $baseRefObj: Base;

    constructor( base: Base ) {

        this.$baseRefObj = base;

        this.$score = {
            scoreEl: null,
            currentScore: 0,
            currentSpeed: 5
        };

        this.drawScore();
    }

    drawScore() {
        var score:scoreData = this.$score;
        var x:number = this.$baseRefObj.$base.baseX;
        var y:number = this.$baseRefObj.$base.baseY;

        // I need to draw text node in order to calculate it's dimensions
        if ( score.scoreEl == null ) score.scoreEl = this.$baseRefObj.$gamePaper.text( x, y, String( score.currentScore ) );
        else score.scoreEl.node.innerHTML = String( score.currentScore );

        score.scoreEl.node.setAttribute( 'class', 'base-score' );

        // Now I can get it's real size
        x = x - score.scoreEl.node.clientWidth / 2;
        y = y + score.scoreEl.node.clientHeight / 4;

        score.scoreEl.node.setAttribute( 'x', x );
        score.scoreEl.node.setAttribute( 'y', y );
    }

    /**
     * Updating score base on amount of bricks that has been removed
     * @param removedBricks
     */
    updateScore( removedBricks: Brick[] ) {
        var score:scoreData = this.$score;

        score.currentScore += removedBricks.length;

        switch ( true ) {
            case score.currentScore > 35:
                this.$baseRefObj.updateColors(4);
                break;
            case score.currentScore > 25:
                this.$baseRefObj.updateColors(3);
                break;
            case score.currentScore > 10:
                this.$baseRefObj.updateColors(2);
                break;
        }

        this.drawScore();
    }

}