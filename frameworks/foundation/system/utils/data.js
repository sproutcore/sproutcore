// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.mixin({
  /**
    Returns a copy of the passed data that is stripped of internal SproutCore properties
    such as _sc_guid* properties.
  */
  stripInternalProperties: function(content) {
    // we need to sanitize hashes. Arrays could have hashes, so those too.
    if(SC.typeOf(content) === SC.T_ARRAY){
      var len = content.length;

      var arr = [];
      for(var i=0;i<len;i++){
        arr.push(this.sanitizeContent(content[i]));
      }

      return arr;
    } else if (SC.typeOf(content) === SC.T_HASH) {
      //Must be hash
      var hash = {};
      for (var key in content) {
        if (key === SC.guidKey) continue;
        hash[key] = this.sanitizeContent(content[key]);
      }
      return hash;
    }

    return content;
  }
});
