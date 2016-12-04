var util = require('util');
var widget = require('../core/widget');

/**
 @class string
 Animated model of a plucked string interface.
 ```html
 <canvas nx="string"></canvas>
 ```
 <canvas nx="string" style="margin-left:25px"></canvas>
 */

var string = module.exports = function (target) {
  this.defaultSize = {width: 150, height: 75};
  widget.call(this, target);

  /** @property {object}  val  Object containing the core interactive aspects of the widget, which are also its data output. Has the following properties:
   | &nbsp; | data
   | --- | ---
   | *string* | Index of the string that is plucked (starts at 0)
   | *x* | Where on the string the pluck occured (float 0-1);
   */
  this.val = {
    string: 0,
    x: 0
  };
  /** @property {integer}  numberOfStrings How many strings in the widget. We recommend setting this property with .setStrings() */
  this.numberOfStrings = 10;
  this.strings = [];
  this.abovestring = [];
  /** @property {integer}  friction  How quickly the string slows down */
  this.friction = 1;

  var stringdiv;

  this.init();

  nx.aniItems.push(this.draw.bind(this));
};
util.inherits(string, widget);

string.prototype.init = function () {
  var stringdiv = this.GUI.h / (this.numberOfStrings + 1);
  for (var i = 0; i < this.numberOfStrings; i++) {
    this.strings[i] = {
      x1: this.lineWidth,
      y1: stringdiv * (1 + i),
      x2: this.GUI.w - this.lineWidth,
      y2: stringdiv * (i + 1),
      held: false, // whether or not it's gripped
      vibrating: false, // whether or not its vibrating
      force: 0, // amount of force of pull on string
      maxstretch: 0, // vibration cap (in Y domain)
      stretch: 0, // current point vibrating in y domain
      direction: 0, // which direction it's vibrating
      above: false // is mouse above or below string
    };
  }
  this.draw();
};

string.prototype.pulse = function () {
  this.draw();
};

/* @method setStrings Sets how many strings are in the widget.
 ```js
 string1.setStrings(20);
 ```
 */
string.prototype.setStrings = function (val) {
  this.numberOfStrings = val;
  this.strings = [];
  this.init();
};

string.prototype.draw = function () {
  this.erase();
  var ctx = this.context;
  ctx.strokeStyle = this.colors.border;
  ctx.fillStyle = this.colors.fill;
  ctx.lineWidth = this.lineWidth;
  //	ctx.stroke();
  ctx.fillRect(0, 0, this.GUI.w, this.GUI.h);
  ctx.strokeStyle = this.colors.accent;

  for (var i = 0; i < this.strings.length; i++) {

    var st = this.strings[i];

    if (st.vibrating) {
      if (st.maxstretch < 0) {
        st.vibrating = false;
        st.held = false;
      }
      st.stretch = st.stretch + st.direction;

      if (Math.abs(st.stretch) > st.maxstretch) {
        //st.direction *= (-0.99);
        st.direction *= -1;
        st.stretch = st.stretch + st.direction;
        st.maxstretch = st.maxstretch - this.friction;

        st.direction = (st.direction / Math.abs(st.direction)) * (st.maxstretch / 1)
      }

      ctx.beginPath();
      ctx.moveTo(st.x1, st.y1);
      ctx.quadraticCurveTo(this.GUI.w / 2, st.y1 + st.stretch, st.x2, st.y2);
      ctx.stroke();
      ctx.closePath();
      st.on = true;


    } else if (st.held) {
      //will draw rounded
      //if mouse is higher than string and gripup
      //or if mouse is
      //	if (this.clickPos.y-st.y1<0 && st.gripup || this.clickPos.y-st.y1>0 && !st.gripup) {
      ctx.beginPath();
      ctx.moveTo(st.x1, st.y1);
      ctx.quadraticCurveTo(this.clickPos.x, this.clickPos.y, st.x2, st.y2);
      ctx.stroke();
      ctx.closePath();
      st.on = true;
      /*	} else {
       ctx.beginPath();
       ctx.moveTo(st.x1, st.y1);
       ctx.lineTo(st.x2, st.y2);
       ctx.stroke();
       ctx.closePath();
       } */
    } else {
      ctx.beginPath();
      ctx.moveTo(st.x1, st.y1);
      ctx.lineTo(st.x2, st.y2);
      ctx.stroke();
      ctx.closePath();
      if (st.on) {
        st.on = false;
      }
    }
  }
  this.drawLabel();
};

string.prototype.click = function () {
  for (var i = 0; i < this.numberOfStrings; i++) {
    this.strings[i].above = (this.clickPos.y < this.strings[i].y1);
  }
  this.draw();
};

string.prototype.move = function () {
  if (this.clicked) {
    for (var i = 0; i < this.strings.length; i++) {

      //if crosses string
      if (this.strings[i].above != (this.clickPos.y < this.strings[i].y1)) {
        this.strings[i].held = true;
        this.strings[i].above ^= true;
      }

      if (this.strings[i].held && Math.abs(this.clickPos.y - this.strings[i].y1) > this.GUI.h / (this.strings.length * 3)) {

        this.pluck(i)

      }
    }
  }
};

string.prototype.release = function () {
  for (var i = 0; i < this.strings.length; i++) {
    if (this.strings[i].held) {
      this.pluck(i);
    }
  }
};

string.prototype.pluck = function (which) {
  var i = which;
  this.val = {
    string: i,
    x: this.clickPos.x / this.GUI.w
  };
  this.transmit(this.val);
  this.strings[i].held = false;
  this.strings[i].force = this.clickPos.y - this.strings[i].y1;
  this.strings[i].maxstretch = Math.abs(this.clickPos.y - this.strings[i].y1);
  this.strings[i].stretch = this.clickPos.y - this.strings[i].y1;
  this.strings[i].vibrating = true;
  this.strings[i].direction = (this.clickPos.y - this.strings[i].y1) / Math.abs(this.clickPos.y - this.strings[i].y1) * ((this.clickPos.y - this.strings[i].y1) / -1.2);
};

string.prototype.customDestroy = function () {
  nx.removeAni(this.draw.bind(this));
};