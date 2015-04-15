/// <reference path="types/snapsvg.d.ts" />
/**
 * Base Class for control hexagon
 */
var Base = (function () {
    function Base(gameID) {
        var wHeight;
        // Create main game paper
        this.$gamePaper = Snap(gameID);
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
    Base.prototype.drawBase = function (startAngle) {
        if (startAngle === void 0) { startAngle = 0; }
        var angle = startAngle; // angle are in degrees
        var baseRadius = this.$base.radius;
        var fieldRadius = this.$field.radius;
        var angleStep = 360 / this.$base.edgesNum;
        var edgesNum = this.$base.edgesNum - 1; // I will not need the last edge - path will close automatically
        var pathStrBase;
        var pathStrField;
        this.$base.startAngle = startAngle;
        var x = this.$base.baseX + baseRadius * Math.cos(Math.PI * angle / 180);
        var y = this.$base.baseY + baseRadius * Math.sin(Math.PI * angle / 180);
        var x_field = this.$base.baseX + fieldRadius * Math.cos(Math.PI * angle / 180);
        var y_field = this.$base.baseY + fieldRadius * Math.sin(Math.PI * angle / 180);
        pathStrBase = "M " + String(x) + "," + String(y) + " ";
        pathStrField = "M " + String(x_field) + "," + String(y_field) + " ";
        for (var i = 0; i < edgesNum; i++) {
            angle += angleStep;
            x = this.$base.baseX + baseRadius * Math.cos(Math.PI * angle / 180);
            y = this.$base.baseY + baseRadius * Math.sin(Math.PI * angle / 180);
            pathStrBase += "L " + String(x) + "," + String(y) + " ";
            x_field = this.$base.baseX + fieldRadius * Math.cos(Math.PI * angle / 180);
            y_field = this.$base.baseY + fieldRadius * Math.sin(Math.PI * angle / 180);
            pathStrField += "L " + String(x_field) + "," + String(y_field) + " ";
        }
        if (this.$base.baseEl == null) {
            this.$field.fieldEl = this.$gamePaper.path(pathStrField);
            this.$field.fieldEl.node.id = 'field';
            this.$base.baseEl = this.$gamePaper.path(pathStrBase);
            this.$base.baseEl.node.id = 'base';
        }
        else {
            this.$base.baseEl.attr({ d: pathStrBase });
        }
    };
    /**
     * Binding keyboard events in order to rotate base
     */
    Base.prototype.bindEvents = function () {
        var _this = this;
        document.addEventListener("keydown", function (e) {
            switch (e.keyCode) {
                case 37:
                    _this.fireLeft();
                    break;
                case 39:
                    _this.fireRight();
                    break;
            }
        }, false);
    };
    /**
     * Actions in case LEFT arrow was clicked
     */
    Base.prototype.fireLeft = function () {
        this.rotateBase('left');
    };
    /**
     * Actions in case LEFT arrow was clicked
     */
    Base.prototype.fireRight = function () {
        this.rotateBase('right');
    };
    /**
     * Rotate base
     * @param direction {string} - 'left' or 'right'
     */
    Base.prototype.rotateBase = function (direction) {
        var _this = this;
        var x, y, angle;
        angle = String(360 / this.$base.edgesNum); // angle of rotation
        // coordinates of rotation center
        x = String(this.$base.baseX);
        y = String(this.$base.baseY);
        if (direction == 'left')
            angle = '-' + angle;
        this.$base.baseEl.animate({ transform: "r" + angle + "," + x + "," + y }, this.$base.rotationTime, null, function () {
            // removing attribute, so I will be able to use it again
            _this.$base.baseEl.node.removeAttribute('transform');
        });
    };
    return Base;
})();
var Brick = (function () {
    function Brick(base) {
        this.$baseObjRef = base;
        this.$brick = {
            brickEl: null
        };
        this.drawBrick();
    }
    Brick.prototype.drawBrick = function () {
        var $base = this.$baseObjRef.$base;
        var baseRadius = this.$baseObjRef.$field.radius;
        var angle = $base.startAngle;
        var edgesNum = $base.edgesNum;
        var brickPath;
        var x = $base.baseX + baseRadius * Math.cos(Math.PI * angle / 180);
        var y = $base.baseY + baseRadius * Math.sin(Math.PI * angle / 180);
        brickPath = "M " + String(x) + "," + String(y) + " ";
        angle += 360 / edgesNum;
        brickPath += nextLine(baseRadius, angle);
        baseRadius -= 20;
        brickPath += nextLine(baseRadius, angle);
        angle -= 360 / edgesNum;
        brickPath += nextLine(baseRadius, angle);
        this.$brick.brickEl = this.$baseObjRef.$gamePaper.path(brickPath);
        console.log(this.$brick.brickEl);
        this.$brick.brickEl.node.setAttribute('class', 'brick ygreen');
        function nextLine(baseRadius, angle) {
            x = $base.baseX + baseRadius * Math.cos(Math.PI * angle / 180);
            y = $base.baseY + baseRadius * Math.sin(Math.PI * angle / 180);
            return "L " + String(x) + "," + String(y) + " ";
        }
    };
    return Brick;
})();
/// <reference path="Base_class.ts" />
/// <reference path="Brick_class.ts" />
var base = new Base('#game');
var brick = new Brick(base);
//# sourceMappingURL=app.js.map