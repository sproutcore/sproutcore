//@license
// ==========================================================================
// SproutCore -- JavaScript Application Framework
// copyright 2006-2008, Sprout Systems, Inc. and contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a 
// copy of this software and associated documentation files (the "Software"), 
// to deal in the Software without restriction, including without limitation 
// the rights to use, copy, modify, merge, publish, distribute, sublicense, 
// and/or sell copies of the Software, and to permit persons to whom the 
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in 
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
// DEALINGS IN THE SOFTWARE.
//
// For more information about SproutCore, visit http://www.sproutcore.com
//
//
// ==========================================================================
//@license

// ==========================================================================
// Utility Classes
// Author: Charles Jolley
// copyright 2006, Sprout Systems, Inc.
//
// This file contains a number of utility methods and classes used throughout
// SproutCore. This should be loaded after your load Prototype but before you
// load any other SproutCore objects.  In general, this is the only
// dependency most SproutCore objects will have.
//
// ==========================================================================

if (!window.SC) {
  /**
    @namespace
    
    All objects live in the SproutCore namespace, which is also availabe in the
    abbreviation SC.
  */
  SC = {};
  SproutCore = SC ;
}

// this makes for some nicer to read code
var YES = true ; var NO = false ;

// this is used by the JavascriptCompile class on the server side.  You can
// use this to automatically determine the order javascript files need to be
// included in.  On the client side, this is a NOP.
function require(file) { return null ; }

// implement window.console.log() for IE.
if (!window.console) { 
 window.console = { 
   _output: [],
   log: function(str) { this._output.push(str) ; },
   tail: function(lines) { 
     if (!lines) lines = 1 ;
     var loc = this._output.length - lines ;
     if (loc < 0) loc = 0 ;
     var ret = [] ;
     while(loc < this._output.length) {
       ret.push(this._output[loc]) ; loc++ ;
     }
     return ret.join("\n");
   }  
 } ;
}
window.logCount = 0 ;

// ........................................
// GENERAL UTILITIES
// 

