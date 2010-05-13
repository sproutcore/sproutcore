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
SC.BaseTheme.renderers.Disclosure = SC.Renderer.extend({
  
  init: function(settings) {
    this.attr(settings);
  },
  
  render: function(context) {
    var state = this.state === SC.BRANCH_OPEN ? "open" : "closed";
    context.push('<img src="' + SC.BLANK_IMAGE_URL + '" class="disclosure button ' + state + '" />');
  },
  
  update: function(context) {
    var state = this.state === SC.BRANCH_OPEN ? "open" : "closed",
        elem = this.$();
    
    elem.setClass("open", state === "open");
    elem.setClass("closed", state !== "closed");
  }
  
});

SC.BaseTheme.renderers.disclosure = SC.BaseTheme.renderers.Disclosure.create();