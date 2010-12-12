// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  Border between the two panes of the MasterDetail.

  Note that the border does NOT include any space on the sides. Space
  on left or right sides of MasterDetail, if any, should be handled by
  its layout.
 */
SC.BaseTheme.MASTER_DETAIL_DIVIDER_WIDTH = 1;

SC.BaseTheme.masterDetailRenderDelegate = SC.Object.create({
  name: 'master-detail',
  
  render: function(dataSource, context) {
    context.setClass('round-toolbars', SC.platform.touch);
  },
  
  update: function(dataSource, jquery) {
    jquery.setClass('round-toolbars', SC.platform.touch);    
  }
  
});