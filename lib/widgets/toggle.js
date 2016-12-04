var drawing = require('../utils/drawing');
var util = require('util');
var widget = require('../core/widget');

/**
 @class toggle
 On/off toggle
 ```html
 <canvas nx="toggle"></canvas>
 ```
 <canvas nx="toggle" style="margin-left:25px"></canvas>
 */

var toggle = module.exports = function (target) {
  this.defaultSize = {width: 50, height: 50};
  widget.call(this, target);

  /** @property {object}  val  Object containing the core interactive aspects of the widget, which are also its data output. Has the following properties:
   | &nbsp; | data
   | --- | ---
   | *value*| 1 if on, 0 if off
   */
  this.val = {
    value: 0
  };
  this.init();
};
util.inherits(toggle, widget);

toggle.prototype.init = function () {
  this.draw();
};

toggle.prototype.draw = function () {

  this.erase();

  var ctx = this.context;
  if (this.val.value) {
    ctx.fillStyle = this.colors.accent;
    //	ctx.strokeStyle = this.colors.white;
    //	ctx.strokeAlpha = 0.3
    ctx.strokeStyle = this.colors.accenthl;
    ctx.strokeAlpha = 1
  } else {
    ctx.fillStyle = this.colors.fill;
    ctx.strokeStyle = this.colors.border;
    ctx.strokeAlpha = 1
  }
  ctx.lineWidth = Math.sqrt(this.GUI.w) / 2;
  //ctx.lineWidth = this.GUI.w / 20;

  ctx.fillRect(0, 0, this.GUI.w, this.GUI.h);
  ctx.globalAlpha = ctx.strokeAlpha;
  ctx.strokeRect(lineWidth / 2, lineWidth / 2, this.GUI.w - lineWidth, this.GUI.h - lineWidth);
  ctx.globalAlpha = 1;

  this.drawLabel();

};

toggle.prototype.click = function () {
  if (!this.val.value) {
    this.val.value = 1;
  } else {
    this.val.value = 0;
  }
  this.draw();
  this.transmit(this.val);
};