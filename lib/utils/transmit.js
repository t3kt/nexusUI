exports.defineTransmit = function(protocol) {

  if (typeof(protocol) == "function") {
    return protocol;
  }
  switch (protocol) {
    case 'js':
      return function (data, passive) {
        this.makeOSC(this.emit, data, passive);
        this.emit('*', data, passive);
      };

    case 'ajax':
      return function (data) {
        this.makeOSC(exports.ajaxTransmit, data);
      };

    case 'node':
      return function (data) {
        this.makeOSC(exports.nodeTransmit, data);
      };

    case 'ios':
      return function (data) {

      };

    case 'max':
      return function (data) {
        this.makeOSC(exports.maxTransmit, data);
      };

    case 'wc':
      return function (data, passive) {
        this.emit('internal', data, passive);
      };
  }
};

exports.setGlobalTransmit = function(protocol) {
  var newTransmit = exports.defineTransmit(protocol);
  this.transmit = newTransmit;
  this.destination = protocol;
  for (var key in nx.widgets) {
    this.widgets[key].transmit = newTransmit;
    this.widgets[key].destination = protocol;
  }
};

exports.setWidgetTransmit = function(protocol) {
  this.transmit = exports.defineTransmit(protocol);
  this.destination = protocol
};


exports.ajaxTransmit = function(subPath, data) {

    var oscPath = subPath=='value' ? this.oscPath : this.oscPath+"/"+subPath;
     
    var xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST",nx.ajaxPath,true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send('oscName='+oscPath+'&data='+data);

};

exports.setAjaxPath = function(path) {
  this.ajaxPath = path;
};

exports.nodeTransmit = function(subPath, data) {
   
    var msg = {
      oscName: subPath=='value' ? this.oscPath : this.oscPath+"/"+subPath,
      value: data
    };
    socket.emit('nx', msg)

};

exports.maxTransmit = function (subPath, data) {
    var oscPath = subPath=='value' ? this.oscPath : this.oscPath+"/"+subPath;
    window.max.outlet(oscPath + " " + data);
};