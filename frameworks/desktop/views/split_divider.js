// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/split_child');
sc_require('mixins/split_thumb');

/**
  @class

  A SplitDividerView sits between any two other views in a SplitView.
  The SplitDivider mixes in SC.SplitThumb to allow the user to drag
  it around. The dragging process will cause SC.SplitView to adjust
  other children as needed.

  @extends SC.View
  @author Alex Iskander
*/
SC.SplitDividerView = SC.View.extend(SC.SplitChild, SC.SplitThumb,
/** @scope SC.SplitDividerView.prototype */ {

  /** @private */
  classNames: ['sc-split-divider-view'],

  /** @private */
  classNameBindings: ['layoutDirection'],
  
  /**
    Walks like a duck. Used and maintained by SC.SplitView to keep track
    of which of its childViews are dividers.

    @type Boolean
  */
  isSplitDivider: YES,

  /**
    The layout direction of the parent SplitView. May be SC.LAYOUT_VERTICAL
    or SC.LAYOUT_HORIZONTAL. This property is also added as a class on this
    view.
    
    You generally will not set this property yourself; it is managed by the
    parent SplitView.

    @type String
    @default SC.LAYOUT_HORIZONTAL
   */
  layoutDirection: SC.LAYOUT_HORIZONTAL,

  /** @private
    This indicates that the view should not resize while being dragged; this
    is generally the desired behavior.

    (NOTE: SC.FIXED_SIZE is hard-coded here. It is defined on SC.SplitView,
    which requires this file.)
   */
  autoResizeStyle: 'sc-fixed-size',

  movesSibling: SC.MOVES_CHILD,
  
  size: SC.propertyFromRenderDelegate('dividerSize', 10),

  renderDelegateName: 'splitDividerRenderDelegate'
});
