// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.Renderer
  @since SproutCore 1.1
*/

SC.AceTheme.renderers.Slider = SC.BaseTheme.renderers.Slider.extend({
  renderSlider: function(context) {
    var blankImage = SC.BLANK_IMAGE_URL;
    context.push(
      '<span class="sc-track">',
        '<span class="sc-left"></span>',
        '<span class="sc-middle"></span>',
        '<span class="sc-right"></span>',
      '</span>',
      '<img src="', blankImage, '" class="sc-handle" style="left: ', this.value, '%" />'
    );
  }
});

SC.AceTheme.renderers.slider = SC.AceTheme.renderers.Slider.create();