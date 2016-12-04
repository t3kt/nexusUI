var util = require('util');
var widget = require('../core/widget');

// panel for max duplication -- maybe this object is unnecessary.

var panel = module.exports = function (target) {
  this.defaultSize = {width: 100, height: 100};
  widget.call(this, target);
};
util.inherits(panel, widget);

panel.prototype.init = function () {
  this.draw();
};

panel.prototype.draw = function () {
  this.erase();
  this.makeRoundedBG();
  var ctx = this.context;
  ctx.fillStyle = this.colors.border;
  ctx.lineWidth = this.lineWidth;
  ctx.fill();
};