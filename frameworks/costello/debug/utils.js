// extra utils imported from SC just to get Qunit working. :-(

String.prototype.camelize = function() {
  var ret = this.replace(SC.STRING_TITLEIZE_REGEXP, 
    function(str,separater,character) { 
      return (character) ? character.toUpperCase() : '' ;
    }) ;
  var first = ret.charAt(0), lower = first.toLowerCase() ;
  return (first !== lower) ? (lower + ret.slice(1)) : ret ;
};

String.prototype.trim = function () {
  return this.replace(/^\s+|\s+$/g,"");
} ;

String.prototype.fmt = function() {
  // first, replace any ORDERED replacements.
  var args = arguments;
  var idx  = 0; // the current index for non-numerical replacements
  return this.replace(/%@([0-9]+)?/g, function(s, argIndex) {
    argIndex = (argIndex) ? parseInt(argIndex,0)-1 : idx++ ;
    s =args[argIndex];
    return ((s===null) ? '(null)' : (s==undefined) ? '' : s).toString(); 
  }) ;
} ;

Array.prototype.uniq = function() {
  var ret = [], len = this.length, item, idx ;
  for(idx=0;idx<len;idx++) {
    item = this[idx];
    if (ret.indexOf(item) < 0) ret.push(item);
  }
  return ret ;
};