Object.extend(SC,{

  _downloadFrames: 0, // count of download frames inserted into document
  
	download: function(path) {
    var tempDLIFrame=document.createElement('iframe');
    var frameId = 'DownloadFrame_' + this._downloadFrames;
    tempDLIFrame.setAttribute('id',frameId);
    tempDLIFrame.style.border='10px';
    tempDLIFrame.style.width='0px';
    tempDLIFrame.style.height='0px';
    tempDLIFrame.style.position='absolute';
    tempDLIFrame.style.top='-10000px';
    tempDLIFrame.style.left='-10000px';    
    // Don't set the iFrame content yet if this is Safari
    if (!(SC.isSafari())) {
      tempDLIFrame.setAttribute('src',path);
    }
    document.getElementsByTagName('body')[0].appendChild(tempDLIFrame);
    if (SC.isSafari()) {
      tempDLIFrame.setAttribute('src',path);    
    }
    this._downloadFrames = this._downloadFrames + 1;
    if (!(SC.isSafari())) {
      var r = function() { 
        document.body.removeChild(document.getElementById(frameId)); 
				frameId = null;
      } ;
      var t = r.invokeLater(null, 2000);
    }
		//remove possible IE7 leak
		tempDLIFrame = null;
	},
		
  // Call this method during setup of your app to queue up methods to be 
  // called once the entire document has finished loading.  If you call this
  // method once the document has already loaded, then the function will be
  // called immediately.
  callOnLoad: function(func) { 
    if (SC._onloadQueueFlushed) func.call(document);
    var queue = SC._onloadQueue || [] ;
    queue.push(func) ; SC._onloadQueue = queue ;
	queue = null;
  },

  // To flush the callOnLoad queue, you need to set window.onload=SC.didLoad
  didLoad: function() { 
    SC.app = SC.Application.create();
    SC.app.run();
    
    // set the current language
    var b = $tag('body');
    Element.addClassName(b, String.currentLanguage().toLowerCase()) ;

    // call the onloadQueue.
    var queue ;
    SC.runLoop.beginRunLoop() ;
    if (window.callOnLoad) {
      if (window.callOnLoad instanceof Array) {
        queue = window.callOnLoad ;
      } else if (window.callOnLoad instanceof Function) {
        queue = [window.callOnLoad] ;
      }
    } else queue = [] ;
    queue = queue.concat(SC._onloadQueue) ;
    var func = null ;
    while(func = queue.shift()) func.call(document) ;
    SC._onloadQueueFlushed = true ;
        
    // start the app; call main.
    if (window.main && (main instanceof Function)) main() ; // start app.
    
    // finally handle any routes if any.
    if (typeof Routes != 'undefined') {
      Routes.doRoutes() ; // old style.
    } else if (typeof SC.Routes != 'undefined') {
      SC.Routes.ping() ; // handle routes, if modules is installed.
    }
    
    SC.runLoop.endRunLoop();
		//remove possible IE7 leak
		b = null;
		queue = null;
		func = null;
  },
  
  // this will take a URL of any type and convert it to a fully qualified URL.
  normalizeURL: function(url) {
    if (url.slice(0,1) == '/') {
      url = window.location.protocol + '//' + window.location.host + url ;
    } else if ((url.slice(0,5) == 'http:') || (url.slice(0,6) == 'https:')) {
      // no change
    } else {
      url = window.location.href + '/' + url ;
    }
    return url ;
  },
  
  // use this instead of typeOf() to get the type of item.  The return values
  // are: 'string', 'number', 'function', 'class', 'object', 'hash', 'null', 
  // 'undefined', 'boolean'.  
  // 'object' will be returned for any items inheriting from SC.Object. 'hash' 
  // is any other type of object.
  typeOf: function(item) {
    if (item === undefined) return T_UNDEFINED ;
    if (item === null) return T_NULL ; 
    var ret = typeof(item) ;
    if (ret == "object") {
      if (item instanceof Array) {
        ret = T_ARRAY ;
      } else if (item instanceof Function) {
        ret = (item.isClass) ? T_CLASS : T_FUNCTION ;
      } else if (item instanceof SC.Error) {
        ret = T_ERROR ;        
      } else if (item.isObject === true) {
        ret = T_OBJECT ;
      } else ret = T_HASH ;
    } else if (ret === T_FUNCTION) ret = (item.isClass) ? T_CLASS : T_FUNCTION;
    return ret ;
  },
  
  isArray: function( obj )
  {
    return ($type(obj) === T_ARRAY) || (obj && obj.objectAt);
  },
  
  _nextGUID: 0, _numberGuids: [], _stringGuids: {},
  
  /**
    Returns a unique GUID for the object.  If the object does not yet have
    a guid, one will be assigned to it.  You can call this on any object,
    SC.Object-based or not, but be aware that it will add a _guid property.
    
    @param obj {Object} any object, string, number or primitive
    @returns {String} the unique guid for this instance.
  */
  guidFor: function(obj) {
    if (obj === undefined) return "(undefined)" ;
    if (obj === null) return '(null)' ;
    if (obj._guid) return obj._guid ;
    
    switch($type(obj)) {
      case T_NUMBER:
        return this._numberGuids[obj] = this._numberGuids[obj] || ("#" + obj);
        break ;
      case T_STRING:
        return this._stringGuids[obj] = this._stringGuids[obj] || ("$" + obj);
        break ;
      case T_BOOL:
        return (obj) ? "(true)" : "(false)" ;
        break;
      default:
        return obj._guid = ("@" + (SC._nextGUID++));
    }
  },

  /**
    Returns a unique hash code for the object.  If the object implements
    a hash() method, the value of that method will be returned.  Otherwise,
    this will return the same value as guidFor().  
    
    Unlike guidFor(), this method allows you to implement logic in your 
    code to cause two separate instances of the same object to be treated as
    if they were equal for comparisons and other functions.
    
    IMPORTANT:  If you implement a hash() method, it MUST NOT return a number
    or a string that contains only a number.  Typically hash codes are strings
    that begin with a "%".
    
    @param obj {Object} the object
    @returns {String} the hash code for this instance.
  */
  hashFor: function(obj) {
    return (obj && obj.hash && $type(obj.hash) === T_FUNCTION) ? obj.hash() : this.guidFor(obj) ;
  },

  /**
    This will compare the two object values using their hash codes.
    
    @param a {Object} first value to compare
    @param b {Object} the second value to compare
    @returns {Boolean} YES if the two have equal hash code values.
    
  */
  isEqual: function(a,b) {
    // shortcut a few places.
    if (a === null) {
      return b === null ;
    } else if (a === undefined) {
      return b === undefined ;
    
    // finally, check their hash-codes
    } else return SC.hashFor(a) === SC.hashFor(b) ;
  },

  /**
    Convenience method to inspect an object by converting it to a hash.
  */
  inspect: function(obj) {
    return $H(obj).inspect() ;  
  },
  
  /** Browser and Platform info. */
  Platform: {
    
    /** The current IE version number or 0 if not IE. */
    IE: function() {
      if (Prototype.Browser.IE) {
        return (navigator.appVersion.match(/\bMSIE.*7\.\b/)) ? 7 : 6 ;
      } else return 0 ;
    }(),
    
    /** The current Safari major version number of 0 if not Safari */
    Safari: function() {
      if (Prototype.Browser.WebKit) {
        var vers = parseInt(navigator.appVersion.replace(/^.*?AppleWebKit\/(\d+).*?$/,'$1'),0) ;
        return (vers > 420) ? 3 : 2 ;
      } return 0 ;
    }(),
    
    /** The current Firefox major version number or 0 if not Firefox */
    Firefox: function() {
      var ret = 0;
      if (Prototype.Browser.Gecko) {
        if(navigator.userAgent.indexOf("Firefox") != -1)
        {
          ret = parseFloat((navigator.userAgent.match(/Firefox\/(.)/)[1]) || 0);
        }
        if (ret < 1) ret = 2; // default to version 2 if it is a Gecko browser.
      } 
      return ret ;
    }(),    
      
    isWindows: function() {
      return !!(navigator.appVersion.match(/(Windows)/)) ;
    }(),
    
    isMac: function() {
      if(Prototype.Browser.Gecko) {
        return !!(navigator.appVersion.match(/(Macintosh)/));
      } else {
        return !!(navigator.appVersion.match(/(Mac OS X)/)) ;    
      }
    }()
    
  },
  
  // DEPRECATED.  here for compatibility only.
  /** @private */
  isIE: function() { 
    return SC.Platform.IE > 0 ;
  },

  /** @private */
  isSafari: function() {
    return SC.Platform.Safari > 0 ;
  },
  
  /** @private */
  isSafari3: function() {
    return SC.Platform.Safari >= 3 ;
  },
  
  /** @private */
  isIE7: function() {
    return SC.Platform.IE >= 7 ;
  },

  /** @private */
  isIE6: function() {
    return (SC.Platform.IE >= 6) && (SC.Platform.IE < 7) ;
  },

  /** @private */
  isWindows: function() {
    return SC.Platform.isWindows;
  },

  /** @private */
  isMacOSX: function() {
    return SC.Platform.isMac ;
  },
  
  /** @private */
  isFireFox: function() {
    return SC.Platform.Firefox > 0 ;
  },
  
  /** @private */
  isFireFox2: function() {
    return SC.Platform.Firefox >= 2 ;
  }
  
});

