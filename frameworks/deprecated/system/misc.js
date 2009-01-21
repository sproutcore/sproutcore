// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('application/routes') ;

// Legacy.  Will retire.
SC.mixin(Object,
/** @scope Object */ {

  /** @deprecated
   Serialize a general JSON object into a URI.  This method of encoding is 
   no longer supported or recommended.
  */
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

/** @deprecated
  This will add or remove the class name based on the flag, allowing you to
  treat it like a bool setting.  Simplifies the common case where you need
  to make a class name match a bool.
  
  Since SproutCore no long requires the Prototype library, this extension to
  Prototype is also no longer supported.  You can use setClassName() on 
  SC.ClassicView, or the sproutcore-jquery framework instead.
*/
Element.setClassName = function(element,className,flag) {
  if(SC.browser.isIE)
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


SC.Routes = SC.routes;
SC.Routes.addRoute = SC.routes.add;
