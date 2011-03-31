// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/** @class */

SC.CheckboxSupport = /** @scope SC.CheckboxSupport.prototype */{
  didCreateLayer: function() {
    this.$('input').change(jQuery.proxy(function() {
      SC.RunLoop.begin();
      this.notifyPropertyChange('value');
      SC.RunLoop.end();
    }, this));
  },

  value: function(key, value) {
    if (value !== undefined) {
      this.$('input').attr('checked', value);
    } else {
      value = this.$('input').attr('checked');
    }

    return value;
  }.property().idempotent()
};