/** @deprecated  Use guidFor() instead. */
SC.getGUID = SC.guidFor ;

// Save the Platform.Browser name.
SC.Platform.Browser = function() {
  if (SC.Platform.IE >0) {
    return 'IE';
  } else if (SC.Platform.Safari > 0) {
    return 'Safari';
  } else if (SC.Platform.Firefox >0) {
    return 'Firefox'; 
  }
}() ;

T_ERROR = 'error' ;
T_OBJECT = 'object' ;
T_NULL = 'null';
T_CLASS = 'class' ;
T_HASH = 'hash' ;
T_FUNCTION = 'function' ;
T_UNDEFINED = 'undefined' ;
T_NUMBER = 'number' ;
T_BOOL = 'boolean' ;
T_ARRAY = 'array' ;
T_STRING = 'string' ;

$type = SC.typeOf ;

$I = SC.inspect ;

Object.extend(Object,{

  // this will serialize a general JSON object into a URI.
  serialize: function(obj) {
    var ret = [] ;
    for(var key in obj) {
      var value = obj[key] ;
      if (typeof value == 'number') { value = '' + value ; }
      if (!(typeof value == 'string')) { value = value.join(','); }
      ret.push(encodeURIComponent(key) + "=" + encodeURIComponent(value)) ;
    }
    return ret.join('&') ;
  }
  
}) ;


// This will add or remove the class name based on the flag, allowing you to
// treat it like a bool setting.  Simplifies the common case where you need
// to make a class name match a bool.
Element.setClassName = function(element,className,flag) {
  if(SC.isIE())
  {
    if (flag) { 
      Element.addClassName(element,className); 
    } else {
      Element.removeClassName(element,className) ;
    }
  } 
  else
  {
    if (flag) { 
      element.addClassName(className); 
    } else {
      element.removeClassName(className) ;
    }
  } 
} ;

// ........................................
// EVENT EXTENSIONS
// 
Object.extend(Event,{
  // get the character code for key pressed events.
  getCharCode: function(e) {
    return (e.keyCode) ? e.keyCode : ((e.which)?e.which:0) ; 
  },
  
  // get the pressed char as a string.
  getCharString: function(e) {
    return String.fromCharCode(Event.getCharCode(e)) ;
  },
  
  pointerLocation: function(event) {
    var ret = {
      x: event.pageX || (event.clientX +
        (document.documentElement.scrollLeft || document.body.scrollLeft)),
      y: event.pageY || (event.clientY +
        (document.documentElement.scrollTop || document.body.scrollTop))
      
    };
    return ret ;
  },
  
  ALT_KEY: '_ALT',
  CTRL_KEY: '_CTRL',
  SHIFT_KEY: '_SHIFT'
  
});

