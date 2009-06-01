// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

// test
var SC = SC || {} ; 

SC.mapDisplayNames = function(obj, level, path, seen) {
  if (!SC.browser.safari) return ;
  if (obj === undefined) obj = window;
  if (level === undefined) level = 0;
  if (path === undefined) path = [];
  if (seen === undefined) seen = [];
  
  if (level > 5 || seen.indexOf(obj)>=0) return ; // nothing to do
  seen.push(obj);
  
  var loc = path.length, str, val, t;
  path[loc] = '';
  
  for(var key in obj) {
    if (obj.hasOwnProperty && !obj.hasOwnProperty(key)) continue ;
    if (!isNaN(Number(key))) continue ; // skip array indexes
    if (key === "constructor") continue ;
    if (key === "superclass") continue ;
    if (key === "document") continue ;
    
    val = obj[key];
    if (key === "SproutCore") key = "SC";
    t   = SC.typeOf(val);
    if (t === SC.T_FUNCTION) {
      if (!val.displayName) { // only name the first time it is encountered
        path[loc] = key ;
        str = path.join('.').replace('.prototype.', '#');
        val.displayName = str;
      }
      
      // handle constructor-style
      if (val.prototype) {
        path.push("prototype");
        SC.mapDisplayNames(val.prototype, level+1, path, seen);
        path.pop();
      }
      
    } else if (t === SC.T_CLASS) {
      path[loc] = key ;
      SC.mapDisplayNames(val, level+1, path, seen);
      
    } else if ((key.indexOf('_')!==0) && (t===SC.T_OBJECT || t===SC.T_HASH)) {
      path[loc] = key ;
      SC.mapDisplayNames(val, level+1, path, seen);
    }
  }
  
  path.pop(); 
  
};

