var math = require('../utils/math');
var util = require('util');
var widget = require('../core/widget');
var extend = require('extend');

/**
 @class multislider
 Multiple vertical sliders in one interface.
 ```html
 <canvas nx="multislider"></canvas>
 ```
 <canvas nx="multislider" style="margin-left:25px"></canvas>
 */
function MultiSliderWidget(target, options) {
  options = extend(true, {
    defaultSize: {width: 100, height: 75},
    sliders: 15
  }, options);
  this.defaultSize = options.defaultSize;
  widget.call(this, target, options);

  /** @property {number} sliders Number of sliders in the multislider. (Must call .init() after changing this setting, or set with .setNumberOfSliders) */
  this.sliders = options.sliders;

  /** @property {Array}  val   Array of slider values. <br> **Note:** This widget's output is not .val! Transmitted output is:

   | &nbsp; | data
   | --- | ---
   | *(slider index)* | value of currently changed slider
   | list | all multislider values as list. (if the interface sends to js or node, this list will be an array. if sending to ajax, max7, etc, the list will be a string of space-separated values)

   */

  this.sliderClicked = 0;
  this.oldSliderToMove;
  this.init();
}
util.inherits(MultiSliderWidget, widget);
module.exports = MultiSliderWidget;

MultiSliderWidget.prototype.init = function () {
  this.val = [];
  for (var i = 0; i < this.sliders; i++) {
    this.val[i] = 0.7;
  }
  this.realSpace = {x: this.GUI.w, y: this.GUI.h};
  this.sliderWidth = this.realSpace.x / this.sliders;
  this.draw();
};

MultiSliderWidget.prototype.draw = function () {
  this.erase();
  var ctx = this.context;
  ctx.fillStyle = this.colors.fill;
  ctx.fillRect(0, 0, this.GUI.w, this.GUI.h);

  ctx.strokeStyle = this.colors.accent;
  ctx.fillStyle = this.colors.accent;
  ctx.lineWidth = 5;

  for (var i = 0; i < this.sliders; i++) {
    ctx.beginPath();
    ctx.moveTo(i * this.sliderWidth, this.GUI.h - this.val[i] * this.GUI.h);
    ctx.lineTo(i * this.sliderWidth + this.sliderWidth, this.GUI.h - this.val[i] * this.GUI.h);
    ctx.stroke();
    ctx.lineTo(i * this.sliderWidth + this.sliderWidth, this.GUI.h);
    ctx.lineTo(i * this.sliderWidth, this.GUI.h);
    ctx.globalAlpha = 0.3 - (i % 3) * 0.1;
    ctx.fill();
    ctx.closePath();
    ctx.globalAlpha = 1;
    //	var separation = i==this.sliders-1 ? 0 : 1;
    //	ctx.fillRect(i*this.sliderWidth, this.GUI.h-this.val[i]*this.GUI.h, this.sliderWidth-separation, this.val[i]*this.GUI.h)
  }
  this.drawLabel();
};

MultiSliderWidget.prototype.click = function () {
  this.oldSliderToMove = false;
  this.move(true);
};

MultiSliderWidget.prototype.move = function (firstclick) {
  if (this.clicked) {


    if (this.clickPos.touches.length > 1) {

      for (var i = 0; i < this.clickPos.touches.length; i++) {
        var sliderToMove = Math.floor(this.clickPos.touches[i].x / this.sliderWidth);
        sliderToMove = math.clip(sliderToMove, 0, this.sliders - 1);
        this.val[sliderToMove] = math.clip(math.invert((this.clickPos.touches[i].y / this.GUI.h)), 0, 1);
      }

    } else {

      var sliderToMove = Math.floor(this.clickPos.x / this.sliderWidth);
      sliderToMove = math.clip(sliderToMove, 0, this.sliders - 1);
      this.val[sliderToMove] = math.clip(math.invert(this.clickPos.y / this.GUI.h), 0, 1);

      if (this.oldSliderToMove && this.oldSliderToMove > sliderToMove + 1) {
        var missed = this.oldSliderToMove - sliderToMove - 1;
        for (var i = 1; i <= missed; i++) {
          this.val[sliderToMove + i] = this.val[sliderToMove] + (this.val[this.oldSliderToMove] - this.val[sliderToMove]) * ((i / (missed + 1)));
        }
      } else if (this.oldSliderToMove && sliderToMove > this.oldSliderToMove + 1) {
        var missed = sliderToMove - this.oldSliderToMove - 1;
        for (var i = 1; i <= missed; i++) {
          this.val[this.oldSliderToMove + i] = this.val[this.oldSliderToMove] + (this.val[sliderToMove] - this.val[this.oldSliderToMove]) * ((i / (missed + 1)));
        }
      }

    }
    this.draw();
  }
  var msg = {};
  msg[sliderToMove] = this.val[sliderToMove];
  if (this.destination == "js" || this.destination == "node") {
    msg["list"] = this.val;
  } else {
    msg["list"] = "";
    for (var key in this.val) { msg["list"] += this.val[key] + " " }
  }
  this.transmit(msg);
  this.oldSliderToMove = sliderToMove;

};

/** @method setNumberOfSliders
 @param {integer} [num] New number of sliders in the multislider */
MultiSliderWidget.prototype.setNumberOfSliders = function (numOfSliders) {
  this.sliders = numOfSliders;
  this.val = [];
  for (var i = 0; i < this.sliders; i++) {
    this.val.push(0.7);
  }
  this.sliderWidth = this.realSpace.x / this.sliders;
  this.init();
};

/** @method setSliderValue
 Sets a slider to new value and transmits.
 @param {integer} [slider] Slider to set (slider index starts at 0)
 @param {integer} [value] New slider value */
MultiSliderWidget.prototype.setSliderValue = function (slider, value) {
  this.val[slider] = value;
  this.draw();
  var msg = {};
  msg[slider] = this.val[slider];
  if (this.destination == "js" || this.destination == "node") {
    msg["list"] = this.val;
  } else {
    msg["list"] = "";
    for (var key in this.val) { msg["list"] += this.val[key] + " " }
  }
  this.transmit(msg);
};
