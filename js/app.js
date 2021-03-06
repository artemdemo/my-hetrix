/// <reference path="types/snapsvg.d.ts" />
/**
 * Base Class for control hexagon
 */
var Base = (function () {
    function Base(gameID) {
        /**
         * Determine whether game is over or not
         * @type {boolean}
         */
        this.gameOver = false;
        /**
         * Brick colors.
         * I'm using function updateColors() in order to set it
         *
         * @type {string[]}
         */
        this.colors = [];
        /**
         * Will contain mobile status (boolean)
         * I will use it after isMobile checked status via RegEx
         */
        this.isMobileStatus = null;
        this.attachedBricks = [];
        var wHeight, wWidth;
        // Create main game paper
        this.$gamePaper = Snap(gameID);
        // calculate height of the paper
        wHeight = window.innerHeight - 10;
        wWidth = window.innerWidth;
        this.$gamePaper.node.style.height = wHeight + 'px';
        this.$gamePaper.node.style.width = wWidth + 'px';
        this.$field = {
            fieldEl: null,
            radius: this.calculateFieldRadius(wWidth, wHeight)
        };
        // Setting up basic data about control hexagon element
        this.$base = {
            baseEl: null,
            baseX: wWidth / 2,
            baseY: wHeight / 2,
            rotationTime: this.isMobile() ? 65 : 100,
            radius: this.$field.radius / 4.2,
            edgesNum: 6,
            startAngle: 0
        };
        this.drawBase();
        if (this.isMobile()) {
            this.addControllers();
        }
        else {
            this.bindEvents();
        }
        this.updateColors(1);
        this.$score = new Score(this);
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
        // base abd field should have closed path
        pathStrBase += "z";
        pathStrField += "z";
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
     * In order to make it more difficult - I'm adding different colors
     *
     * @param level {number}
     */
    Base.prototype.updateColors = function (level) {
        switch (level) {
            case 0:
            case 1:
                this.colors = ['ygreen', 'blue'];
                break;
            case 2:
                this.colors = ['ygreen', 'blue', 'orange'];
                break;
            case 3:
                this.colors = ['ygreen', 'blue', 'purple', 'orange'];
                break;
            default:
                this.colors = ['ygreen', 'blue', 'purple', 'orange', 'cyan'];
        }
    };
    Base.prototype.setNextBrickColor = function (nextColor) {
        if (this.isMobile()) {
            // Mobile is not fast therefore I'm using different concept
            this.$nextColorEl.node.setAttribute('class', nextColor);
        }
        else {
            var field = this.$field.fieldEl;
            var color;
            var filterDefinition;
            switch (true) {
                case nextColor == 'ygreen':
                    color = '#448C0A';
                    break;
                case nextColor == 'blue':
                    color = '#2F62B2';
                    break;
                case nextColor == 'purple':
                    color = '#9034BD';
                    break;
                case nextColor == 'orange':
                    color = '#DB8D25';
                    break;
                case nextColor == 'cyan':
                    color = '#17B4BA';
                    break;
                default:
                    color = '#CCCCCC';
            }
            filterDefinition = this.$gamePaper.filter(Snap.filter.shadow(0, 0, 7, color, 0.7));
            field.attr({
                filter: filterDefinition
            });
        }
    };
    /**
     * Attach new brick to the base
     *
     * @param newBrick
     */
    Base.prototype.attachBrick = function (newBrick) {
        this.attachedBricks.push(newBrick);
        this.processCombinations();
        this.checkIfGameOver();
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
     * After removing bricks could appear gap - other colors could be up the group of same color
     * I need to close this gap
     */
    Base.prototype.closeBrickGap = function () {
        var attachedBricks = this.attachedBricks;
        // I'm removing all attached brick, case I want to make them all to fall
        this.attachedBricks = [];
        for (var i = 0, len = attachedBricks.length; i < len; i++) {
            attachedBricks[i].startFalling();
        }
    };
    /**
     * Check if ne of brick stacks reached maximum.
     * If so - set this.gameOver to 'true'
     */
    Base.prototype.checkIfGameOver = function () {
        var filteredBricks;
        // ToDo: Check if one of brick stacks reached maximum -> game over
        // Filter all bricks by angle
        filteredBricks = this.filterBricksByAngle();
        for (var angle in filteredBricks) {
            var maxHeight = this.$field.radius;
            var currentHeight = 0;
            if (filteredBricks[angle].length > 1) {
                var brick = filteredBricks[angle][0].$brick;
                currentHeight = (brick.height + brick.gap) * filteredBricks[angle].length + this.$base.radius;
            }
            if (currentHeight >= maxHeight)
                this.gameOver = true;
        }
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
                    var removedBricks = [];
                    for (var i = 0, len = siblings.length; i < len; i++) {
                        var brick = filteredBricks[color][siblings[i]];
                        removedBricks.push(brick); // I'll need them to calculate score
                        brick.$brick.brickEl.node.setAttribute('class', brick.$brick.brickEl.node.getAttribute('class') + ' remove');
                        (function (brick) {
                            setTimeout(function () {
                                brick.$brick.brickEl.attr({ d: '' });
                            }, 1000);
                        })(brick);
                        this.removeAttachedBrickByID(brick.$brick.brickEl.id);
                    }
                    this.$score.updateScore(removedBricks);
                    this.closeBrickGap();
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
            var _angle = bricksArray[baseBrickID].normalizeAngle(_brick.anglePosition);
            if (_brick.radiusPosition == baseBrick.radiusPosition) {
                // Because I'm working with circle - nextBrickAngMin can be bigger then nextBrickAngMax
                // For example nextBrickAngMin is 360 and nextBrickAngMax is 60
                // It's mean that comparison should work through 0
                if (nextBrickAngMin < nextBrickAngMax && (_angle <= nextBrickAngMax && _angle >= nextBrickAngMin)) {
                    results.push(i);
                }
                else if (nextBrickAngMin > nextBrickAngMax) {
                    if ((_angle >= 0 && _angle <= nextBrickAngMax) || (_angle <= 360 && _angle >= nextBrickAngMin)) {
                        results.push(i);
                    }
                }
            }
            if (_angle == baseBrick.anglePosition && (_brick.radiusPosition <= nextBrickRadMax && _brick.radiusPosition >= nextBrickRadMin)) {
                results.push(i);
            }
        }
        results = Base.UniqArray(results);
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
     * Filter bricks by angle and return object of arrays
     * @returns {filteredBricks}
     */
    Base.prototype.filterBricksByAngle = function () {
        var attachedBricks = this.attachedBricks;
        var len = attachedBricks.length;
        var filteredBricks = {};
        for (var i = 0; i < len; i++) {
            var brick = attachedBricks[i];
            var angle = String(brick.$brick.anglePosition);
            if (!filteredBricks.hasOwnProperty(angle))
                filteredBricks[angle] = [];
            filteredBricks[angle].push(brick);
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
     * In case game was opened from mobile I need to add controllers
     */
    Base.prototype.addControllers = function () {
        var _this = this;
        var left = 50;
        var bottom = 60;
        var radius = 30;
        var wWidth = window.innerWidth;
        var wHeight = window.innerHeight;
        var leftCircle = this.$gamePaper.circle(left, wHeight - bottom, radius);
        var rightCircle = this.$gamePaper.circle(wWidth - left, wHeight - bottom, radius);
        leftCircle
            .addClass('controller')
            .click(function () {
            _this.fireLeft();
        });
        console.log(rightCircle);
        rightCircle
            .addClass('controller')
            .click(function () {
            _this.fireRight();
        });
        this.$nextColorEl = this.$gamePaper.circle(wWidth / 2, wHeight - bottom, radius / 2);
        this.$nextColorEl.node.id = 'next-color';
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
     * Check whether device is mobile or not
     *
     * @returns {boolean}
     */
    Base.prototype.isMobile = function () {
        if (this.isMobileStatus == null)
            this.isMobileStatus = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        return this.isMobileStatus;
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
    Base.prototype.calculateFieldRadius = function (wWidth, wHeight) {
        var radius;
        if (this.isMobile()) {
            radius = (wWidth - 10) / 2;
        }
        else {
            if (wWidth >= wHeight)
                radius = wHeight / 2;
            else
                radius = wWidth / 2;
        }
        return radius;
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
     * @param className {string} - optional
     * @param anglePosition {number}
     */
    function Brick(base, className, anglePosition, speed) {
        if (className === void 0) { className = 'ygreen'; }
        if (anglePosition === void 0) { anglePosition = -1; }
        if (speed === void 0) { speed = -1; }
        var radiusPos = base.$field.radius;
        var edgesNum = base.$base.edgesNum;
        var brickSpeed;
        this.$baseObjRef = base;
        if (speed != -1)
            brickSpeed = speed;
        else
            brickSpeed = base.isMobile() ? 10 : 5;
        this.$brick = {
            brickEl: null,
            className: className,
            speed: brickSpeed,
            radiusPosition: radiusPos,
            height: base.isMobile() ? 10 : 25,
            gap: 3,
            anglePosition: anglePosition > -1 ? anglePosition : 360 / edgesNum * Math.floor(Math.random() * edgesNum) // random number between 0 and edges amount
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
            this.$brick.brickEl.node.setAttribute('class', 'brick ' + this.$brick.className);
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
var Score = (function () {
    function Score(base) {
        this.$baseRefObj = base;
        this.$score = {
            scoreEl: null,
            currentScore: 0,
            currentSpeed: 5
        };
        this.drawScore();
    }
    Score.prototype.drawScore = function () {
        var score = this.$score;
        var x = this.$baseRefObj.$base.baseX;
        var y = this.$baseRefObj.$base.baseY;
        var clientWidth, clientHeight;
        // I need to draw text node in order to calculate it's dimensions
        if (score.scoreEl == null)
            score.scoreEl = this.$baseRefObj.$gamePaper.text(x, y, String(score.currentScore));
        else
            score.scoreEl.node.innerHTML = String(score.currentScore);
        score.scoreEl.node.setAttribute('class', 'base-score');
        // in Firefox i is s problem to fetch clientWidth and clientHeight
        // therefore I need to fix it
        clientWidth = score.scoreEl.node.clientWidth;
        clientHeight = score.scoreEl.node.clientHeight || 48;
        if (clientWidth == 0) {
            switch (true) {
                case score.currentScore < 10:
                    clientWidth = 24;
                    break;
                case score.currentScore < 100:
                    clientWidth = 46;
                    break;
                case score.currentScore < 1000:
                    clientWidth = 68;
                    break;
                default:
                    clientWidth = 90;
            }
        }
        // Now I can get it's real size
        x = x - clientWidth / 2;
        y = y + clientHeight / 4;
        score.scoreEl.node.setAttribute('x', x);
        score.scoreEl.node.setAttribute('y', y);
    };
    /**
     * Updating score base on amount of bricks that has been removed
     * @param removedBricks
     */
    Score.prototype.updateScore = function (removedBricks) {
        var score = this.$score;
        score.currentScore += removedBricks.length;
        switch (true) {
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
    };
    return Score;
})();
/// <reference path="Base_class.ts" />
/// <reference path="Brick_class.ts" />
/// <reference path="Score_class.ts" />
var base = new Base('#game');
/**
 * Real game
 * http://localhost/my-hextris/
 */
if (urlParam('isTest') != 'true') {
    new Brick(base, 'ygreen', 0);
    var nextColor = base.colors[Math.floor(Math.random() * base.colors.length)];
    base.setNextBrickColor(nextColor);
    var _interval;
    var gameStep = function () {
        var colors = base.colors;
        new Brick(base, nextColor);
        if (!!base.gameOver) {
            var $gameOver = document.getElementById('game-over');
            $gameOver.className += ' show';
            clearInterval(_interval);
        }
        nextColor = colors[Math.floor(Math.random() * colors.length)];
        base.setNextBrickColor(nextColor);
    };
    _interval = setInterval(gameStep, 1000);
    document.addEventListener("keydown", function (e) {
        // pressed 'p' button
        if (e.keyCode == 80)
            clearInterval(_interval);
    }, false);
}
/**
 * Test mode
 * http://localhost/my-hextris/?isTest=true
 */
if (urlParam('isTest') == 'true') {
    var bricksCount = 1;
    var _interval = setInterval(function () {
        var fallSpeed = 1;
        if (bricksCount < 3)
            new Brick(base, 'blue', 60, fallSpeed);
        else if (bricksCount == 3)
            new Brick(base, 'orange', 60, fallSpeed);
        else if (bricksCount == 4)
            new Brick(base, 'purple', 60, fallSpeed);
        else
            new Brick(base, 'blue', 120, fallSpeed);
        if (bricksCount++ > 5)
            clearInterval(_interval);
    }, 500);
}
function urlParam(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
//# sourceMappingURL=app.js.map