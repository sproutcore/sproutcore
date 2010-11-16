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

SC.BaseTheme.Slider = SC.Renderer.extend({
  name: 'slider',

  sizes: [
    { name: SC.SMALL_CONTROL_SIZE, height: 14 },
    { name: SC.REGULAR_CONTROL_SIZE, height: 16 },
    { name: SC.JUMBO_CONTROL_SIZE, height: 22 }
  ],

  render: function(context) {
    this.renderClassNames(context);

    var blankImage = SC.BLANK_IMAGE_URL;
    context.push('<span class="sc-inner">',
                  '<span class="sc-leftcap"></span>',
                  '<span class="sc-rightcap"></span>',
                  '<img src="', blankImage, 
                  '" class="sc-handle" style="left: ', this.value, '%" />',
                  '</span>');

    this.resetChanges();
  },

  update: function(cq) {
    this.updateClassNames(cq);
    if (this.didChange('value')) {
      cq.find(".sc-handle").css('left', this.value + "%");
    }

    this.resetChanges();
  }

});

SC.BaseTheme.addRenderer(SC.BaseTheme.Slider);
