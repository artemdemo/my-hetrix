/// <reference path="types/snapsvg.d.ts" />
/**
 * Base Class for control hexagon
 */
var Base = (function () {
    function Base(gameID) {
        /**
         * Brick colors
         * @type {string[]}
         */
        //colors:string[] = [ 'ygreen', 'blue', 'cyan', 'purple', 'orange' ];
        this.colors = ['blue'];
        this.attachedBricks = [];
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
     * Attac new brick to the base
     * @param newBrick
     */
    Base.prototype.attachBrick = function (newBrick) {
        this.attachedBricks.push(newBrick);
        this.processCombinations();
    };
    /**
     * Return array of attached bricks that fit to given angle
     * @param angle
     * @returns {Brick[]}
     */
    Base.prototype.getAttachedBricksByAnglePos = function (angle) {
        var bricksArr = this.attachedBricks;
        var resultArr = [];
        for (var i = 0, len = bricksArr.length; i < len; i++) {
            var brick = bricksArr[i];
            if (brick.$brick.anglePosition == angle)
                resultArr.push(brick);
        }
        return resultArr;
    };
    /**
     * Remove brick by it's unique ID
     * @param id {string}
     */
    Base.prototype.removeAttachedBrickByID = function (id) {
        // ToDO: remove also from DOM?
        for (var i = 0, len = this.attachedBricks.length; i < len; i++) {
            if (this.attachedBricks[i].$brick.brickEl.id == id) {
                this.attachedBricks.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    /**
     * Check whether there is any color combinations.
     * If there is - process it.
     * @return {boolean}
     */
    Base.prototype.processCombinations = function () {
        var filteredBricks;
        if (this.attachedBricks.length == 0)
            return false;
        // Filter all bricks by color
        filteredBricks = this.filterBricksByColor();
        for (var color in filteredBricks) {
            var len = filteredBricks[color].length;
            var siblings = [];
            if (len < 3)
                continue;
            for (var i = 0; i < len; i++) {
                siblings = Array.prototype.concat(siblings, this.checkForSiblings(filteredBricks[color], i));
            }
            if (siblings.length > 2) {
                // remove duplicate values
                // It's expensive calculation, therefore I'm checking that there is more then 2 items in array
                siblings = Base.UniqArray(siblings);
                // Again need to check that there is more then 2 items in array, after duplicates were removed
                if (siblings.length > 2) {
                    for (var i = 0, len = siblings.length; i < len; i++) {
                        var brick = filteredBricks[color][siblings[i]];
                        // ToDo: Add some animation (like opacity)
                        brick.$brick.brickEl.attr({ d: '' });
                        this.removeAttachedBrickByID(brick.$brick.brickEl.id);
                    }
                    console.log(this.attachedBricks);
                }
            }
        }
    };
    /**
     * Check whether given brick siblings
     * @param bricksArray {Brick[]}
     * @param baseBrickID {number} -index of brick in bricksArray that should be checked
     */
    Base.prototype.checkForSiblings = function (bricksArray, baseBrickID) {
        if (baseBrickID === void 0) { baseBrickID = 0; }
        var baseBrick = bricksArray[baseBrickID].$brick;
        var results = [];
        var nextBrickRadMax = baseBrick.radiusPosition + baseBrick.height + baseBrick.gap;
        var nextBrickRadMin = baseBrick.radiusPosition - baseBrick.height - baseBrick.gap;
        var nextBrickAngMax = bricksArray[baseBrickID].normalizeAngle(baseBrick.anglePosition + 360 / this.$base.edgesNum);
        var nextBrickAngMin = bricksArray[baseBrickID].normalizeAngle(baseBrick.anglePosition - 360 / this.$base.edgesNum);
        for (var i = 0, len = bricksArray.length; i < len; i++) {
            var _brick = bricksArray[i].$brick;
            if ((_brick.radiusPosition == baseBrick.radiusPosition && (_brick.anglePosition <= nextBrickAngMax && _brick.anglePosition >= nextBrickAngMin)) ||
                (_brick.anglePosition == baseBrick.anglePosition && (_brick.radiusPosition <= nextBrickRadMax && _brick.radiusPosition >= nextBrickRadMin))) {
                results.push(i);
            }
        }
        if (results.length < 3)
            results = [];
        return results;
    };
    /**
     * Filter bricks by color and return object of arrays
     * @returns {filteredBricks}
     */
    Base.prototype.filterBricksByColor = function () {
        var attachedBricks = this.attachedBricks;
        var len = attachedBricks.length;
        var filteredBricks = {};
        for (var i = 0; i < len; i++) {
            var brick = attachedBricks[i];
            var className = brick.$brick.className;
            if (!filteredBricks.hasOwnProperty(className))
                filteredBricks[className] = [];
            filteredBricks[className].push(brick);
        }
        return filteredBricks;
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
        this.rotateBricks('left');
    };
    /**
     * Actions in case LEFT arrow was clicked
     */
    Base.prototype.fireRight = function () {
        this.rotateBase('right');
        this.rotateBricks('right');
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
    /**
     * Rotate attached bricks
     * @param direction
     * @returns {boolean}
     */
    Base.prototype.rotateBricks = function (direction) {
        if (this.attachedBricks.length == 0)
            return false;
        for (var i = 0, len = this.attachedBricks.length; i < len; i++) {
            var brick = this.attachedBricks[i];
            brick.rotateBrick(direction);
        }
        return true;
    };
    /**
     * Remove duplicate values from tha array
     *
     * @source http://stackoverflow.com/a/17903018
     * @param a {Array}
     * @returns {Array}
     */
    Base.UniqArray = function (a) {
        return a.reduce(function (p, c) {
            if (p.indexOf(c) < 0)
                p.push(c);
            return p;
        }, []);
    };
    return Base;
})();
var Brick = (function () {
    /**
     * Object constructor
     * @param base
     * @param className
     */
    function Brick(base, className) {
        if (className === void 0) { className = 'ygreen'; }
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
            anglePosition: 360 / edgesNum * Math.floor(Math.random() * edgesNum) // random number between 0 and edges amount
        };
        this.drawBrick(radiusPos);
        this.startFalling();
    }
    /**
     * Start brick falling
     */
    Brick.prototype.startFalling = function () {
        var _this = this;
        var last = +new Date();
        // ToDo: speed need to be recalculated after stopping
        var speed = this.$brick.speed;
        var currentRadiusPos = this.$brick.radiusPosition;
        this.activeFalling = true;
        var tick = function () {
            var minRadius = _this.getMinRadiusFall();
            currentRadiusPos -= (+new Date() - last) / speed;
            last = +new Date();
            _this.drawBrick(currentRadiusPos);
            if (currentRadiusPos > minRadius && !!_this.activeFalling) {
                (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
            }
            else {
                _this.stopFalling();
            }
        };
        tick();
    };
    /**
     * Stop brick from falling
     */
    Brick.prototype.stopFalling = function () {
        this.activeFalling = false;
        // I need to redraw brick after stopping the animation to be sure that it will take the exact right position
        this.drawBrick(this.getMinRadiusFall());
        this.$baseObjRef.attachBrick(this);
    };
    /**
     * Rotate brick
     * @param direction
     */
    Brick.prototype.rotateBrick = function (direction) {
        var _this = this;
        var x, y, angle;
        var base = this.$baseObjRef.$base;
        angle = String(360 / base.edgesNum); // angle of rotation
        // coordinates of rotation center
        x = String(base.baseX);
        y = String(base.baseY);
        if (direction == 'left')
            angle = '-' + angle;
        // I'm changing angle before animation even starts in order to prevent data collision with falling bricks
        this.$brick.anglePosition = this.normalizeAngle(this.$brick.anglePosition + parseFloat(angle));
        this.$brick.brickEl.animate({ transform: "r" + angle + "," + x + "," + y }, base.rotationTime, null, function () {
            // removing attribute, so I will be able to use it again
            _this.$brick.brickEl.node.removeAttribute('transform');
            // redraw brick in new position
            _this.drawBrick(_this.$brick.radiusPosition);
        });
    };
    /**
     * Drawing brick
     *
     * @param startRadius {number} - optional
     */
    Brick.prototype.drawBrick = function (startRadius) {
        var $base = this.$baseObjRef.$base;
        var baseRadius = startRadius;
        var angle = this.$brick.anglePosition;
        var edgesNum = $base.edgesNum;
        var brickPath;
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
        if (this.$brick.brickEl == null) {
            // If there is no brick element - creating one
            this.$brick.brickEl = this.$baseObjRef.$gamePaper.path(brickPath);
            this.$brick.brickEl.node.setAttribute('class', this.$brick.className);
        }
        else {
            // If it exists - changing path
            this.$brick.brickEl.attr({ d: brickPath });
        }
        function nextLine(baseRadius, angle) {
            x = $base.baseX + baseRadius * Math.cos(Math.PI * angle / 180);
            y = $base.baseY + baseRadius * Math.sin(Math.PI * angle / 180);
            return "L " + String(x) + "," + String(y) + " ";
        }
    };
    /**
     * Normalize angle.
     * Converts -20 to 340.
     *
     * @param angle {number}
     * @returns {number}
     */
    Brick.prototype.normalizeAngle = function (angle) {
        var newAngle;
        switch (true) {
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
    };
    /**
     * Return min radius fall for the current brick.
     * Check if there are bricks in the way and calculate where current brick need to stop fall animation.
     *
     * @returns {number}
     */
    Brick.prototype.getMinRadiusFall = function () {
        var $brick = this.$brick;
        var $base = this.$baseObjRef;
        var minRadius;
        var attachedBricks = $base.getAttachedBricksByAnglePos($brick.anglePosition);
        minRadius = $base.$base.radius + $brick.height + $brick.gap;
        if (attachedBricks.length > 0) {
            for (var i = 0, len = attachedBricks.length; i < len; i++) {
                var brick = attachedBricks[i];
                minRadius += brick.$brick.height + brick.$brick.gap;
            }
        }
        return minRadius;
    };
    return Brick;
})();
/// <reference path="Base_class.ts" />
/// <reference path="Brick_class.ts" />
var base = new Base('#game');
var colors = base.colors;
var bricksCount = 1;
new Brick(base);
var _interval = setInterval(function () {
    var rndColor = colors[Math.floor(Math.random() * colors.length)];
    new Brick(base, rndColor);
    if (bricksCount++ > 2)
        clearInterval(_interval);
}, 1500);
//# sourceMappingURL=app.js.map