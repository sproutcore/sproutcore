// ==========================================================================
// SproutCore -- JavaScript Application Framework
// copyright 2006-2007, Sprout Systems, Inc. and contributors.
// ==========================================================================

// These are basic enhancements to the string class used throughout 
// SproutCore.
// capitalize a string.
Object.extend(String.prototype,{

  // Capitalize a string.
  //
  // mode: optional.  'each' - capitalize each word. the default.
  //                  'first' - capitalize the first word only.
  
  capitalize: function(mode) {
    var words = (mode == 'first') ? this : this.split(' ') ;
    words = words.map(function(word) {
      if (word.length == 0) return word ;
      return word.charAt(0).toUpperCase() + word.substring(1) ;
    }) ;
    return words.join(' ') ;
  },

  // Interpolate string. looks for %@ or %@1; to control the order of params.
  format: function() {
    var args = $A(arguments) ;
    
    // first, replace any ORDERED replacements.
    var str = this.gsub(/%@([0-9]+)/, function(m) {
      return (args[parseInt(m[1],0)-1] || '').toString(); 
    }) ;

    // now, replace any remaining %@ items.  Use this indexOf() method b/c
    // it is faster than split().
    var ret = [] ;
    var idx = -1 ;
    var loc = 0 ;
    while((idx = str.indexOf("%@",loc)) >= 0) {
     // slice off initial part of string and push into ret. update loc.
     ret.push(str.slice(loc,idx)) ;
     loc = idx + 2 ; // 2 to skip '%@'.
     
     // add in replacement.
     ret.push(args.shift().toString()) ;
    }
    
    // include any remaining bits of the string.
    if (loc < str.length) {
      ret.push(str.slice(loc,str.length)) ;
    }
    
    // join return value.
    return (ret.length > 1) ? ret.join('') : ret[0] ;
  },

  // localize a string.  Also interpolates any items you pass just like
  // format().
  loc: function() {
    // NB: This could be implemented as a wrapper to locWithDefault() but
    // it would add some overhead to deal with the arguments and adds stack
    // frames, so we are keeping the implementation separate.
    
    var kit = String[String.currentLanguage()];
    var str = kit[this] ;
    if (!str) str = String.English[this] || this ;
    return str.format.apply(str,arguments) ;
  },
  
  // this works just like loc except it will return the first argument
  // as a default if the matching value is not found.
  locWithDefault: function(def) {
    var kit = String[String.currentLanguage()];
    var str = kit[this] ;
    if (!str) str = String.English[this] || def ;
    var args = $A(arguments) ;
    args.shift() ; // escape def.
    return str.format.apply(str, args) ;
  },
  
  classify: function() {
    return this.camelize().capitalize() ;
  },
  
  decamelize: function() { 
    return this.replace(/([a-z])([A-Z])/g,'$1_$2').toLowerCase();
  },

  dasherize: function() {
    return this.decamelize().replace(/[ _]/g,'-') ;  
  },
  
  humanize: function() {
    return this.decamelize().replace(/[-_]/g,' ') ;
  },
  
  toHref: function() {
    if (this.match(/.+@.+\...+/)) {
      return 'mailto:' + this;
    } else if (this.indexOf('http://') != 0 && this.indexOf('https://') !=0 && this.match(/[^.]+\.[^.]+/)) {
      return 'http://' + this;
    } else {
      return this;
    }
  },
  
  trim: function ()
  {
    return this.replace(/^\s+|\s+$/g,"");
  },
  
  strip: function()
  {
    return this.trim();
  }
  
}) ;

// Shorter alias of the format function.
String.prototype.fmt = String.prototype.format ;

// Add strings for various languages to this collection.  String.loc()
// method will try to localize the string passed using the current language.
// if the language is not available, it will use English.
Object.extend(String,{
  
  // Default language is English. Currently French, German, and Japanese are
  // detected. All other languages default to English.
  currentLanguage: function () {
    var browserLanguage = (navigator.language || navigator.browserLanguage).split('-', 1);
    switch(browserLanguage[0])
    {
      case 'fr':
        return 'French';
      case 'de':
        return 'German';
      case 'ja':
        return 'Japanese';
      default:
        return 'English'; 
    }
  }

});

String.English  = String.English  || {};
String.French   = String.French   || {};
String.German   = String.German   || {};
String.Japanese = String.Japanese || {};
