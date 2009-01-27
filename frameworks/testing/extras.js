// ==========================================================================
// Project:   SproutCore Unit Testing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

// additional methods for use with qunit

/**
  Converts the passed string into HTML and then appends it to the main body 
  element.  This is a useful way to automatically load fixture HTML into the
  main page.
*/
function htmlbody(string) {
  synchronize(function() {
    var html = Q$(string) ;
    var body = Q$('body')[0];
    html.each(function() { body.appendChild(this); });
  }) ;
}

/**
  Call this method instead of test() to temporarily disable a test. 
*/
function notest(name, callback, nowait) {
  
}

