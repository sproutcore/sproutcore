// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same */

/**
*/
SC.ArrayTest = {
  
  create: function(desc, ArrayClass) {
    var ret = SC.beget(this).mixin({ ArrayClass: ArrayClass }),
        key, func;
    
    module(desc || ArrayClass.toString(), {
      setup: function() { ret.setup.call(ret); },
      teardown: function() { ret.teardown.call(ret); }
    });
    
    for(key in ret) {
      if (!ret.hasOwnProperty(key)) continue ;

      // make sure it looks like a test
      func = ret[key];
      if (key.indexOf(" ")<0) continue;
      if (SC.typeOf(func) !== SC.T_FUNCTION) continue ;
      
      test(key, function() { func.call(ret); }) ;
    }
    
  }
}