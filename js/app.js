/// <reference path="types/snapsvg.d.ts" />
var Base = (function () {
    function Base(gameID) {
        var wHeight;
        // Create main game paper
        this.$gamePaper = Snap(gameID);
        // calculate height of the paper
        wHeight = window.innerHeight - 10;
        this.$gamePaper.node.style.height = wHeight + '.px';
        this.drawBase();
    }
    /**
     * Drawing the main control element of the game
     */
    Base.prototype.drawBase = function () {
        this.$base = this.$gamePaper.circle(150, 150, 100);
    };
    return Base;
})();
/// <reference path="Base_class.ts" />
var base = new Base('#game');
//# sourceMappingURL=app.js.map