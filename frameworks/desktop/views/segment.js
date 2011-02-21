// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/**
  @class

  SegmentViews are the views used and arranged by SC.SegmentedView and are very similar to a SC.ButtonView
  without any event handling.  The event handling is done by the parent view.

  @extends SC.View
  @since SproutCore 1.5
*/
SC.SegmentView = SC.View.extend(SC.Control, {

  classNames: ['sc-segment-view'],

  /* SC.View */
  toolTip: null,

  /* SC.Control (note: this brings its own display properties: 'isEnabled', 'isSelected', 'isActive', 'controlSize') */
  isEnabled: YES,

  isActive: NO,

  isSelected: NO,

  controlSize: null,

  /* SC.Button (note: we don't actually mix this in, because it doesn't define displayProperties or renderMixin) */
  title: '',

  value: null,

  icon: null,

  localize: NO,

  keyEquivalent: null,

  // TODO: Modification currently unsupported in SegmentedView
  escapeHTML: YES,

  // TODO: Modification currently unsupported in SegmentedView
  needsEllipsis: YES,

  /* SC.ButtonView */
  // TODO: Modification currently unsupported in SegmentedView (this may be deprecated in SC.ButtonView and should also be so here)
  supportFocusRing: NO,

  /* SC.View */
  renderDelegateName: 'segmentRenderDelegate',

  useStaticLayout: YES,

  // TODO: isDefault, isCancel, value not really used by render delegate
  displayProperties: ['icon', 'title', 'value', 'displayToolTip', 'isDefault', 'isCancel', 'width', 'isFirstSegment', 'isMiddleSegment', 'isLastSegment', 'isOverflowSegment', 'index'],

  /* SC.SegmentView */

  /**
    The width of the segment.

    @property {Number}
  */
  width: null,

  /**
    The item represented by this view.

    @property {Object || SC.Object}
  */
  localItem: null,

  /**
    Whenever the width property changes, adjust our layout accordingly.
    */
  widthDidChange: function() {
    this.adjust('width', this.get('width'));
  }.observes('width'),

  /**
    Update our properties according to our matching item.
  */
  updateItem: function(parentView, item) {
    var itemKeys = parentView.get('itemKeys'),
        itemKey,
        viewKeys = parentView.get('viewKeys'),
        viewKey,
        i;

    for (i = itemKeys.get('length') - 1; i >= 0; i--) {
      itemKey = parentView.get(itemKeys.objectAt(i));
      viewKey = viewKeys.objectAt(i);

      // Don't overwrite the default value if none exists in the item
      if (!SC.none(item.get(itemKey))) this.set(viewKey, item.get(itemKey));
    }

    this.set('localItem', item);
  }
});
