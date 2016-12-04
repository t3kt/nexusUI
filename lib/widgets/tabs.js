var math = require('../utils/math');
var util = require('util');
var widget = require('../core/widget');

/**
 @class tabs

 ```html
 <canvas nx="tabs"></canvas>
 ```
 <canvas nx="tabs" style="margin-left:25px"></canvas>
 */

var tabs = module.exports = function (target) {

  this.defaultSize = {width: 150, height: 50};
  widget.call(this, target);

  //define unique attributes
  this.choice = 0;
  this.val = {
    index: 0,
    text: ""
  };
  this.tabwid = 0;
  this.options = ["one", "two", "three"];
  //init
  this.init();

};

util.inherits(tabs, widget);


tabs.prototype.init = function () {
  this.draw();
};


tabs.prototype.draw = function () {

  var ctx = this.context;

  ctx.fillStyle = this.colors.fill;
  ctx.fillRect(0, 0, this.GUI.w, this.GUI.h);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "normal " + this.GUI.h / 5 + "px courier";

  this.tabwid = this.GUI.w / this.options.length;

  var tabcol, textcol;
  for (var i = 0; i < this.options.length; i++) {
    if (i == this.choice) {
      tabcol = this.colors.accent;
      textcol = this.colors.white;
    } else {
      tabcol = this.colors.fill;
      textcol = this.colors.black;
      ctx.globalAlpha = 0.7;
    }
    ctx.fillStyle = tabcol;
    ctx.fillRect(this.tabwid * i, 0, this.tabwid, this.GUI.h);
    if (i != this.options.length - 1) {
      ctx.beginPath();
      ctx.moveTo(this.tabwid * (i + 1), 0);
      ctx.lineTo(this.tabwid * (i + 1), this.GUI.h);
      ctx.lineWidth = 1;
      ctx.strokeStyle = this.colors.border;
      ctx.stroke();
      ctx.closePath()
    }
    ctx.fillStyle = textcol;
    ctx.font = this.fontSize + "px " + this.font;
    ctx.fillText(this.options[i], this.tabwid * i + this.tabwid / 2, this.GUI.h / 2)

  }
};


tabs.prototype.click = function () {
  this.choice = ~~(this.clickPos.x / this.tabwid);
  this.val = {
    index: this.choice,
    text: this.options[this.choice]
  };
  this.transmit(this.val);
  this.draw();
};