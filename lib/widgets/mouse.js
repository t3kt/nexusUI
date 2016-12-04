var util = require('util');
var widget = require('../core/widget');
var math = require('../utils/math');

/**
 @class mouse
 Mouse tracker, relative to web browser window.
 ```html
 <canvas nx="mouse"></canvas>
 ```
 <canvas nx="mouse" style="margin-left:25px"></canvas>
 */

var mouse = module.exports = function (target) {

  this.defaultSize = {width: 98, height: 100};
  widget.call(this, target);

  /** @property {object}  val
   | &nbsp; | data
   | --- | ---
   | *x* | x value of mouse relative to browser
   | *y* | y value of mouse relative to browser
   | *deltax* | x change in mouse from last position
   | *deltay* | y change in mouse from last position
   */
  this.val = {
    x: 0,
    y: 0,
    deltax: 0,
    deltay: 0
  };
  this.inside = {};
  this.boundmove = this.preMove.bind(this);
  this.mousing = window.addEventListener("mousemove", this.boundmove, false);

  this.init();
};
util.inherits(mouse, widget);

mouse.prototype.init = function () {

  this.inside.height = this.GUI.h;
  this.inside.width = this.GUI.w;
  this.inside.left = 0;
  this.inside.top = 0;
  this.inside.quarterwid = (this.inside.width) / 4;

  this.draw();
};

mouse.prototype.draw = function () {
  this.erase();

  var ctx = this.context;
  ctx.fillStyle = this.colors.fill;
  ctx.fillRect(0, 0, this.GUI.w, this.GUI.h);

  var scaledx = -(this.val.x) * this.GUI.h;
  var scaledy = -(this.val.y) * this.GUI.h;
  var scaleddx = -(this.val.deltax) * this.GUI.h - this.GUI.h / 2;
  var scaleddy = -(this.val.deltay) * this.GUI.h - this.GUI.h / 2;

  ctx.fillStyle = this.colors.accent;
  ctx.fillRect(this.inside.left, this.inside.height, this.inside.quarterwid, scaledx);
  ctx.fillRect(this.inside.quarterwid, this.inside.height, this.inside.quarterwid, scaledy);
  ctx.fillRect(this.inside.quarterwid * 2, this.inside.height, this.inside.quarterwid, scaleddx);
  ctx.fillRect(this.inside.quarterwid * 3, this.inside.height, this.inside.quarterwid, scaleddy);

  ctx.globalAlpha = 1;
  ctx.fillStyle = this.colors.fill;
  ctx.textAlign = "center";
  ctx.font = this.GUI.w / 7 + "px " + this.font;
  /*  ctx.fillText("x", this.inside.quarterwid*0 + this.inside.quarterwid/2, this.GUI.h-7);
   ctx.fillText("y", this.inside.quarterwid*1 + this.inside.quarterwid/2, this.GUI.h-7);
   ctx.fillText("dx", this.inside.quarterwid*2 + this.inside.quarterwid/2, this.GUI.h-7);
   ctx.fillText("dy", this.inside.quarterwid*3 + this.inside.quarterwid/2, this.GUI.h-7);
   */
  ctx.globalAlpha = 1;

  this.drawLabel();
};

mouse.prototype.move = function (e) {
  this.val = {
    deltax: e.clientX / window.innerWidth - this.val.x,
    deltay: math.invert(e.clientY / window.innerHeight) - this.val.y,
    x: e.clientX / window.innerWidth,
    y: math.invert(e.clientY / window.innerHeight)
  };
  this.draw();
  this.transmit(this.val);

};

mouse.prototype.customDestroy = function () {
  window.removeEventListener("mousemove", this.boundmove, false);
};