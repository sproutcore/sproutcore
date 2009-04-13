// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
*/
SC.ArrayTest = {
  
  create: function(ArrayClass) {
    SC.beget(this).mixin({ ArrayClass: ArrayClass }).generate();
  }
}