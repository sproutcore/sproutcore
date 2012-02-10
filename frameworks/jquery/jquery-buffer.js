// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// sc_require("jquery");
jQuery.Buffer = function() {

  var Buffer = function(elem) {
    if (elem) this.assign(elem);

    // the internal buffer
    this._bufferedCommandList = [];
    this._bufferedCommands = {};
  };

  // the set of buffers
  Buffer._buffers = [];
  Buffer._pool = [];

  /**
    If there is already a buffer for the element, returns that. Otherwise, creates a new one.
  */
  Buffer.bufferForElement = function(elem) {
    if (elem._jquery_buffer) {
      return elem._jquery_buffer;
    }
    return this.bufferFromPool().assign(elem);
  };

  Buffer.bufferFromPool = function() {
    var buffer = null;
    if (this._pool.length === 0) {
      buffer = new Buffer();
    } else {
      buffer = this._pool.pop();
    }

    // add buffer
    Buffer._buffers.push(buffer);
    if (!this.flushingScheduled) this.scheduleFlushing();
    return buffer;
  };

  Buffer.returnToPool = function(buffer) {
    buffer.unassign();
    this._pool.push(buffer);
  };

  Buffer.scheduleFlushing = function() {
    this.flushingScheduled = true;
  };

  /**
    Flushes all of the buffers.
  */
  Buffer.flush = function() {
    // get the buffers
    var buffers = this._buffers, idx, len = buffers.length;
    for (idx = 0; idx < len; idx++) {
      buffers[idx].flush();
      this.returnToPool(buffers[idx]);
    }
    this._buffers = [];
    this.flushingScheduled = false;
  };

  /**
    Assigns an element to a buffer.
  */
  Buffer.prototype.assign = function(elem) {
    if (this._el) this.unassign();

    this._el = elem;
    this._el._jquery_buffer = this;
    return this;
  };

  Buffer.prototype.unassign = function() {
    if (!this._el) return;
    this._el._jquery_buffer = undefined;
    this._el = undefined;
    return this;
  };

  /**
    Flushes a buffer.
  */
  Buffer.prototype.flush = function() {
    var commands = this._bufferedCommandList, len = commands.length, idx, c;
    for (idx = 0; idx < len; idx++) {
      // get command name
      c = commands[idx];

      // run command
      this[c](this._bufferedCommands[c]);

      // remove from set now that we have run it.
      delete this._bufferedCommands[c];
    }

    this._bufferedCommandList.length = 0;
    this.unassign();
  };

  Buffer.prototype.$ = function(selector, context) {
    if (!context) context = this._el;
    if (selector === "" || selector === undefined) {
      selector = context; context = undefined;
    }
    return jQuery(selector, context);
  };

  /**
    Gets the buffered command, adding it to a buffer if needed.
  */
  Buffer.prototype.bufferedCommand = function(command) {
    // creates the buffered command if needed
    if (!this._bufferedCommands[command]) {
      // sets up the hash for the command
      this._bufferedCommands[command] = {};
      this._bufferedCommandList.push(command);
    }

    // return the buffered commands
    return this._bufferedCommands[command];
  };

  Buffer.prototype.hasBufferedCommand = function(command) {
    return !!this._bufferedCommands[command];
  };

  /**
    Applies HTML.
  */
  Buffer.prototype.html = function(value) {
    var context = this.bufferedCommand("flushContent");
    if (value === undefined) return context.text || context.html || this.$().html();

    context.text = undefined;
    context.html = value;
  };

  Buffer.prototype.text = function(value) {
    var context = this.bufferedCommand("flushContent");
    if (value === undefined) return context.text || context.html || this.$().text();

    context.text = value;
    context.html = undefined;
  };

  Buffer.prototype.flushContent = function(context) {
    if (context.text !== undefined) this.$().text(context.text);
    else if (context.html !== undefined) this.$().html(context.html);
  };



  /**
    Handles attribute setting.
  */
  Buffer.prototype.attr = function(key, value) {
    // first handle the key-as-object scenario
    if (typeof key === "object") {
      for (var k in key) this.attr(k, key[k]);
      return;
    }

    // now, if it is a special key, handle it specially.
    if (key === "class") {
      // note: setClass will return the value if "value" is undefined.
      if (value === undefined) return this.setClass().join(' ');
      else {
        // if we have a string or array, we need to reset class names altogether
        if (typeof value === "string" || jQuery.isArray(value)) {
          var classNamesContext = this.bufferedCommand("flushClassNames");
          classNamesContext.classNames = this._hashFromClassNames(value);
          return;
        } else {
          // otherwise, hand it to setClass
          return this.setClass(value);
        }
      }
    } else if (key === "html") {
      return this.html(value);
    } else if (key === "text") {
      return this.text(value);
    } else if (key === 'style') {
      return this.resetStyles(value);
    }

    var context = this.bufferedCommand("flushAttributes");
    if (!context.attr) context.attr = {};
    context.attr[key] = value;
  };

  Buffer.prototype.flushAttributes = function(context) {
    var attr = context.attr, cq = this.$(), v;
    for (var key in attr) {
      if (!attr.hasOwnProperty(key)) continue;
      v = attr[key];
      if (v !== null) cq.attr(key, v);
      else cq.removeAttr(key);
    }
  };


  //
  // SUPPORT FOR CSS STYLES
  //
  Buffer.prototype._STYLE_REGEX = /-?\s*([^:\s]+)\s*:\s*([^;]+)\s*;?/g;

  Buffer.prototype._camelizeStyleName = function(name) {
    // IE wants the first letter lowercase so we can allow normal behavior
    var needsCap = name.match(/^-(webkit|moz|o)-/),
        camelized = name.camelize();

    if (needsCap) {
      return camelized.substr(0,1).toUpperCase() + camelized.substr(1);
    } else {
      return camelized;
    }
  };

  Buffer.prototype._dasherizeStyleName = function(name) {
    /*
      TODO This is in jQuery framework but its relying on dasherize,
            which is defined in Core Foundation
    */
    var dasherized = SC.String.dasherize(name);
    if (dasherized.match(/^(webkit|moz|ms|o)-/)) dasherized = '-'+dasherized;
    return dasherized;
  };

  Buffer.prototype._loadStyles = function(attr) {
    // parse style...
    if (!attr) attr = this.$().attr('style');

    if (attr && (attr = attr.toString()).length>0) {
      if(SC.browser.isIE){
        attr = attr.toLowerCase();
      }
      var styles = {};

      var regex = this._STYLE_REGEX, match;
      regex.lastIndex = 0;

      while(match = regex.exec(attr)) styles[this._camelizeStyleName(match[1])] = match[2];

      return styles;
    } else {
      return { };
    }
  };

  Buffer.prototype.resetStyles = function(styles) {
    var context = this.bufferedCommand("flushStyles");
    context._styles = this._loadStyles(styles || " ");
  };

  Buffer.prototype.styles = function() {
    var context = this.bufferedCommand("flushStyles");
    if (!context._styles) context._styles = this._loadStyles();
    return context._styles;
  };

  Buffer.prototype.css = function(key, value) {
    if (typeof key === "object") {
      for (var k in key) this.css(k, key[k]);
      return;
    }

    var context = this.bufferedCommand("flushStyles");
    if (!context._styles) context._styles = this._loadStyles();

    context._styles[key] = value;
  };

  Buffer.prototype.flushStyles = function(context) {
    var styles = context._styles;
    var str = "";

    var key, value, props = [], idx = 0;
    for (key in styles) {
      if (!styles.hasOwnProperty(key)) continue;
      value = styles[key];
      if (value === null) continue;
      if (typeof value === "number" && key !== 'zIndex' && key !== "fontWeight" && key !== "opacity") value += "px";

      props[idx++] = this._dasherizeStyleName(key) + ": " + value;
    }

    this.$().attr("style", props.join("; "));
  };

  //
  // SUPPORT FOR CLASS NAMES
  //
  Buffer.prototype._hashFromClassNames = function(classNames) {
    // split if needed
    if (typeof classNames === "string") classNames = classNames.split(" ");

    // and continue
    var idx, len = classNames.length, ret = {};
    for (idx = 0; idx < len; idx++) {
      ret[classNames[idx]] = true;
    }
    return ret;
  };

  Buffer.prototype.setClass = function(value, on) {
    var context = this.bufferedCommand("flushClassNames"), key;

    // if there is no value, that means we are trying to actually _get_ the class names.
    if (value === undefined) {
      if (!context.classNames) context.classNames = this._hashFromClassNames(this._el.className);

      var classNames = context.classNames, v = [];
      for (key in classNames) if (key && classNames[key]) v.push(key);
      return v;
    }

    // Hashes of key/values
    if (typeof value === "object") {
      if (!context.classNames) context.classNames = this._hashFromClassNames(this._el.className);

      // loop over class names and set it properly.
      for (key in value) {
        context.classNames[key] = value[key];
      }

      return;
    }

    // value is not a hash of class names and values, so "on" must either be
    // a boolean, or undefined meaning NO.
    if (!context.classNames) {
      context.classNames = this._hashFromClassNames(this._el.className);
    }

    context.classNames[value] = on || false;
  };

  Buffer.prototype.hasClass = function(className) {
    var context = this.bufferedCommand("flushClassNames");
    if (!context.classNames) context.classNames = this._hashFromClassNames(this._el.className);
    return !!context.classNames[className];
  };

  Buffer.prototype.addClass = function(value) {
    if (!value) return;

    var context = this.bufferedCommand("flushClassNames");
    if (!context.classNames) context.classNames = this._hashFromClassNames(this._el.className);

    if (typeof value === "string") value = value.split(' ');

    var idx, len = value.length;
    for (idx = 0; idx < len; idx++) context.classNames[jQuery.trim(value[idx])] = true;
  };

  Buffer.prototype.removeClass = function(value) {
    var context = this.bufferedCommand("flushClassNames");
    if (!context.classNames) context.classNames = this._hashFromClassNames(this._el.className);
    context.classNames[value] = false;
  };

  Buffer.prototype.resetClassNames = function(value) {
    var context = this.bufferedCommand("flushClassNames");
    context.classNames = {};
  };

  Buffer.prototype.flushClassNames = function(context) {
    var classNames = [];
    var c = context.classNames, k;
    for (k in c) if (c[k]) classNames.push(k)

    this.$().attr("class", classNames.join(" "));
  };


  /** DEBUGGING CODE */
  function dn(o) {
    for (var key in o) if (typeof o[key] === "function") o[key].displayName = key;
  }
  dn(Buffer);
  dn(Buffer.prototype);

  return Buffer;
}();
