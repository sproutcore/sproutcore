// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.THREE_SLICE = ['left', 'middle', 'right'];

SC.NINE_SLICE = [
  'top-left', 'top', 'top-right', 
  'left', 'middle', 'right', 
  'bottom-left', 'bottom', 'bottom-right'
];

/**
  Renders and updates the HTML representation of a multi-sliced scalable
  image.
  
  This RenderDelegate expects its data source to have the following properties:
  
  - slices: an array of slices to include, in the form of 
    ['top-left', 'top', 'top-right', 'left', 'middle', 'right', 
    'bottom-left', 'bottom', 'bottom-right']
  
  The RenderDelegate also accepts two SC constants as data sources:
  SC.THREE_SLICE and SC.NINE_SLICE.
*/
SC.BaseTheme.slicesRenderDelegate = SC.Object.create({
  /**
    Called when we need to create the HTML that represents the slices.

    @param {SC.Object} dataSource the object containing the information on how to render the slices.
    For this RenderDelegte, may also be one of the SC Slicing constants.
    
    @param {SC.RenderContext} context the render context instance
  */
  render: function(dataSource, context) {
    var slices = dataSource.length ? dataSource : dataSource.get('slices');
    
    for (var idx = 0, len = slices.length; idx < len; idx++) {
      context.push('<div class="' + slices[idx] + '"></div>');
    }
  },

  /**
    This render delegate does not update. If you want to update the slices,
    re-render.

    @param {SC.Object} dataSource the object containing the information on how to render.
    @param {SC.RenderContext} jquery the jQuery object representing the HTML representation of the slices
  */
  update: function(dataSource, jquery) {
  }
});
