var math = require('../utils/math');
var drawing = require('../utils/drawing');
var util = require('util');
var widget = require('../core/widget');

/**
 @class multitouch
 Multitouch 2d-slider with up to 5 points of touch.
 ```html
 <canvas nx="multitouch"></canvas>
 ```
 <canvas nx="multitouch" style="margin-left:25px"></canvas>
 */

var multitouch = module.exports = function (target) {

  this.defaultSize = {width: 200, height: 200};
  widget.call(this, target);

  //unique attributes
  this.nodeSize = this.GUI.w / 10;

  /** @property {object}  val
   | &nbsp; | data
   | --- | ---
   | *touch1.x* | x position of first touch
   | *touch1.y* | y position of first touch
   | *touch2.x* | x position of second touch (if 2 touches)
   | *touch2.y* | y position of second touch (if 2 touches)
   | *etc* | &nbsp;
   */
  this.val = {
    touch1: {
      x: 0,
      y: 0
    }
  };

  this.nodes = [];

  /** @property {string}  text  Text that will show when object is static */
  this.text = "multitouch";

  this.rainbow = ["#00f", "#04f", "#08F", "0AF", "0FF"];

  /** @property {string}  mode   "normal" or "matrix" mode. "matrix" mode has a GUI of discrete touch areas.
   */
  this.mode = "normal";

  /** @property {integer}  rows   How many rows in the matrix (matrix mode only)
   */
  this.rows = 10;

  /** @property {integer}  cols   How many rows in the matrix (matrix mode only)
   */
  this.cols = 10;

  /** @property {array}  matrixLabels  An array of strings that can provide text labels on cells of the matrix. If shorter than the matrix cells, the array will repeat.
   ```
   this.mode = "matrix"
   this.matrixLabels = [ "A", "A#", "B", "C" ]
   this.init();
   ```
   */
  this.matrixLabels = false;

  this.init();
};
util.inherits(multitouch, widget);

multitouch.prototype.init = function () {
  this.nodeSize = this.GUI.w / 10;
  this.draw();
};

multitouch.prototype.draw = function () {
  this.erase();
  var ctx = this.context;
  ctx.fillStyle = this.colors.fill;
  ctx.fillRect(0, 0, this.GUI.w, this.GUI.h);

  var count = 0;

  if (this.mode == "matrix") {
    for (var j = 0; j < this.rows; j++) {
      for (var i = 0; i < this.cols; i++) {
        ctx.beginPath();
        ctx.fillStyle = this.colors.accent;
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = 1;
        var circx = i * this.GUI.w / this.cols + (this.GUI.w / this.cols) / 2;
        var circy = j * this.GUI.h / this.rows + (this.GUI.h / this.rows) / 2;
        ctx.arc(circx, circy, (this.GUI.h / this.rows) / 2, 0, Math.PI * 2, true);
        ctx.stroke();
        ctx.fillStyle = this.colors.border;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (this.matrixLabels) {
          ctx.fillText(this.matrixLabels[count % this.matrixLabels.length], circx, circy);
          count++
        }
        var thisarea = {
          x: i * this.GUI.w / this.cols,
          y: j * this.GUI.h / this.rows,
          w: this.GUI.w / this.cols,
          h: this.GUI.h / this.rows
        };
        if (this.clickPos.touches.length >= 1) {
          for (var k = 0; k < this.clickPos.touches.length; k++) {
            if (drawing.isInside(this.clickPos.touches[k], thisarea)) {
              ctx.globalAlpha = 0.5;
              ctx.fillStyle = this.colors.accent;
              ctx.fill();
              ctx.globalAlpha = 0.3;
              ctx.fillStyle = this.rainbow[k];
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          }
        }
        ctx.closePath();
      }
    }
  } else {
    if (this.clickPos.touches.length >= 1) {
      for (var i = 0; i < this.clickPos.touches.length; i++) {

        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.fillStyle = this.colors.accent;
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = this.lineWidth;
        ctx.arc(this.clickPos.touches[i].x, this.clickPos.touches[i].y, this.nodeSize, 0, Math.PI * 2, true);
        ctx.fill();
        //	ctx.stroke();
        ctx.closePath();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.fillStyle = this.rainbow[i];
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = this.lineWidth;
        ctx.arc(this.clickPos.touches[i].x, this.clickPos.touches[i].y, this.nodeSize, 0, Math.PI * 2, true);
        ctx.fill();
        //	ctx.stroke();
        ctx.closePath();
        ctx.globalAlpha = 1;
      }
      ctx.clearRect(0, this.GUI.h, this.GUI.w, this.height - this.GUI.h);
    } else {
      this.setFont();
      ctx.fillStyle = this.colors.border;
      ctx.fillText(this.text, this.GUI.w / 2, this.GUI.h / 2);
      ctx.globalAlpha = 1;
    }
  }
  this.drawLabel();
};

multitouch.prototype.click = function () {
  this.draw();
  this.sendit();
};

multitouch.prototype.move = function () {
  if (this.clicked) {
    this.draw();
    this.sendit();
  }
};

multitouch.prototype.release = function () {

  if (!this.clicked) {
    this.clickPos.touches = [];
    for (var i = 0; i < 5; i++) {
      this.val["touch" + i] = {
        x: 0,
        y: 0
      }
    }
    this.transmit(this.val);
  }

  this.draw();
  this.sendit();

};

multitouch.prototype.sendit = function () {
  this.val = {};
  for (var i = 0; i < this.clickPos.touches.length; i++) {
    this.val["touch" + i] = {
      x: this.clickPos.touches[i].x / this.canvas.width,
      y: math.invert(this.clickPos.touches[i].y / this.canvas.height)
    }
  }
  this.transmit(this.val);
};