// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.Renderer
  @since SproutCore 1.1
*/
SC.BaseTheme.Disclosure = SC.Renderer.extend({
  name: 'disclosure',

  classNames: {
    'sc-disclosure': YES
  },

  sizes: [
    { name: SC.SMALL_CONTROL_SIZE, height: 14 },
    { name: SC.REGULAR_CONTROL_SIZE, height: 16 }
  ],


  render: function(context) {
    sc_super();

    var state = this.classNames.contains('sel') ? "open" : "closed";
    context.push('<img src="' + SC.BLANK_IMAGE_URL + '" class="disclosure button ' + state + '" />');
  },

  update: function(query) {
    this.updateClassNames(query);

    var state = this.classNames.contains('sel') ? "open" : "closed",
        elem = query.find("img");

    elem.setClass("open", state);
    elem.setClass("closed", !state);
    elem.setClass("active", this.isActive);
  }
});

SC.BaseTheme.addRenderer(SC.BaseTheme.Disclosure);
