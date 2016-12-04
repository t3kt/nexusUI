var math = require('../utils/math');
var util = require('util');
var widget = require('../core/widget');

/**
 @class remix (alpha)

 ```html
 <canvas nx="remix"></canvas>
 ```
 <canvas nx="remix" style="margin-left:25px"></canvas>
 */

var remix = module.exports = function (target) {

  this.defaultSize = {width: 400, height: 150};
  widget.call(this, target);

  //define unique attributes
  this.maxLength = 2000;
  this.components = [];
  this.buffer = [];
  this.moment = 0;
  this.val = {
    x: 0.15,
    y: 0.5
  };
  this.rate = 1;
  this.start = 0;
  this.end = 1;
  this.size = 0;
  this.looping = false;
  this.boundLog = this.log.bind(this);
  this.init();

  this.boundAdv = this.advance.bind(this);
  nx.aniItems.push(this.boundAdv)

};

util.inherits(remix, widget);


remix.prototype.init = function () {
  this.draw();
};

//sets a new component to be recorded
remix.prototype.connect = function (target) {
  var compIndex = this.components.length;
  this.components.push(target);
  target.tapeNum = compIndex;
  target.isRecording = true;
  target.recorder = this;
  this.buffer[compIndex] = {};
  for (var key in target.val) {
    this.buffer[compIndex][key] = [];
  }

};

//the actual recording function
remix.prototype.write = function (index, val) {
  if (this.moment >= this.maxLength) {
    this.stop();
  }
  for (var key in val) {
    if (this.buffer[index][key]) {
      this.buffer[index][key][this.moment] = val[key];
    }
  }
  this.draw();
};


remix.prototype.draw = function () {
  var ctx = this.context;

  ctx.fillStyle = this.colors.fill;
  ctx.fillRect(0, 0, this.GUI.w, this.GUI.h);

  var nodeWid;
  if (this.moment >= 0) {
    nodeWid = this.GUI.w / this.moment
  } else {
    nodeWid = this.GUI.w;
  }
  var nodeDrawWid = 5;

  var nodeX = this.moment * nodeWid + this.lineWidth / 2;
  var nodeY;

  if (!this.recording) {
    ctx.strokeStyle = this.colors.accent;
    ctx.lineWidth = 1;

    for (var i = 0; i < this.buffer.length; i++) {
      for (var key in this.buffer[i]) {
        for (var j = 0; j < this.buffer[i][key].length; j++) {
          var pnodeX = (j - 1) * nodeWid;
          var pnodeY = Math.abs(this.buffer[i][key][j - 1] - 1) * (this.GUI.h);

          nodeX = j * nodeWid;
          nodeY = Math.abs(this.buffer[i][key][j] - 1) * (this.GUI.h);

          ctx.beginPath();
          ctx.moveTo(pnodeX, pnodeY);
          ctx.lineTo(nodeX, nodeY);
          ctx.stroke();
          ctx.closePath();

        }
      }

    }
  } else {

    ctx.font = "bold " + this.GUI.h / 3 + "px gill sans";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#F00";
    ctx.fillText("rec", this.GUI.w / 2, this.GUI.h / 2);
  }
};

remix.prototype.record = function () {
  this.moment = 0;
  nx.aniItems.push(this.boundLog);
  this.recording = true;
};

remix.prototype.log = function () {
  for (var i = 0; i < this.components.length; i++) {
    var sender = this.components[i];
    this.write(sender.tapeNum, sender.val);
  }
  this.moment++;
};

remix.prototype.stop = function () {
  nx.removeAni(this.boundLog);
  this.size = this.moment;
  this.recording = false;
  this.draw();
};

remix.prototype.scan = function (x) {
  this.needle = x * this.size;
  this.needle = nx.clip(this.needle, 0, this.size - 1);
  if (this.needle) {
    for (var i = 0; i < this.components.length; i++) {
      var sender = this.components[i];
      for (var key in this.buffer[sender.tapeNum]) {
        if (this.buffer[sender.tapeNum][key]) {
          var val = {};
          var max = this.buffer[sender.tapeNum][key][~~this.needle + 1] ? this.buffer[sender.tapeNum][key][~~this.needle + 1] : this.buffer[sender.tapeNum][key][~~this.needle];
          val[key] = nx.interp(this.needle - ~~this.needle, this.buffer[sender.tapeNum][key][~~this.needle], max);
          sender.set(val, true)
        }
      }
    }
  }
};

remix.prototype.play = function (rate, start, end) {
  rate ? this.rate = rate : null;
  if (start) {
    this.needle = start * this.size;
    this.start = start;
  } else {
    this.needle = 0;
    this.start = 0;
  }
  end ? this.end = end : this.end = 1;
  this.playing = true;
};

remix.prototype.loop = function () {

};

remix.prototype.advance = function () {
  if (this.playing) {
    this.needle += this.rate;
    if (this.needle / this.size < this.end) {
      this.scan(this.needle / this.size);
    } else if (this.looping) {
      this.needle = this.start;
    } else {
      this.playing = false;
    }
  }
};


remix.prototype.click = function (e) {
  if (this.size) {
    this.scan(this.clickPos.x / this.GUI.w)
  }
};


remix.prototype.move = function (e) {
  if (this.size) {
    this.scan(this.clickPos.x / this.GUI.w)
  }
};