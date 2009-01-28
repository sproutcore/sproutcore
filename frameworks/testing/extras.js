// ==========================================================================
// Project:   SproutCore Unit Testing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global Q$ synchronize */
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
    
    // first, find the first element with id 'htmlbody-begin'  if exists,
    // remove everything after that to reset...
    var begin = Q$('body #htmlbody-begin')[0];
    if (!begin) {
      begin = Q$('<div id="htmlbody-begin"></div>')[0];
      body.appendChild(begin);
    } else {
      while(begin.nextSibling) body.removeChild(begin.nextSibling);
    }
    begin = null; 
    
    // now append new content
    html.each(function() { body.appendChild(this); });
  }) ;
}

/**
  Call this method instead of test() to temporarily disable a test. 
*/
function notest(name, callback, nowait) {
  
}

