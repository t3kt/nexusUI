var math = require('../utils/math');
var util = require('util');
var widget = require('../core/widget');

/**
 @class wheel
 Circular wheel *in progress*
 ```html
 <canvas nx="wheel"></canvas>
 ```
 <canvas nx="wheel" style="margin-left:25px"></canvas>
 */

var wheel = module.exports = function (target) {
  this.defaultSize = {width: 100, height: 100};
  widget.call(this, target);

  //define unique attributes
  this.circleSize = 1;
  this.dial_position_length = 6;
  if (this.GUI.w < 101 || this.GUI.w < 101) {
    this.accentWidth = this.lineWidth * 1;
  } else {
    this.accentWidth = this.lineWidth * 2;
  }

  /** @property {float}  val    Index of spoke that crosses threshold<br>
   */
  this.val = 0.5;
  this.responsivity = 0.005;

  this.speed = 0.05;
  this.spokes = 10;
  this.rotation = 0;
  this.points = [];
  this.friction = 0.995;
  this.init();
};
util.inherits(wheel, widget);

wheel.prototype.init = function () {

  //adjust wheel to fit canvas
  this.circleSize = (Math.min(this.center.x, this.center.y) - this.lineWidth);

  this.draw();

  nx.aniItems.push(this.spin.bind(this));
};

wheel.prototype.draw = function () {

  var ctx = this.context;
  ctx.clearRect(0, 0, this.GUI.w, this.GUI.h);
  ctx.strokeStyle = this.colors.border;
  ctx.fillStyle = this.colors.fill;
  ctx.lineWidth = this.lineWidth;

  //draw main circle
  ctx.beginPath();
  ctx.arc(this.center.x, this.center.y, this.circleSize - 5, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.closePath();


  //draw points
  for (var i = 0; i < this.spokes; i++) {
    var dot = math.toCartesian(this.circleSize - 5, ((i / this.spokes) * Math.PI * 2) - this.rotation + (Math.PI * 2) / (this.spokes * 2));
    ctx.beginPath();
    ctx.arc(dot.x + this.center.x, dot.y + this.center.y, 5, 0, Math.PI * 2, false);
    ctx.fillStyle = this.colors.accent;
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.globalAlpha = 0.2;
    ctx.moveTo(this.center.x, this.center.y * 1);
    ctx.lineTo(dot.x + this.center.x, dot.y + this.center.y);
    ctx.strokeStyle = this.colors.accent;
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.closePath();
  }


  /*	ctx.lineWidth = this.lineWidth*2
   ctx.fillStyle = this.colors.fill;
   ctx.strokeStyle = this.colors.accent;
   ctx.strokeRect(this.center.x-3, 3, 6, this.circleSize)
   ctx.fillRect(this.center.x-3, 3, 6, this.circleSize)

   */

  //draw circle in center
  ctx.beginPath();
  ctx.fillStyle = this.colors.fill;
  ctx.strokeStyle = this.colors.accent;
  //		ctx.moveTo(this.center.x-8,this.center.y);
  //		ctx.lineTo(this.center.x,this.center.y-15);
  //		ctx.lineTo(this.center.x+8,this.center.y);
  ctx.stroke();
  ctx.fill();
  ctx.closePath();


  //draw circle in center
  ctx.beginPath();
  ctx.fillStyle = this.colors.fill;
  ctx.arc(this.center.x, this.center.y * 1, this.circleSize / 12, 0, Math.PI * 2, false);
  ctx.stroke();
  ctx.fill();
  ctx.closePath();


  this.drawLabel();
};

wheel.prototype.click = function (e) {

  this.lastRotation = this.rotation;
  this.speed = 0;
  this.grabAngle = this.rotation % (Math.PI * 2);
  this.grabPos = math.toPolar(this.clickPos.x - this.center.x, this.clickPos.y - this.center.y).angle

};

wheel.prototype.move = function () {

  this.lastRotation2 = this.lastRotation;
  this.lastRotation = this.rotation;

  this.rotation = math.toPolar(this.clickPos.x - this.center.x, this.clickPos.y - this.center.y).angle + this.grabAngle - this.grabPos;
  this.draw();

  if (this.rotation < 0) { this.rotation += Math.PI * 2 }
  if (this.rotation > Math.PI * 2) { this.rotation -= Math.PI * 2 }

  if (this.lastRotation > Math.PI * 1.5 && this.rotation < Math.PI * 0.5 && this.val != 0) {
    this.val = 0;
    this.transmit(this.val)
  } else if (this.lastRotation < Math.PI * 0.5 && this.rotation > Math.PI * 1.5 && this.val != 0) {
    this.val = 0;
    this.transmit(this.val)
  } else {
    for (var i = 0; i < this.spokes; i++) {
      console.log(this.rotation);
      if (this.rotation - (i / this.spokes) * Math.PI * 2 > 0 && this.lastRotation - (i / this.spokes) * Math.PI * 2 < 0) {
        this.val = i;
        this.transmit(this.val)
      }
      if (this.rotation - (i / this.spokes) * Math.PI * 2 < 0 && this.lastRotation - (i / this.spokes) * Math.PI * 2 > 0) {
        this.val = i;
        this.transmit(this.val)
      }
    }
  }

};

wheel.prototype.release = function () {
  this.speed = ((this.rotation - this.lastRotation) + (this.lastRotation - this.lastRotation2)) / 2;
};

wheel.prototype.spin = function () {
  this.lastRotation2 = this.lastRotation;
  this.lastRotation = this.rotation;

  this.rotation += this.speed;
  this.speed *= this.friction;

  this.draw();
  this.rotation = this.rotation % (Math.PI * 2);

  if (this.rotation < 0) { this.rotation += Math.PI * 2 }
  if (this.rotation > Math.PI * 2) { this.rotation -= Math.PI * 2 }

  if (this.lastRotation > Math.PI * 1.5 && this.rotation < Math.PI * 0.5) {
    this.val = 0;
    this.transmit(this.val)
  } else if (this.lastRotation < Math.PI * 0.5 && this.rotation > Math.PI * 1.5) {
    this.val = 0;
    this.transmit(this.val)
  } else {
    for (var i = 0; i < this.spokes; i++) {
      if (this.rotation - (i / this.spokes) * Math.PI * 2 > 0 && this.lastRotation - (i / this.spokes) * Math.PI * 2 < 0) {
        this.val = i;
        this.transmit(this.val)
      }
      if (this.rotation - (i / this.spokes) * Math.PI * 2 < 0 && this.lastRotation - (i / this.spokes) * Math.PI * 2 > 0) {
        this.val = i;
        this.transmit(this.val)
      }
    }
  }


};