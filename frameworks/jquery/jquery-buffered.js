/*global Buffer */
sc_require("jquery.js");
sc_require("jquery-buffer");

(function() {

// Create Buffer Constructor
jQuery.buffer = jQuery.bufferedJQuery = function(selector, context) {
  return new jQuery.bufferedJQuery.prototype.init(selector, context);
};

// Base it on jquery
var T = function() { };
T.prototype = jQuery.fn;
jQuery.bufferedJQuery.prototype = new T();

// relay init properly
jQuery.bufferedJQuery.prototype.init = function(selector, context) {
  return jQuery.fn.init.call(this, selector, context);
};

// set prototype of init to the buffer prototype.
jQuery.bufferedJQuery.prototype.init.prototype = jQuery.bufferedJQuery.prototype;

/**
  Actually subclass jQuery now.
*/
var base = jQuery.fn;

jQuery.fn.extend({
  
  /**
    Returns an array of buffers for the elements. This is mostly here for illustration; the
    built-in buffered commands inline the logic for performance.
  */
  buffers: function() {
    var len = this.length, i, r = [];
    for (i = 0; i < len; i++) {
      r.push(jQuery.Buffer.bufferForElement(this[i]));
    }
    return r;
  }
  
});

jQuery.extend(jQuery.bufferedJQuery.prototype, {
  
  html: function(value) {
    // if there is no value, we don't handle it.
    if (value === undefined) return jQuery.fn.html.apply(this, arguments);
    
    // there is a vlaue. We are going to do it like jquery, but different.
    // in this, we inline "buffers" above
    var len = this.length, i;
    for (i = 0; i < len; i++) {
      var buffer = jQuery.Buffer.bufferForElement(this[i]);
      buffer.html(value);
    }
    return this;
  },
  
  text: function(value) {
    if (value === undefined) return jQuery.fn.text.apply(this, arguments);
    
    // there is a vlaue. We are going to do it like jquery, but different.
    // in this, we inline "buffers" above
    var len = this.length, i;
    for (i = 0; i < len; i++) {
      var buffer = jQuery.Buffer.bufferForElement(this[i]);
      buffer.text(value);
    }
    return this;
  },
  
  attr: function(key, value) {
    // first, handle the get-case
    if (typeof value === "undefined" && typeof key === "string") return jQuery.fn.html.apply(this, arguments);
    
    // now, buffer the command.
    var len = this.length, i;
    for (i = 0; i < len; i++) {
      var buffer = jQuery.Buffer.bufferForElement(this[i]);
      buffer.attr(key, value);
    }
    return this;
  },
  
  setClass: function(value, on) {
    // now, buffer the command.
    var len = this.length, i;
    for (i = 0; i < len; i++) {
      var buffer = jQuery.Buffer.bufferForElement(this[i]);
      buffer.setClass(value, on);
    }
    return this;
  },
  
  addClass: function(value) {
    // now, buffer the command.
    var len = this.length, i;
    for (i = 0; i < len; i++) {
      var buffer = jQuery.Buffer.bufferForElement(this[i]);
      buffer.addClass(value);
    }
    return this;
  },
  
  removeClass: function(value) {
    // now, buffer the command.
    var len = this.length, i;
    for (i = 0; i < len; i++) {
      var buffer = jQuery.Buffer.bufferForElement(this[i]);
      buffer.removeClass(value);
    }
    return this;
  },
  
  clearClassNames: function() {
    // now, buffer the command.
    var len = this.length, i;
    for (i = 0; i < len; i++) {
      var buffer = jQuery.Buffer.bufferForElement(this[i]);
      buffer.clearClassNames();
    }
    return this;
  }
  
});



})();